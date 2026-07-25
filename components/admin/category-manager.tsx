"use client";

import { useMemo, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import type { AdminCategoryRecord } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAdminStore } from "./admin-store";
import { AdminPageHeader, AdminPanel, EmptyAdminState, StatusPill } from "./admin-ui";

const emptyCategory = (): AdminCategoryRecord => ({ id: `cat-${Date.now()}`, name: "", slug: "", description: "", active: true });

export function CategoryManager() {
  const { categories, products, saveCategory, deleteCategory } = useAdminStore();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<AdminCategoryRecord | null>(null);
  const [deleting, setDeleting] = useState<AdminCategoryRecord | null>(null);
  const [message, setMessage] = useState("");
  const filtered = useMemo(() => categories.filter((item) => `${item.name} ${item.slug}`.toLowerCase().includes(query.toLowerCase())), [categories, query]);

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">{message}</div>
      <AdminPageHeader eyebrow="Catalog" title="Categories" description="Organise the storefront collection structure and control category visibility." action={<Button onClick={() => setEditing(emptyCategory())} className="min-h-11 bg-[#123d32] hover:bg-[#1a5445]"><Plus className="mr-2 h-4 w-4" /> Add category</Button>} />
      <AdminPanel>
        <div className="border-b border-[#e8e3d8] p-4"><label className="relative block max-w-lg"><span className="sr-only">Search categories</span><Search className="absolute left-3 top-3 h-4 w-4 text-[#718079]" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search categories…" /></label></div>
        {filtered.length ? <Table><thead className="bg-[#f8f6f0] text-[11px] uppercase tracking-[.12em] text-[#69766f]"><tr><th className="px-5 py-3">Category</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#eee9df]">{filtered.map((item) => <tr key={item.id}><td className="px-5 py-4"><p className="font-bold text-[#263d35]">{item.name}</p><p className="text-xs text-[#74807b]">/{item.slug} · {item.description}</p></td><td className="px-4 py-4 font-bold">{products.filter((product) => product.category === item.name).length}</td><td className="px-4 py-4"><StatusPill active={item.active} /></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button onClick={() => setEditing(item)} className="grid min-h-10 min-w-10 place-items-center rounded-lg text-[#35584d] hover:bg-[#e8f0ec]" aria-label={`Edit ${item.name}`}><Edit3 className="h-4 w-4" /></button><button onClick={() => setDeleting(item)} className="grid min-h-10 min-w-10 place-items-center rounded-lg text-[#9a3d2e] hover:bg-[#fff0ed]" aria-label={`Delete ${item.name}`}><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></Table> : <EmptyAdminState title="No categories found" description="Try a different search or create a category." />}
      </AdminPanel>
      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.name ? `Edit ${editing.name}` : "Add category"}>{editing && <CategoryForm key={editing.id} item={editing} onCancel={() => setEditing(null)} onSave={(item) => { saveCategory(item); setMessage(`${item.name} was saved.`); setEditing(null); }} />}</Dialog>
      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete category?"><p className="text-sm text-[#65736d]">Deleting <strong>{deleting?.name}</strong> does not delete products already assigned to it.</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button className="bg-[#9a3d2e] hover:bg-[#7d3024]" onClick={() => { if (deleting) { deleteCategory(deleting.id); setMessage(`${deleting.name} was deleted.`); setDeleting(null); } }}>Delete</Button></div></Dialog>
    </>
  );
}

function CategoryForm({ item, onCancel, onSave }: { item: AdminCategoryRecord; onCancel: () => void; onSave: (item: AdminCategoryRecord) => void }) {
  const [draft, setDraft] = useState(item);
  const [error, setError] = useState("");
  return <form onSubmit={(event) => { event.preventDefault(); if (!draft.name.trim()) { setError("Enter a category name."); return; } onSave({ ...draft, slug: (draft.slug || draft.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }); }} className="space-y-4">{error && <p role="alert" className="rounded-lg bg-[#fff1ee] p-3 text-sm text-[#8d3426]">{error}</p>}<div><label htmlFor="category-name" className="mb-1.5 block text-sm font-bold">Name *</label><Input id="category-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></div><div><label htmlFor="category-slug" className="mb-1.5 block text-sm font-bold">Slug</label><Input id="category-slug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} /></div><div><label htmlFor="category-description" className="mb-1.5 block text-sm font-bold">Description</label><Textarea id="category-description" value={draft.description ?? ""} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></div><label className="flex min-h-11 items-center gap-2 text-sm font-bold"><Checkbox checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Active</label><div className="flex justify-end gap-3 border-t pt-4"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" className="bg-[#123d32]">Save category</Button></div></form>;
}
