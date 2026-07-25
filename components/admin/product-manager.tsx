"use client";

import { useMemo, useState } from "react";
import { Edit3, ImageIcon, Plus, Search, Trash2, X } from "lucide-react";
import type { AdminProductRecord, ProductVariant } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAdminStore } from "./admin-store";
import { AdminPageHeader, AdminPanel, EmptyAdminState, StatusPill } from "./admin-ui";

const emptyProduct = (): AdminProductRecord => ({
  id: `prod-${Date.now()}`,
  slug: "",
  name: "",
  category: "",
  description: "",
  price: 0,
  rating: 0,
  reviewCount: 0,
  featured: false,
  createdAt: new Date().toISOString(),
  active: true,
  images: [],
  variants: [],
  specifications: {},
  faqs: [],
});

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function ProductManager() {
  const { products, categories, saveProduct, deleteProduct } = useAdminStore();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<AdminProductRecord | null>(null);
  const [deleting, setDeleting] = useState<AdminProductRecord | null>(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.slug}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    const matchesStatus = status === "all" || (status === "active" ? product.active : !product.active);
    return matchesQuery && matchesCategory && matchesStatus;
  }), [category, products, query, status]);

  function save(product: AdminProductRecord) {
    saveProduct(product);
    setEditing(null);
    setMessage(`${product.name} was saved.`);
  }

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">{message}</div>
      <AdminPageHeader eyebrow="Catalog" title="Products" description="Create and maintain products, pricing, variants, stock, imagery, and storefront content." action={<Button onClick={() => setEditing(emptyProduct())} className="min-h-11 bg-[#123d32] hover:bg-[#1a5445]"><Plus className="mr-2 h-4 w-4" /> Add product</Button>} />
      <AdminPanel>
        <div className="grid gap-3 border-b border-[#e8e3d8] p-4 md:grid-cols-[1fr_220px_160px]">
          <label className="relative">
            <span className="sr-only">Search products</span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#718079]" aria-hidden="true" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search name or slug…" />
          </label>
          <label><span className="sr-only">Filter by category</span><Select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full"><option value="all">All categories</option>{categories.map((item) => <option key={item.id}>{item.name}</option>)}</Select></label>
          <label><span className="sr-only">Filter by status</span><Select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full"><option value="all">Any status</option><option value="active">Active</option><option value="inactive">Inactive</option></Select></label>
        </div>
        {filtered.length ? (
          <Table>
            <thead className="bg-[#f8f6f0] text-[11px] uppercase tracking-[.12em] text-[#69766f]">
              <tr><th className="px-5 py-3 font-bold">Product</th><th className="px-4 py-3 font-bold">Price</th><th className="px-4 py-3 font-bold">Stock</th><th className="px-4 py-3 font-bold">Status</th><th className="px-5 py-3 text-right font-bold">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-[#eee9df]">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-[#fbfaf7]">
                  <td className="px-5 py-4"><div className="flex items-center gap-3">{product.images[0]?.src ? <img src={product.images[0].src} alt="" className="h-12 w-12 rounded-lg bg-[#eee9df] object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-lg bg-[#eee9df]"><ImageIcon className="h-5 w-5" /></span>}<div><p className="font-bold text-[#263d35]">{product.name}</p><p className="text-xs text-[#74807b]">{product.category} · /{product.slug}</p></div></div></td>
                  <td className="px-4 py-4 font-bold text-[#123d32]">{currency.format(product.price)}</td>
                  <td className="px-4 py-4"><span className={product.variants.reduce((sum, item) => sum + item.stock, 0) < 10 ? "font-bold text-[#9a4f22]" : ""}>{product.variants.reduce((sum, item) => sum + item.stock, 0)}</span><p className="text-xs text-[#74807b]">{product.variants.length} variant{product.variants.length === 1 ? "" : "s"}</p></td>
                  <td className="px-4 py-4"><StatusPill active={product.active} /></td>
                  <td className="px-5 py-4"><div className="flex justify-end gap-1"><button onClick={() => setEditing(product)} className="grid min-h-10 min-w-10 place-items-center rounded-lg text-[#35584d] hover:bg-[#e8f0ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]" aria-label={`Edit ${product.name}`}><Edit3 className="h-4 w-4" /></button><button onClick={() => setDeleting(product)} className="grid min-h-10 min-w-10 place-items-center rounded-lg text-[#9a3d2e] hover:bg-[#fff0ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a34838]" aria-label={`Delete ${product.name}`}><Trash2 className="h-4 w-4" /></button></div></td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : <EmptyAdminState title="No products found" description="Adjust your filters or create a new product to populate the catalog." />}
      </AdminPanel>
      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?.name ? `Edit ${editing.name}` : "Add product"}>
        {editing && <ProductForm key={editing.id} product={editing} categories={categories.map((item) => item.name)} onCancel={() => setEditing(null)} onSave={save} />}
      </Dialog>
      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)} title="Delete product?">
        <p className="text-sm leading-6 text-[#65736d]">This removes <strong>{deleting?.name}</strong> from local demo data. You can restore the original catalog from Settings.</p>
        <div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button><Button className="bg-[#9a3d2e] hover:bg-[#7d3024]" onClick={() => { if (deleting) { deleteProduct(deleting.id); setMessage(`${deleting.name} was deleted.`); setDeleting(null); } }}>Delete</Button></div>
      </Dialog>
    </>
  );
}

