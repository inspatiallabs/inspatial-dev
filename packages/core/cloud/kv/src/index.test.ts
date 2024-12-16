import { assertEquals, assertRejects, assertExists } from "@std/assert";
import {
  inSpatialKV,
  setKV,
  getKV,
  getManyKV,
  deleteKV,
  listKV,
  atomic,
  transaction,
  createKVQueueProcessor,
  watchKV,
  createKVWatcher,
  type KvSchema,
} from "./index.ts";

// Define the schema types
type UserSchema = {
  key: ["user", number];
  schema: {
    id: string;
    name: string;
    email: string;
  };
};

type PostSchema = {
  key: ["post", string];
  schema: {
    title: string;
    content: string;
    authorId: string;
  };
};

type TagsSchema = {
  key: ["tags", string];
  schema: string[];
};

type CounterSchema = {
  key: ["counter", string];
  schema: { value: number };
};

// Combine schemas into single type
type TestSchema = [UserSchema, PostSchema, TagsSchema, CounterSchema];

Deno.test("InSpatial KV Tests", async (t) => {
  const kv = await inSpatialKV.create<TestSchema>();

  await t.step("Basic CRUD Operations", async (t) => {
    await t.step("should create and retrieve a user", async () => {
      const user: UserSchema["schema"] = {
        id: "user1",
        name: "John Doe",
        email: "john@example.com",
      };

      await setKV(kv, ["user", 1], user);
      const result = await getKV(kv, ["user", 1]);

      assertExists(result.value);
      assertEquals(result.value, user);
    });

    await t.step("should update a user", async () => {
      const updatedUser: UserSchema["schema"] = {
        id: "user1",
        name: "John Updated",
        email: "john@example.com",
      };

      await setKV(kv, ["user", 1], updatedUser);
      const result = await getKV(kv, ["user", 1]);

      assertExists(result.value);
      assertEquals(result.value.name, "John Updated");
    });

    await t.step("should delete a user", async () => {
      await deleteKV(kv, ["user", 1]);
      const result = await getKV(kv, ["user", 1]);
      assertEquals(result.value, null);
    });
  });

  await t.step("Multiple Key Operations", async () => {
    const users: UserSchema["schema"][] = [
      { id: "user1", name: "User 1", email: "user1@example.com" },
      { id: "user2", name: "User 2", email: "user2@example.com" },
    ];

    await setKV(kv, ["user", 1], users[0]);
    await setKV(kv, ["user", 2], users[1]);

    const results = await getManyKV(kv, [
      ["user", 1],
      ["user", 2],
    ] as const);
    assertEquals(results.length, 2);
    assertEquals(results[0].value, users[0]);
    assertEquals(results[1].value, users[1]);
  });

  await t.step("List Operations", async (t) => {
    // Setup test data
    await t.step("should setup test data", async () => {
      const users = [
        { id: "user1", name: "User A", email: "a@example.com" },
        { id: "user2", name: "User B", email: "b@example.com" },
        { id: "user3", name: "User C", email: "c@example.com" }
      ];
  
      for (let i = 0; i < users.length; i++) {
        await setKV(kv, ["user", i + 1], users[i]);
      }
    });
  
    await t.step("should list all users with prefix", async () => {
      const results = await Array.fromAsync(
        listKV(kv, { prefix: ["user"] as const })
      );
  
      assertEquals(results.length, 3);
      assertEquals(results[0].value.name, "User A");
      assertEquals(results[1].value.name, "User B");
      assertEquals(results[2].value.name, "User C");
    });
  
    await t.step("should list users with start and end bounds", async () => {
      const results = await Array.fromAsync(
        listKV(kv, {
          prefix: ["user"] as const,
          start: ["user", 1] as const,
          end: ["user", 3] as const
        })
      );
  
      assertEquals(results.length, 2);
      assertEquals(results[0].value.name, "User A");
      assertEquals(results[1].value.name, "User B");
    });
  
    await t.step("should list users with limit", async () => {
      const results = await Array.fromAsync(
        listKV(kv, {
          prefix: ["user"] as const,
          limit: 2
        })
      );
  
      assertEquals(results.length, 2);
    });
  
    await t.step("should list users in reverse", async () => {
      const results = await Array.fromAsync(
        listKV(kv, {
          prefix: ["user"] as const,
          reverse: true
        })
      );
  
      assertEquals(results.length, 3);
      assertEquals(results[0].value.name, "User C");
      assertEquals(results[1].value.name, "User B");
      assertEquals(results[2].value.name, "User A");
    });
  
    // Cleanup test data
    await t.step("should cleanup test data", async () => {
      await deleteKV(kv, ["user", 1]);
      await deleteKV(kv, ["user", 2]); 
      await deleteKV(kv, ["user", 3]);
    });
  });

  await t.step("Atomic Operations", async (t) => {
    await t.step("should perform atomic operations", async () => {
      const newUser: UserSchema["schema"] = {
        id: "user3",
        name: "User 3",
        email: "user3@example.com",
      };

      const result = await atomic(kv)
        .set(["user", 3], newUser)
        .commit();

      assertEquals(result.ok, true);
    });

    await t.step("should handle transaction with retries", async () => {
      const result = await transaction(kv, async (tx) => {
        const user = await getKV(kv, ["user", 3]);
        if (!user.value) throw new Error("User not found");
        
        return tx
          .check({ key: ["user", 3], versionstamp: user.versionstamp })
          .set(["user", 3], {
            ...user.value,
            name: "User 3 Updated",
          });
      });

      assertEquals(result.ok, true);

      const updated = await getKV(kv, ["user", 3]);
      assertExists(updated.value);
      assertEquals(updated.value.name, "User 3 Updated");
    });
  });

  await t.step("Queue Processing", async () => {
    const processor = createKVQueueProcessor<TestSchema>(kv)
      .use(async (message, next) => {
        assertExists(message.value);
        await next();
      })
      .handle(async (message) => {
        assertExists(message.value);
        return true;
      });

    await processor.start();
    assertEquals(processor.isRunning, true);
    await processor.stop();
    assertEquals(processor.isRunning, false);
  });

  await t.step("Watch Operations", async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000);

    try {
      const watcher = createKVWatcher(kv, [["user", 1] as const]);
      const updatePromise = setKV(kv, ["user", 1], {
        id: "user1",
        name: "Updated via Watch",
        email: "user1@example.com",
      } as UserSchema["schema"]);

      for await (const [entry] of watcher) {
        if (entry.value?.name === "Updated via Watch") {
          assertEquals(entry.value.name, "Updated via Watch");
          break;
        }
      }

      await updatePromise;
    } finally {
      clearTimeout(timeoutId);
    }
  });
});

// Schema Type Tests
Deno.test("Schema Type Safety", async (t) => {
  const kv = await inSpatialKV.create<TestSchema>();

  await t.step("should enforce schema types", async () => {
    // @ts-expect-error - Testing type safety for incorrect schema
    await assertRejects(() => setKV(kv, ["user", 1], { incorrect: "schema" }));

    // @ts-expect-error - Testing type safety for incorrect key type
    await assertRejects(() => setKV(kv, ["user", "string"], { id: "1" }));

    // @ts-expect-error - Testing type safety for incorrect value type
    await assertRejects(() => setKV(kv, ["tags", "test"], { not: "array" }));
  });
});