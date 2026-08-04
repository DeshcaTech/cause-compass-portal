import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const FRAMES = [
  { key: "mobile", label: "Mobile", width: 375, note: "375px" },
  { key: "tablet", label: "Tablet", width: 768, note: "768px" },
  { key: "desktop", label: "Desktop", width: 1280, note: "1280px" },
] as const;

function Sample({ id }: { id: string }) {
  return (
    <div className="@container">
      <div className="space-y-5 p-6">
        <p className="eyebrow text-terracotta">Cameroonian Community</p>
        <h2 className="text-[2.15rem] leading-tight @2xl:text-[2.31rem] @5xl:text-[4.2rem]">
          A family of families
        </h2>
        <h3 className="text-2xl @md:text-[1.75rem] @2xl:text-[2rem]">Section heading</h3>
        <p className="text-[16px] leading-relaxed text-muted-foreground">
          Body copy set in Figtree at the base scale. Supporting one another, celebrating our
          culture and building a stronger future for the next generation.
        </p>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <span className="rounded-md px-2.5 py-2 text-[14px] leading-[20px] font-bold text-foreground/80">
            About CCGMs
          </span>
          <span className="rounded-md px-2.5 py-2 text-[14px] leading-[20px] font-bold text-foreground/80">
            Events
          </span>
          <span className="rounded-md px-2.5 py-2 text-[14px] leading-[20px] font-bold text-foreground/80">
            Contact
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="hero" size="sm">Donate</Button>
          <Button variant="soft">Join</Button>
          <Button variant="outline" size="xl">Support Our Causes</Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`sample-${id}`}>Full name</Label>
          <Input id={`sample-${id}`} placeholder="Jane Doe" readOnly />
        </div>
      </div>
    </div>
  );
}

export function TypographyPreview() {
  return (
    <section className="space-y-6">
      {FRAMES.map((frame) => (
        <div key={frame.key} className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[1.15rem]">{frame.label}</h3>
            <span className="text-[13px] text-muted-foreground">{frame.note}</span>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
            <div style={{ width: frame.width, maxWidth: "100%" }}>
              <Sample id={frame.key} />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
