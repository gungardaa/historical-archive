import Button from "@/components/Button";

export default function NotFound() {
  return (
    <main className="wrap flex flex-1 items-center py-24 text-center">
      <div className="mx-auto max-w-xl">
        <p className="font-mono text-xs tracking-[0.25em] text-muted uppercase">Archive unavailable</p>
        <h1 className="font-display mt-4 text-5xl sm:text-6xl">No such record.</h1>
        <p className="mt-4 text-secondary">
          Something went wrong while accessing this record. It may not exist yet.
        </p>
        <div className="mt-8 flex justify-center">
          <Button href="/explore">Return to archive</Button>
        </div>
      </div>
    </main>
  );
}
