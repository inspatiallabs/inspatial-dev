import { createSignal, $ } from "../../../../src/signal.ts";

export function Counter() {
  console.log("Counter component initializing...");
  const count = createSignal(0);
  // Create a computed signal for the text
  const message = $(() => `Count is: ${count.value}`);

  console.log("Counter component returning JSX directly");
  return (
    <>
      <div className="flex flex-col h-screen justify-center items-center gap-10">
        <h1 className="text-purple-500 text-8xl">🚀 InSpatial Run!</h1>
        <p className="text-2xl">Hot reload test working! 🔥</p>
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
