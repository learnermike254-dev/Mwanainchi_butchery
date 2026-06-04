type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function PageHero({ eyebrow, title, subtitle, align = "center" }: Props) {
  return (
    <section className="paper-texture border-b border-border">
      <div className={`container-page section-y ${align === "center" ? "text-center" : ""}`}>
        {eyebrow && (
          <p className="font-accent text-xs uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-foreground md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className={`mt-4 max-w-2xl text-base text-muted-foreground md:text-lg ${align === "center" ? "mx-auto" : ""}`}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
