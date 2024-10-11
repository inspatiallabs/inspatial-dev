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
      <Button className={kit("")}>
        Spatial Kit Button
      </Button>
      <p className={kit("text-eve")}>{testShuffle()}</p>
    </main>
  );
}
