import RandomPicker from "@/components/RandomPicker";
import { getAllEntries } from "@/lib/archive";

export const metadata = {
  title: "Random",
  description: "Let history decide. A random entry from the archive.",
};

export default async function RandomPage() {
  const entries = await getAllEntries();
  return (
    <main className="flex flex-1 items-center bg-ink text-paper">
      <div className="wrap py-20 text-center sm:py-28">
        <h1 className="sr-only">Random discovery — let history decide</h1>
        <p className="font-mono text-base font-medium tracking-[0.25em] text-paper uppercase dark:text-black">
          History has chosen
        </p>
        <div className="mt-6 flex justify-center">
          <RandomPicker autoStart entries={entries} />
        </div>
      </div>
    </main>
  );
}
