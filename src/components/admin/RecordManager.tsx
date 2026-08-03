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
  type?: "text" | "textarea" | "number" | "date" | "datetime" | "select" | "switch";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  help?: string;
};

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
  return value;
}

function toDbValue(field: AdminField, value: any) {
  if (field.type === "switch") return Boolean(value);
  if (value === "" || value === undefined) return null;
  if (field.type === "number") return Number(value);
  if (field.type === "datetime") return new Date(value).toISOString();
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
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    rows={4}
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