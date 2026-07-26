"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { deleteCategory, deleteCategoryImage, saveCategory, saveCategoryImage } from "@/app/admin/categories/actions";
import type {
  AdminCatalogCategory,
  CategoryInput,
} from "@/components/admin/catalog-types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { AdminPageHeader, AdminPanel, EmptyAdminState, StatusPill } from "./admin-ui";
import { CloudinaryUploadButton } from "./cloudinary-upload-button";

const emptyCategory = (): AdminCatalogCategory => ({
  id: "new",
  name: "",
  slug: "",
  description: "",
  isActive: true,
  displayOrder: 0,
  productCount: 0,
  imageUrl: "",
  imagePublicId: "",
  imageAltText: "",
});

export function CategoryManager({
  initialCategories,
}: {
  initialCategories: AdminCatalogCategory[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminCatalogCategory | null>(null);
  const [deleting, setDeleting] = useState<AdminCatalogCategory | null>(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [isPending, startTransition] = useTransition();
  const filtered = useMemo(
    () =>
      initialCategories.filter((item) =>
        `${item.name} ${item.slug}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [initialCategories, query],
  );

  function persist(item: CategoryInput) {
    setActionError("");
    startTransition(async () => {
      const result = await saveCategory(item);
      if (!result.ok) {
        setActionError(result.error);
        return;
      }
      setEditing(null);
      setMessage(result.message);
      router.refresh();
    });
  }

  function remove() {
    if (!deleting) return;
    setActionError("");
    startTransition(async () => {
      const result = await deleteCategory(deleting.id);
      if (!result.ok) {
        setActionError(result.error);
        return;
      }
      setDeleting(null);
      setMessage(result.message);
      router.refresh();
    });
  }

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">{message}</div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Organise the storefront collection structure and control category visibility."
        action={
          <Button
            onClick={() => {
              setActionError("");
              setEditing(emptyCategory());
            }}
            className="min-h-11 bg-[#123d32] hover:bg-[#1a5445]"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" /> Add category
          </Button>
        }
      />
      {actionError && (
        <p role="alert" className="mb-4 rounded-lg border border-[#edc8bf] bg-[#fff1ee] p-3 text-sm text-[#8d3426]">
          {actionError}
        </p>
      )}
      <AdminPanel>
        <div className="border-b border-[#e8e3d8] p-4">
          <label className="relative block max-w-lg">
            <span className="sr-only">Search categories</span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#718079]" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              placeholder="Search categories…"
            />
          </label>
        </div>
        {filtered.length ? (
          <Table>
            <thead className="bg-[#f8f6f0] text-[11px] uppercase tracking-[.12em] text-[#69766f]">
              <tr>
                <th scope="col" className="px-5 py-3">Category</th>
                <th scope="col" className="px-4 py-3">Order</th>
                <th scope="col" className="px-4 py-3">Products</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee9df]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#fbfaf7]">
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#263d35]">{item.name}</p>
                    <p className="text-xs text-[#74807b]">/{item.slug} · {item.description}</p>
                  </td>
                  <td className="px-4 py-4">{item.displayOrder}</td>
                  <td className="px-4 py-4 font-bold">{item.productCount}</td>
                  <td className="px-4 py-4"><StatusPill active={item.isActive} /></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => {
                          setActionError("");
                          setEditing(item);
                        }}
                        className="grid min-h-11 min-w-11 place-items-center rounded-lg text-[#35584d] hover:bg-[#e8f0ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Edit3 className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <CloudinaryUploadButton
                        scope="category"
                        label={item.imageUrl ? "Replace image" : "Add image"}
                        disabled={isPending}
                        onUploaded={(asset) => startTransition(async () => {
                          const result = await saveCategoryImage({ id: item.id, asset, altText: item.imageAltText || item.name });
                          if (!result.ok) setActionError(result.error);
                          else { setMessage(result.message); router.refresh(); }
                        })}
                      />
                      {item.imagePublicId && (
                        <button
                          onClick={() => startTransition(async () => {
                            const result = await deleteCategoryImage(item.id);
                            if (!result.ok) setActionError(result.error);
                            else { setMessage(result.message); router.refresh(); }
                          })}
                          className="grid min-h-11 min-w-11 place-items-center rounded-lg text-[#9a3d2e] hover:bg-[#fff0ed]"
                          aria-label={`Remove image for ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setActionError("");
                          setDeleting(item);
                        }}
                        className="grid min-h-11 min-w-11 place-items-center rounded-lg text-[#9a3d2e] hover:bg-[#fff0ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a34838]"
                        aria-label={`Delete ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyAdminState title="No categories found" description="Try a different search or create a category." />
        )}
      </AdminPanel>
      <Dialog
        open={Boolean(editing)}
        onClose={() => !isPending && setEditing(null)}
        title={editing?.name ? `Edit ${editing.name}` : "Add category"}
      >
        {editing && (
          <CategoryForm
            key={editing.id}
            item={editing}
            isPending={isPending}
            error={actionError}
            onCancel={() => setEditing(null)}
            onSave={persist}
          />
        )}
      </Dialog>
      <Dialog
        open={Boolean(deleting)}
        onClose={() => !isPending && setDeleting(null)}
        title="Delete category?"
      >
        <p className="text-sm leading-6 text-[#65736d]">
          Delete <strong>{deleting?.name}</strong>? Categories with assigned products cannot be deleted.
        </p>
        {actionError && <p role="alert" className="mt-4 text-sm text-[#8d3426]">{actionError}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" disabled={isPending} onClick={() => setDeleting(null)}>Cancel</Button>
          <Button
            disabled={isPending}
            aria-busy={isPending}
            className="bg-[#9a3d2e] hover:bg-[#7d3024]"
            onClick={remove}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Dialog>
    </>
  );
}

function CategoryForm({
  item,
  isPending,
  error,
  onCancel,
  onSave,
}: {
  item: AdminCatalogCategory;
  isPending: boolean;
  error: string;
  onCancel: () => void;
  onSave: (item: CategoryInput) => void;
}) {
  const [draft, setDraft] = useState(item);
  const [validationError, setValidationError] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const name = draft.name.trim();
        const slug = (draft.slug || name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        if (!name || !slug) {
          setValidationError("Enter a category name and valid slug.");
          return;
        }
        onSave({ ...draft, name, slug });
      }}
      className="space-y-4"
      noValidate
    >
      {(validationError || error) && (
        <p role="alert" className="rounded-lg bg-[#fff1ee] p-3 text-sm text-[#8d3426]">
          {validationError || error}
        </p>
      )}
      <div>
        <label htmlFor="category-name" className="mb-1.5 block text-sm font-bold">Name <span aria-hidden="true">*</span></label>
        <Input id="category-name" value={draft.name} required aria-required="true" onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
      </div>
      <div>
        <label htmlFor="category-slug" className="mb-1.5 block text-sm font-bold">Slug</label>
        <Input id="category-slug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} />
      </div>
      <div>
        <label htmlFor="category-description" className="mb-1.5 block text-sm font-bold">Description</label>
        <Textarea id="category-description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      </div>
      <div>
        <label htmlFor="category-order" className="mb-1.5 block text-sm font-bold">Display order</label>
        <Input id="category-order" type="number" min="0" step="1" value={draft.displayOrder} onChange={(event) => setDraft({ ...draft, displayOrder: Number(event.target.value) })} />
      </div>
      <label className="flex min-h-11 items-center gap-2 text-sm font-bold">
        <Checkbox checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Active
      </label>
      <div className="flex justify-end gap-3 border-t pt-4">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending} aria-busy={isPending} className="bg-[#123d32]">
          {isPending ? "Saving…" : "Save category"}
        </Button>
      </div>
    </form>
  );
}
