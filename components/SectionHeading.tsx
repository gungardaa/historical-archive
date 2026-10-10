export default function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">{eyebrow}</p>
      <h2 className="font-display mt-3 text-4xl leading-tight sm:text-5xl">{title}</h2>
      <hr className="mt-6 border-ink/10" />
    </div>
  );
}
