type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, children }: Props) {
  return (
    <section className="surface-panel border-b border-border">
      <div className="container-page py-14 md:py-20">
        <p className="eyebrow text-terracotta">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{description}</p>
        ) : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </div>
    </section>
  );
}