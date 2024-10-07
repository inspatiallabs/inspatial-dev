import { Button } from "@inspatial/kit";
import { kit, shuffle } from "@inspatial/utils";

export default function Home() {
  function testShuffle() {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffle(arr);
    return shuffled.join(", ");
  }
  return (
    <main>
      <Button className={kit("")} onPointerUp={() => {}}>
        Spatial Kit Button
      </Button>
      <div>{testShuffle()}</div>
    </main>
  );
}
