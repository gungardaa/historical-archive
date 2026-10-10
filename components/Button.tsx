import Link from "next/link";

type Variant = "primary" | "secondary";

export default function Button({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: Variant;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center gap-2 px-6 py-3 text-sm font-medium tracking-[0.12em] uppercase transition-colors";
  const styles =
    variant === "primary"
      ? "bg-accent text-paper hover:bg-ink"
      : "border border-ink/25 text-ink hover:border-accent hover:text-accent";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
