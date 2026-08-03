import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Loosely typed table access — the manager is generic over admin content tables.
const db = supabase as unknown as {
  from: (table: string) => any;
};

export type AdminField = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "date"
    | "datetime"
    | "select"
    | "switch"
    | "image"
    | "json";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  help?: string;
  /** Optional per-field overrides for image validation. */
  image?: Partial<ImageRules>;
};

const IMAGE_BUCKET = "site-images";
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10; // 10 years

export type ImageRules = {
  accept: string[];
  maxBytes: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
};

const DEFAULT_IMAGE_RULES: ImageRules = {
  accept: ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"],
  maxBytes: 5 * 1024 * 1024,
  minWidth: 200,
  minHeight: 200,
  maxWidth: 6000,
  maxHeight: 6000,
};

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes % (1024 * 1024) === 0 ? 0 : 1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function typeNames(accept: string[]) {
  return accept.map((t) => t.replace("image/", "").toUpperCase()).join(", ");
}

function readDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file could not be read as an image — it may be corrupted."));
    };
    img.src = url;
  });
}

async function validateImage(file: File, rules: ImageRules): Promise<string | null> {
  if (!rules.accept.includes(file.type)) {
    return `“${file.name}” is a ${file.type || "unknown"} file. Please use ${typeNames(rules.accept)}.`;
  }
  if (file.size > rules.maxBytes) {
    return `That picture is ${formatBytes(file.size)} — the maximum is ${formatBytes(rules.maxBytes)}. Please compress or resize it.`;
  }
  let dims: { width: number; height: number };
  try {
    dims = await readDimensions(file);
  } catch (error) {
    return (error as Error).message;
  }
  if (dims.width < rules.minWidth || dims.height < rules.minHeight) {
    return `That picture is ${dims.width}×${dims.height}px — it must be at least ${rules.minWidth}×${rules.minHeight}px, otherwise it will look blurry.`;
  }
  if (dims.width > rules.maxWidth || dims.height > rules.maxHeight) {
    return `That picture is ${dims.width}×${dims.height}px — the maximum is ${rules.maxWidth}×${rules.maxHeight}px. Please resize it before uploading.`;
  }
  return null;
}

function ImageField({
  id,
  value,
  onChange,
  rules: overrides,
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
  rules?: Partial<ImageRules>;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rules: ImageRules = { ...DEFAULT_IMAGE_RULES, ...overrides };

  async function upload(file: File) {
    setError(null);
    const problem = await validateImage(file, rules);
    if (problem) {
      setError(problem);
      toast.error(problem);
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw new Error(error.message);
      const { data, error: signError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL);
      if (signError || !data) throw new Error(signError?.message ?? "Could not create image link");
      onChange(data.signedUrl);
      toast.success("Picture uploaded");
    } catch (error) {
      const message = `Upload failed: ${(error as Error).message}`;
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <img
          src={value}
          alt="Selected preview"
          className="h-32 w-full rounded-md border border-border object-cover"
        />
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id={id}
          type="file"
          accept={rules.accept.join(",")}
          disabled={uploading}
          className={`max-w-[16rem] cursor-pointer ${error ? "border-destructive" : ""}`}
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = "";
          }}
        />
        {uploading ? <span className="text-xs text-muted-foreground">Uploading…</span> : null}
        {value ? (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>
            Remove
          </Button>
        ) : null}
      </div>
      <Input
        placeholder="…or paste an image link"
        value={value}
        onChange={(e) => {
          setError(null);
          onChange(e.target.value);
        }}
      />
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {typeNames(rules.accept)} · up to {formatBytes(rules.maxBytes)} · {rules.minWidth}×
          {rules.minHeight}px to {rules.maxWidth}×{rules.maxHeight}px
        </p>
      )}
    </div>
  );
}

export type RecordManagerProps = {
  table: string;
  title: string;
  description?: string;
  fields: AdminField[];
  orderBy?: { column: string; ascending?: boolean };
  primaryLabel: (row: Record<string, any>) => string;
  secondaryLabel?: (row: Record<string, any>) => string;
  defaults?: Record<string, any>;
  filter?: { column: string; value: string } | null;
};

function toFormValue(field: AdminField, value: any) {
  if (value === null || value === undefined) return field.type === "switch" ? false : "";
  if (field.type === "datetime") return String(value).slice(0, 16);
  if (field.type === "date") return String(value).slice(0, 10);
  if (field.type === "json") return JSON.stringify(value, null, 2);
  return value;
}