function ProductForm({ product, categories, onCancel, onSave }: { product: AdminProductRecord; categories: string[]; onCancel: () => void; onSave: (product: AdminProductRecord) => void }) {
  const [draft, setDraft] = useState(() => structuredClone(product));
  const [error, setError] = useState("");
  const specs = Object.entries(draft.specifications);

  function updateVariant(id: string, field: keyof ProductVariant, value: string | number) {
    setDraft((current) => ({ ...current, variants: current.variants.map((item) => item.id === id ? { ...item, [field]: value } : item) }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim() || !draft.slug.trim() || !draft.category || draft.price <= 0) {
      setError("Add a name, slug, category, and price greater than zero.");
      return;
    }
    onSave({ ...draft, name: draft.name.trim(), slug: draft.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") });
  }

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {error && <p role="alert" className="rounded-lg bg-[#fff1ee] p-3 text-sm text-[#8d3426]">{error}</p>}
      <fieldset className="space-y-4"><legend className="mb-3 font-bold text-[#123d32]">Basic details</legend>
        <div><label htmlFor="product-name" className="mb-1.5 block text-sm font-semibold">Name *</label><Input id="product-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required /></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="product-slug" className="mb-1.5 block text-sm font-semibold">Slug *</label><Input id="product-slug" value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} required /></div><div><label htmlFor="product-category" className="mb-1.5 block text-sm font-semibold">Category *</label><Select id="product-category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="w-full" required><option value="">Choose category</option>{categories.map((item) => <option key={item}>{item}</option>)}</Select></div></div>
        <div><label htmlFor="product-description" className="mb-1.5 block text-sm font-semibold">Description</label><Textarea id="product-description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="product-price" className="mb-1.5 block text-sm font-semibold">Base price (₹) *</label><Input id="product-price" type="number" min="1" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} /></div><div><label htmlFor="product-original-price" className="mb-1.5 block text-sm font-semibold">Original price (₹)</label><Input id="product-original-price" type="number" min="0" value={draft.originalPrice ?? ""} onChange={(event) => setDraft({ ...draft, originalPrice: event.target.value ? Number(event.target.value) : undefined })} /></div></div>
        <div className="flex flex-wrap gap-5"><label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><Checkbox checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Active</label><label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><Checkbox checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} /> Featured</label></div>
      </fieldset>
      <EditorSection title="Images" onAdd={() => setDraft({ ...draft, images: [...draft.images, { id: `img-${Date.now()}`, src: "", alt: "" }] })}>
        {draft.images.map((image, index) => <div key={image.id} className="grid gap-2 rounded-lg bg-[#f8f6f0] p-3 sm:grid-cols-[56px_1fr_auto]"><div className="grid h-14 w-14 place-items-center overflow-hidden rounded-md bg-[#e9e4d9]">{image.src ? <img src={image.src} alt="" className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <ImageIcon className="h-5 w-5" />}</div><div className="space-y-2"><Input aria-label={`Image ${index + 1} URL`} placeholder="/product.webp or https://…" value={image.src} onChange={(event) => setDraft({ ...draft, images: draft.images.map((item) => item.id === image.id ? { ...item, src: event.target.value } : item) })} /><Input aria-label={`Image ${index + 1} alternative text`} placeholder="Alternative text" value={image.alt} onChange={(event) => setDraft({ ...draft, images: draft.images.map((item) => item.id === image.id ? { ...item, alt: event.target.value } : item) })} /></div><RemoveButton label={`Remove image ${index + 1}`} onClick={() => setDraft({ ...draft, images: draft.images.filter((item) => item.id !== image.id) })} /></div>)}
      </EditorSection>
      <EditorSection title="Variants" onAdd={() => setDraft({ ...draft, variants: [...draft.variants, { id: `var-${Date.now()}`, name: "Option", value: "", price: draft.price, stock: 0 }] })}>
        {draft.variants.map((variant, index) => <div key={variant.id} className="grid gap-2 rounded-lg bg-[#f8f6f0] p-3 sm:grid-cols-2"><Input aria-label={`Variant ${index + 1} name`} placeholder="Type (e.g. Size)" value={variant.name} onChange={(event) => updateVariant(variant.id, "name", event.target.value)} /><Input aria-label={`Variant ${index + 1} value`} placeholder="Value" value={variant.value} onChange={(event) => updateVariant(variant.id, "value", event.target.value)} /><Input aria-label={`Variant ${index + 1} price`} type="number" min="0" placeholder="Price" value={variant.price} onChange={(event) => updateVariant(variant.id, "price", Number(event.target.value))} /><div className="flex gap-2"><Input aria-label={`Variant ${index + 1} stock`} type="number" min="0" placeholder="Stock" value={variant.stock} onChange={(event) => updateVariant(variant.id, "stock", Number(event.target.value))} /><RemoveButton label={`Remove variant ${index + 1}`} onClick={() => setDraft({ ...draft, variants: draft.variants.filter((item) => item.id !== variant.id) })} /></div></div>)}
      </EditorSection>
      <EditorSection title="Specifications" onAdd={() => setDraft({ ...draft, specifications: { ...draft.specifications, [`New specification ${specs.length + 1}`]: "" } })}>
        {specs.map(([key, value], index) => <div key={`${key}-${index}`} className="flex gap-2"><Input aria-label={`Specification ${index + 1} name`} value={key} onChange={(event) => { const next = { ...draft.specifications }; delete next[key]; next[event.target.value] = value; setDraft({ ...draft, specifications: next }); }} /><Input aria-label={`Specification ${index + 1} value`} value={value} onChange={(event) => setDraft({ ...draft, specifications: { ...draft.specifications, [key]: event.target.value } })} /><RemoveButton label={`Remove specification ${key}`} onClick={() => { const next = { ...draft.specifications }; delete next[key]; setDraft({ ...draft, specifications: next }); }} /></div>)}
      </EditorSection>
      <EditorSection title="FAQs" onAdd={() => setDraft({ ...draft, faqs: [...draft.faqs, { question: "", answer: "" }] })}>
        {draft.faqs.map((faq, index) => <div key={index} className="rounded-lg bg-[#f8f6f0] p-3"><div className="mb-2 flex gap-2"><Input aria-label={`FAQ ${index + 1} question`} placeholder="Question" value={faq.question} onChange={(event) => setDraft({ ...draft, faqs: draft.faqs.map((item, itemIndex) => itemIndex === index ? { ...item, question: event.target.value } : item) })} /><RemoveButton label={`Remove FAQ ${index + 1}`} onClick={() => setDraft({ ...draft, faqs: draft.faqs.filter((_, itemIndex) => itemIndex !== index) })} /></div><Textarea aria-label={`FAQ ${index + 1} answer`} placeholder="Answer" className="min-h-20" value={faq.answer} onChange={(event) => setDraft({ ...draft, faqs: draft.faqs.map((item, itemIndex) => itemIndex === index ? { ...item, answer: event.target.value } : item) })} /></div>)}
      </EditorSection>
      <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white pt-4"><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button><Button type="submit" className="bg-[#123d32] hover:bg-[#1a5445]">Save product</Button></div>
    </form>
  );
}

function EditorSection({ title, onAdd, children }: { title: string; onAdd: () => void; children: React.ReactNode }) {
  return <fieldset><div className="mb-3 flex items-center justify-between"><legend className="font-bold text-[#123d32]">{title}</legend><button type="button" onClick={onAdd} className="inline-flex min-h-10 items-center rounded-lg px-3 text-xs font-bold text-[#73571d] hover:bg-[#f1ead9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]"><Plus className="mr-1 h-3.5 w-3.5" /> Add</button></div><div className="space-y-3">{children}</div></fieldset>;
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} aria-label={label} className="grid min-h-10 min-w-10 place-items-center rounded-lg text-[#9a3d2e] hover:bg-[#ffebe7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a34838]"><X className="h-4 w-4" /></button>;
}
