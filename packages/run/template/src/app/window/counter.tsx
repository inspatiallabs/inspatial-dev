import { List } from "../../../../src/kit/control-flow/index.ts";
import { createSignal, $, derivedExtract } from "../../../../src/signal.ts";

export function Counter() {
  console.log("Counter component initializing...");
  const count = createSignal(0);
  // Create a computed signal for the text
  const message = $(() => `Count is: ${count.value}`);

  const entries = createSignal([
    { id: 1, name: "Hot reload test working! 🔥" },
    { id: 2, name: "DOM renderer is running 🦵" },
    { id: 3, name: "Interactivity is a check ✅" },
  ]);

  return (
    <>
      <div className="flex flex-col h-screen justify-center items-center gap-10">
        <h1 className="text-purple-500 text-8xl">🚀 InSpatial Run!</h1>
        <List each={entries} track="id" unkeyed={true}>
          {({ item }) => {
            const { name } = derivedExtract(item);
            return <p className="flex flex-col text-2xl">{name}</p>;
          }}
        </List>
        <button
          id="increment"
          className="bg-purple-500 p-6 rounded-full text-white font-bold text-2xl shadow-lg hover:bg-purple-600 transition-colors"
          on:click={() => count.value++}
        >
          {message}
        </button>
      </div>
    </>
  );
}