function toDbValue(field: AdminField, value: any) {
  if (field.type === "switch") return Boolean(value);
  if (value === "" || value === undefined) return null;
  if (field.type === "number") return Number(value);
  if (field.type === "datetime") return new Date(value).toISOString();
  if (field.type === "json") {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`${field.label} must be valid JSON`);
    }
  }
  return value;
}

export function RecordManager({
  table,
  title,
  description,
  fields,
  orderBy,
  primaryLabel,
  secondaryLabel,
  defaults,
  filter = null,
}: RecordManagerProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [deleting, setDeleting] = useState<Record<string, any> | null>(null);

  const listKey = ["admin", table, filter?.value ?? "all"];

  const { data: rows = [], isLoading } = useQuery({
    queryKey: listKey,
    queryFn: async () => {
      let request = db.from(table).select("*");
      if (filter) request = request.eq(filter.column, filter.value);
      if (orderBy) request = request.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      const { data, error } = await request;
      if (error) throw new Error(error.message);
      return (data ?? []) as Record<string, any>[];
    },
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: listKey });
    queryClient.invalidateQueries({ queryKey: [table] });
  }

  const save = useMutation({
    mutationFn: async (values: Record<string, any>) => {
      const payload: Record<string, any> = { ...(filter ? { [filter.column]: filter.value } : {}) };
      for (const field of fields) payload[field.name] = toDbValue(field, values[field.name]);
      if (editing) {
        const { error } = await db.from(table).update(payload).eq("id", editing['id']);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await db.from(table).insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Changes saved" : "Created");
      setOpen(false);
      setEditing(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: async (row: Record<string, any>) => {
      const { error } = await db.from(table).delete().eq("id", row['id']);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Deleted");
      setDeleting(null);
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function openCreate() {
    const initial: Record<string, any> = {};
    for (const field of fields) initial[field.name] = toFormValue(field, defaults?.[field.name] ?? null);
    setEditing(null);
    setForm(initial);
    setOpen(true);
  }

  function openEdit(row: Record<string, any>) {
    const initial: Record<string, any> = {};
    for (const field of fields) initial[field.name] = toFormValue(field, row[field.name]);
    setEditing(row);
    setForm(initial);
    setOpen(true);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <Button variant="hero" onClick={openCreate}>
          <Plus /> Add new
        </Button>
      </div>

      <div className="mt-5 space-y-2">
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : null}
        {!isLoading && rows.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nothing here yet — use “Add new” to create the first entry.
            </CardContent>
          </Card>
        ) : null}
        {rows.map((row) => (
          <Card key={row['id']} className="border-border/70">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-medium">{primaryLabel(row)}</p>
                {secondaryLabel ? (
                  <p className="truncate text-xs text-muted-foreground">{secondaryLabel(row)}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button variant="soft" size="sm" onClick={() => openEdit(row)}>
                  <Pencil /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setDeleting(row)}>
                  <Trash2 /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${title.toLowerCase()}` : `New ${title.toLowerCase()}`}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              save.mutate(form);
            }}
          >
            {fields.map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "textarea" || field.type === "json" ? (
                  <Textarea
                    id={field.name}
                    rows={field.type === "json" ? 8 : 4}
                    required={field.required}
                    placeholder={field.placeholder}
                    value={form[field.name] ?? ""}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  />
                ) : field.type === "select" ? (
                  <select
                    id={field.name}
                    required={field.required}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form[field.name] ?? ""}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "switch" ? (
                  <div className="flex items-center gap-3">
                    <Switch
                      id={field.name}
                      checked={Boolean(form[field.name])}
                      onCheckedChange={(checked) => setForm({ ...form, [field.name]: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {form[field.name] ? "Yes" : "No"}
                    </span>
                  </div>
                ) : field.type === "image" ? (
                  <ImageField
                    id={field.name}
                    value={form[field.name] ?? ""}
                    onChange={(url) => setForm({ ...form, [field.name]: url })}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={
                      field.type === "number"
                        ? "number"
                        : field.type === "date"
                          ? "date"
                          : field.type === "datetime"
                            ? "datetime-local"
                            : "text"
                    }
                    required={field.required}
                    placeholder={field.placeholder}
                    value={form[field.name] ?? ""}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  />
                )}
                {field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null}
              </div>
            ))}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={save.isPending}>
                {save.isPending ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(value) => !value && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting ? primaryLabel(deleting) : ""} will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleting && remove.mutate(deleting)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}