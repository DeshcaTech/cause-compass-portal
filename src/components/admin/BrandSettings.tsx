import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/ccgms-logo.png?w=240&format=png";
import {
  BODY_FONTS,
  DEFAULT_BRAND,
  HEADING_FONTS,
  brandQuery,
  fontStack,
  googleFontsHref,
  readableForeground,
  type Brand,
} from "@/lib/brand";

const BUCKET = "site-images";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

export function BrandSettings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(brandQuery);
  const [draft, setDraft] = useState<Brand>(DEFAULT_BRAND);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(data ?? DEFAULT_BRAND), [draft, data]);
  const logoSrc = draft.logo_url || defaultLogo;
  const set = <K extends keyof Brand>(key: K, value: Brand[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  // Preview styles are inline so the panel shows the new brand before saving.
  const previewStyle = {
    "--preview-primary": draft.primary_color,
    "--preview-accent": draft.accent_color,
  } as React.CSSProperties;

  async function uploadLogo(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG, WebP or SVG).");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Logos must be smaller than 3 MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `brand/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "31536000", contentType: file.type });
      if (error) throw new Error(error.message);
      const { data: signed, error: signError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL);
      if (signError || !signed) throw new Error(signError?.message ?? "Could not create a logo link");
      set("logo_url", signed.signedUrl);
      toast.success("Logo uploaded — check the preview, then save.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase.from("brand_settings").update(draft).eq("id", 1);
      if (error) throw new Error(error.message);
      await queryClient.invalidateQueries({ queryKey: ["brand-settings"] });
      toast.success("Brand settings saved and applied across the site.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading brand settings…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Card className="border-border/70">
        <CardContent className="space-y-6 p-6">
          <div>
            <h3 className="text-lg">Logo</h3>
            <p className="text-sm text-muted-foreground">
              Upload a square logo (at least 256×256px). It is used in the header, footer and as the
              browser icon depending on the switches below.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={logoSrc}
              alt="Current logo"
              className="size-20 rounded-full border border-border object-contain"
            />
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="max-w-[16rem] cursor-pointer"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadLogo(file);
                  e.target.value = "";
                }}
              />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {uploading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <Upload className="size-3.5" /> PNG, JPG, WebP or SVG · up to 3 MB
                  </>
                )}
                {draft.logo_url ? (
                  <Button type="button" size="sm" variant="ghost" onClick={() => set("logo_url", null)}>
                    Reset to default
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border/70 p-4">
            <p className="text-sm font-medium">Where the logo appears</p>
            <ToggleRow
              label="Site header"
              checked={draft.show_logo_header}
              onChange={(v) => set("show_logo_header", v)}
            />
            <ToggleRow
              label="Site footer"
              checked={draft.show_logo_footer}
              onChange={(v) => set("show_logo_footer", v)}
            />
            <ToggleRow
              label="Browser icon (favicon)"
              checked={draft.use_logo_favicon}
              onChange={(v) => set("use_logo_favicon", v)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              id="brand-primary"
              label="Primary colour"
              value={draft.primary_color}
              onChange={(v) => set("primary_color", v)}
            />
            <ColorField
              id="brand-accent"
              label="Accent colour"
              value={draft.accent_color}
              onChange={(v) => set("accent_color", v)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FontField
              label="Heading font"
              value={draft.heading_font}
              options={HEADING_FONTS}
              onChange={(v) => set("heading_font", v)}
            />
            <FontField
              label="Body font"
              value={draft.body_font}
              options={BODY_FONTS}
              onChange={(v) => set("body_font", v)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand-og">Social share image link</Label>
            <Input
              id="brand-og"
              value={draft.og_image_url ?? ""}
              placeholder="/og-ccgms.jpg"
              onChange={(e) => set("og_image_url", e.target.value || null)}
            />
            <p className="text-xs text-muted-foreground">
              Used for Facebook, WhatsApp, LinkedIn and X previews. A branded 1200×630 image with the
              logo ships at /og-ccgms.jpg.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="hero" disabled={!dirty || saving} onClick={() => void save()}>
              {saving ? "Saving…" : "Save and apply"}
            </Button>
            {dirty ? (
              <Button variant="ghost" onClick={() => setDraft(data ?? DEFAULT_BRAND)}>
                Discard changes
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">All changes published</span>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4" style={previewStyle}>
        <link rel="stylesheet" href={googleFontsHref(draft.heading_font, draft.body_font)} />
        <p className="text-sm text-muted-foreground">
          Live preview — this is how the site looks before you publish.
        </p>

        <PreviewCard title="Header">
          <div className="flex items-center justify-between rounded-md border border-border bg-background px-4 py-3">
            <div className="flex items-center gap-3">
              {draft.show_logo_header ? (
                <img src={logoSrc} alt="" className="size-10 rounded-full object-contain" />
              ) : null}
              <span
                className="text-lg font-semibold"
                style={{ fontFamily: fontStack(draft.heading_font), color: draft.primary_color }}
              >
                CCGMs
              </span>
            </div>
            <span
              className="rounded-md px-3 py-1.5 text-xs font-medium"
              style={{
                background: draft.primary_color,
                color: readableForeground(draft.primary_color),
                fontFamily: fontStack(draft.body_font),
              }}
            >
              Join the community
            </span>
          </div>
        </PreviewCard>

        <PreviewCard title="Footer">
          <div
            className="rounded-md px-4 py-5"
            style={{ background: draft.primary_color, color: readableForeground(draft.primary_color) }}
          >
            <div className="flex items-center gap-3">
              {draft.show_logo_footer ? (
                <img src={logoSrc} alt="" className="size-10 rounded-full object-contain" />
              ) : null}
              <span className="text-base font-semibold" style={{ fontFamily: fontStack(draft.heading_font) }}>
                CCGMs
              </span>
            </div>
            <p className="mt-3 text-xs opacity-80" style={{ fontFamily: fontStack(draft.body_font) }}>
              A community association bringing families together.
            </p>
            <span className="mt-3 inline-block text-xs font-semibold" style={{ color: draft.accent_color }}>
              Powered by DeshcaTech
            </span>
          </div>
        </PreviewCard>

        <PreviewCard title="Browser tab (favicon)">
          <div className="flex items-center gap-2 rounded-t-md border border-border bg-muted px-3 py-2">
            <img
              src={draft.use_logo_favicon ? logoSrc : "/favicon.png"}
              alt=""
              className="size-4 rounded-sm object-contain"
            />
            <span className="text-xs" style={{ fontFamily: fontStack(draft.body_font) }}>
              CCGMs — Community Association
            </span>
          </div>
        </PreviewCard>

        <PreviewCard title="Typography">
          <p className="text-2xl" style={{ fontFamily: fontStack(draft.heading_font) }}>
            Building a stronger community
          </p>
          <p className="mt-2 text-sm text-muted-foreground" style={{ fontFamily: fontStack(draft.body_font) }}>
            Body text uses {draft.body_font}. Headings use {draft.heading_font}.
          </p>
        </PreviewCard>
      </div>
    </div>
  );
}

function PreviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/70">
      <CardContent className="space-y-2 p-4">
        <p className="eyebrow text-muted-foreground">{title}</p>
        {children}
      </CardContent>
    </Card>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-sm font-normal">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-10 cursor-pointer rounded-md border border-border bg-background"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}

function FontField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
