"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
export type ProductDetail = {
  highlight1: string;
  highlight2: string;
  highlight3: string;
  howToUse: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  buzzWords: string;
  description: string;
  price: number;
  inventory: number;
  imageUrl: string;
  details: ProductDetail | null;
};

export type ProductPayload = {
  name: string;
  slug: string;
  category: string;
  buzzWords: string;
  description: string;
  price: number;
  inventory: number;
  imageUrl: string;

  details: {
    highlight1: string;
    highlight2: string;
    highlight3: string;
    howToUse: string;
  };
};

export type ProductActionResult =
  | {
      success: true;
      product: Product;
    }
  | {
      success: false;
      error: string;
 };

export type DeleteActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
};

type ProductsManagerProps = {
  initialProducts: Product[];
  createProductAction: (payload: ProductPayload) => Promise<ProductActionResult>;
  updateProductAction: (
    id: string,
    payload: ProductPayload,
  ) => Promise<ProductActionResult>;
  updateInventoryAction: (
    id: string,
    inventory: number,
  ) => Promise<ProductActionResult>;
  deleteProductAction: (id: string) => Promise<DeleteActionResult>;
};

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  category: string;
  buzzWords: string;
  description: string;
  price: string;
  inventory: string;
  imageUrl: string;
  highlight1: string;
  highlight2: string;
  highlight3: string;
  howToUse: string | null;
};

const EMPTY_FORM: ProductForm = {
  name: "",
  slug: "",
  category: "",
  buzzWords: "",
  description: "",
  price: "",
  inventory: "0",
  imageUrl: "",
  highlight1: "",
  highlight2: "",
  highlight3: "",
  howToUse: "",
};

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getInventoryStatus(inventory: number) {
  if (inventory <= 0) {
    return {
      label: "Out of stock",
      className: "bg-red-50 text-red-700 ring-red-200",
    };
  }

  if (inventory <= 5) {
    return {
      label: "Low stock",
      className: "bg-amber-50 text-amber-800 ring-amber-200",
    };
  }

  return {
    label: "In stock",
    className: "bg-[#e8efe7] text-[#244a2c] ring-[#c9dac8]",
  };
}

export default function ProductsManager({
  initialProducts,
  createProductAction,
  updateProductAction,
  updateInventoryAction,
  deleteProductAction,
}: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.category).filter(Boolean)),
    ).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "all" || product.category === category;

      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.slug.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  const inventoryStats = useMemo(() => {
    const totalUnits = products.reduce(
      (sum, product) => sum + product.inventory,
      0,
    );
    const lowStock = products.filter(
      (product) => product.inventory > 0 && product.inventory <= 5,
    ).length;
    const outOfStock = products.filter(
      (product) => product.inventory <= 0,
    ).length;

    return {
      products: products.length,
      totalUnits,
      lowStock,
      outOfStock,
    };
  }, [products]);

  function openCreateEditor() {
    setForm(EMPTY_FORM);
    setError(null);
    setMessage(null);
    setEditorOpen(true);
  }

  function openEditEditor(product: Product) {
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      buzzWords: product.buzzWords ?? "",
      description: product.description ?? "",
      price: (product.price / 100).toFixed(2),
      inventory: String(product.inventory),
      imageUrl: product.imageUrl ?? "",
      highlight1: product.details?.highlight1 ?? "",
      highlight2: product.details?.highlight2 ?? "",
      highlight3: product.details?.highlight3 ?? "",
      howToUse: product.details?.howToUse ?? null,
    });
    setError(null);
    setMessage(null);
    setEditorOpen(true);
  }

  function updateForm<K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.id ? current.slug : slugify(value),
    }));
  }

  async function handleImageUpload(file: File) {
    try {
      setUploading(true);
      setError(null);

      const body = new FormData();
      body.append("file", file);
      body.append("slug", form.slug || slugify(form.name) || "product");

      const response = await fetch("/api/admin/products/images", {
        method: "POST",
        body,
      });

      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Image upload failed.");
      }

      updateForm("imageUrl", data.url);
      setMessage("Image uploaded successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError(null);
      setMessage(null);

      const price = Number(form.price);
      const inventory = Number(form.inventory);

      if (!form.name.trim()) throw new Error("Product name is required.");
      if (!form.slug.trim()) throw new Error("Slug is required.");
      if (!form.category.trim()) throw new Error("Category is required.");
      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Enter a valid price.");
      }
      if (!Number.isInteger(inventory) || inventory < 0) {
        throw new Error("Inventory must be a whole number of 0 or more.");
      }

      const payload: ProductPayload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        category: form.category.trim(),
        buzzWords: form.buzzWords.trim(),
        description: form.description.trim(),
        price: Math.round(price * 100),
        inventory,
        imageUrl: form.imageUrl.trim(),
        details: {
          highlight1: form.highlight1.trim(),
          highlight2: form.highlight2.trim(),
          highlight3: form.highlight3.trim(),
          howToUse: form.howToUse?.trim() || "",
        },
      };

      const editing = Boolean(form.id);
      const result =
        editing && form.id
          ? await updateProductAction(form.id, payload)
          : await createProductAction(payload);

      if (!result.success) {
        throw new Error(result.error);
      }

      setProducts((current) => {
        if (editing) {
          return current.map((product) =>
            product.id === result.product.id ? result.product : product,
          );
        }

        return [result.product, ...current];
      });

      setMessage(editing ? "Product updated." : "Product created.");
      setEditorOpen(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function updateInventory(product: Product, nextInventory: number) {
    if (nextInventory < 0) return;

    const previous = product.inventory;

    setProducts((current) =>
      current.map((item) =>
        item.id === product.id ? { ...item, inventory: nextInventory } : item,
      ),
    );

    try {
      const result = await updateInventoryAction(product.id, nextInventory);

      if (!result.success) {
        throw new Error(result.error);
      }

      setProducts((current) =>
        current.map((item) =>
          item.id === result.product.id ? result.product : item,
        ),
      );
    } catch (err) {
      setProducts((current) =>
        current.map((item) =>
          item.id === product.id ? { ...item, inventory: previous } : item,
        ),
      );
      setError(
        err instanceof Error ? err.message : "Could not update inventory.",
      );
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Delete “${product.name}”? This cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setError(null);
      setMessage(null);

      const result = await deleteProductAction(product.id);

      if (!result.success) {
        throw new Error(result.error);
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id),
      );
      setMessage(`${product.name} deleted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete product.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] text-[#2d382f]">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <header className="flex flex-col gap-6 border-b border-[#d8cbb8] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#a3742b]">
              Herbalur Admin
            </p>
            <h1 className="font-serif text-4xl font-light tracking-[-0.03em] text-[#244a2c] sm:text-5xl">
              Products & Inventory
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5a5d56] sm:text-base">
              Manage product information, stock levels, imagery, pricing, and
              customer-facing product details from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateEditor}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#244a2c] px-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#fffaf2] transition hover:bg-[#19371f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a3742b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]"
          >
            + Add product
          </button>
        </header>

        <section
          aria-label="Inventory overview"
          className="grid gap-3 py-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          <StatCard label="Products" value={inventoryStats.products} />
          <StatCard label="Units in stock" value={inventoryStats.totalUnits} />
          <StatCard label="Low stock" value={inventoryStats.lowStock} />
          <StatCard label="Out of stock" value={inventoryStats.outOfStock} />
        </section>

        {(message || error) && (
          <div
            aria-live="polite"
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              error
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-[#c9dac8] bg-[#edf4eb] text-[#244a2c]"
            }`}
          >
            {error ?? message}
          </div>
        )}

        <section className="overflow-hidden rounded-[28px] border border-[#ded2c0] bg-[#fffaf2] shadow-[0_24px_70px_rgba(62,49,35,0.07)]">
          <div className="flex flex-col gap-4 border-b border-[#e3d8c8] p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-serif text-2xl font-light text-[#2d382f]">
                Catalog
              </h2>
              <p className="mt-1 text-sm text-[#72736d]">
                {filteredProducts.length} of {products.length} products shown
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px]">
              <label className="sr-only" htmlFor="product-search">
                Search products
              </label>
              <input
                id="product-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="min-h-11 rounded-full border border-[#d9cdbd] bg-[#f7f1e8] px-4 text-sm outline-none transition placeholder:text-[#8b8b84] focus:border-[#244a2c] focus:ring-2 focus:ring-[#244a2c]/10"
              />

              <label className="sr-only" htmlFor="category-filter">
                Filter by category
              </label>
              <select
                id="category-filter"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="min-h-11 rounded-full border border-[#d9cdbd] bg-[#f7f1e8] px-4 text-sm outline-none transition focus:border-[#244a2c] focus:ring-2 focus:ring-[#244a2c]/10"
              >
                <option value="all">All categories</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="grid min-h-64 place-items-center p-10 text-center">
              <div>
                <p className="font-serif text-2xl text-[#2d382f]">
                  No products found
                </p>
                <p className="mt-2 text-sm text-[#77786f]">
                  Try another search or create a new product.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#e8dfd2]">
              {filteredProducts.map((product) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={() => openEditEditor(product)}
                  onDelete={() => void deleteProduct(product)}
                  onInventoryChange={(nextInventory) =>
                    void updateInventory(product, nextInventory)
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {editorOpen && (
        <ProductEditor
          form={form}
          saving={saving}
          uploading={uploading}
          onClose={() => setEditorOpen(false)}
          onSubmit={saveProduct}
          onChange={updateForm}
          onNameChange={handleNameChange}
          onImageUpload={(file) => void handleImageUpload(file)}
        />
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-[#ded2c0] bg-[#efe6d8] px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c6d56]">
        {label}
      </p>
      <p className="mt-3 font-serif text-3xl font-light text-[#244a2c]">
        {value.toLocaleString()}
      </p>
    </article>
  );
}

function ProductRow({
  product,
  onEdit,
  onDelete,
  onInventoryChange,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onInventoryChange: (inventory: number) => void;
}) {
  const status = getInventoryStatus(product.inventory);

  return (
    <article className="grid gap-5 p-4 transition hover:bg-[#fbf6ee] sm:p-6 lg:grid-cols-[88px_minmax(0,1fr)_160px_190px_190px] lg:items-center">
      <div className="relative aspect-square w-[88px] overflow-hidden rounded-2xl border border-[#ded2c0] bg-[#efe6d8]">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={`${product.name} product image`}
            fill
            sizes="88px"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center px-2 text-center text-[10px] uppercase tracking-[0.12em] text-[#8b8173]">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-serif text-xl text-[#2d382f]">
            {product.name}
          </h3>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${status.className}`}
          >
            {status.label}
          </span>
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.15em] text-[#9a7543]">
          {product.category}
        </p>
        <p className="mt-2 truncate text-sm text-[#77786f]">/{product.slug}</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918675]">
          Price
        </p>
        <p className="mt-1 text-base font-medium text-[#2d382f]">
          {formatMoney(product.price)}
        </p>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#918675]">
          Inventory
        </p>
        <div className="inline-flex items-center overflow-hidden rounded-full border border-[#d8ccba] bg-white">
          <button
            type="button"
            aria-label={`Decrease ${product.name} inventory`}
            onClick={() => onInventoryChange(product.inventory - 1)}
            disabled={product.inventory <= 0}
            className="grid size-10 place-items-center text-lg text-[#244a2c] transition hover:bg-[#f2eadf] disabled:cursor-not-allowed disabled:opacity-30"
          >
            −
          </button>
          <input
            aria-label={`${product.name} inventory quantity`}
            type="number"
            min="0"
            step="1"
            value={product.inventory}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value) && value >= 0) {
                onInventoryChange(value);
              }
            }}
            className="w-16 border-x border-[#e2d7c8] bg-transparent text-center text-sm font-semibold outline-none"
          />
          <button
            type="button"
            aria-label={`Increase ${product.name} inventory`}
            onClick={() => onInventoryChange(product.inventory + 1)}
            className="grid size-10 place-items-center text-lg text-[#244a2c] transition hover:bg-[#f2eadf]"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        <button
          type="button"
          onClick={onEdit}
          className="min-h-10 rounded-full border border-[#bfae95] px-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#244a2c] transition hover:border-[#244a2c] hover:bg-[#eef3ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#244a2c]/30"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="min-h-10 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.12em] text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

function ProductEditor({
  form,
  saving,
  uploading,
  onClose,
  onSubmit,
  onChange,
  onNameChange,
  onImageUpload,
}: {
  form: ProductForm;
  saving: boolean;
  uploading: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: <K extends keyof ProductForm>(
    key: K,
    value: ProductForm[K],
  ) => void;
  onNameChange: (value: string) => void;
  onImageUpload: (file: File) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#1d2c20]/45 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close product editor"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-editor-title"
        className="absolute right-0 top-0 z-10 h-full w-full max-w-3xl overflow-y-auto border-l border-[#d7c9b5] bg-[#f7f1e8] shadow-2xl"
      >
        <form onSubmit={onSubmit}>
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#ddcfbd] bg-[#f7f1e8]/95 px-5 py-4 backdrop-blur sm:px-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a3742b]">
                {form.id ? "Edit product" : "New product"}
              </p>
              <h2
                id="product-editor-title"
                className="mt-1 font-serif text-2xl font-light text-[#244a2c]"
              >
                {form.name || "Product details"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="grid size-10 place-items-center rounded-full border border-[#d6c9b8] text-xl text-[#4f574e] transition hover:bg-[#ede3d5]"
            >
              ×
            </button>
          </div>

          <div className="space-y-8 px-5 py-6 sm:px-8 sm:py-8">
            <EditorSection
              eyebrow="01"
              title="Product identity"
              description="The core information customers see across product cards and product pages."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Product name">
                  <input
                    required
                    value={form.name}
                    onChange={(event) => onNameChange(event.target.value)}
                    className={inputClassName}
                    placeholder="Turmeric Brightening Soap"
                  />
                </Field>

                <Field label="Slug">
                  <input
                    required
                    value={form.slug}
                    onChange={(event) =>
                      onChange("slug", slugify(event.target.value))
                    }
                    className={inputClassName}
                    placeholder="turmeric-brightening-soap"
                  />
                </Field>

                <Field label="Category">
                  <input
                    required
                    value={form.category}
                    onChange={(event) =>
                      onChange("category", event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Skin Care"
                  />
                </Field>

                <Field label="Buzz words">
                  <input
                    value={form.buzzWords}
                    onChange={(event) =>
                      onChange("buzzWords", event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Brighten • Cleanse • Glow"
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    onChange("description", event.target.value)
                  }
                  rows={5}
                  className={`${inputClassName} resize-y rounded-2xl py-3`}
                  placeholder="Describe what the product is and who it is for..."
                />
              </Field>
            </EditorSection>

            <EditorSection
              eyebrow="02"
              title="Price & inventory"
              description="Stock changes made here are reflected in the owner inventory view."
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Price (USD)">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => onChange("price", event.target.value)}
                    className={inputClassName}
                    placeholder="25.00"
                  />
                </Field>

                <Field label="Inventory">
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.inventory}
                    onChange={(event) =>
                      onChange("inventory", event.target.value)
                    }
                    className={inputClassName}
                    placeholder="20"
                  />
                </Field>
              </div>
            </EditorSection>

            <EditorSection
              eyebrow="03"
              title="Product image"
              description="Upload a new image or keep an existing GitHub-hosted image URL."
            >
              <div className="grid gap-5 sm:grid-cols-[170px_1fr] sm:items-start">
                <div className="relative aspect-square overflow-hidden rounded-3xl border border-[#d9cbb8] bg-[#efe6d8]">
                  {form.imageUrl ? (
                    <Image
                      src={form.imageUrl}
                      alt="Product preview"
                      fill
                      sizes="170px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center p-5 text-center text-xs uppercase tracking-[0.14em] text-[#8b8173]">
                      Image preview
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Field label="Image URL">
                    <input
                      value={form.imageUrl}
                      onChange={(event) =>
                        onChange("imageUrl", event.target.value)
                      }
                      className={inputClassName}
                      placeholder="https://raw.githubusercontent.com/..."
                    />
                  </Field>

                  <div>
                    <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-[#244a2c] px-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#244a2c] transition hover:bg-[#e8efe7]">
                      {uploading ? "Uploading…" : "Upload image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        disabled={uploading}
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (file) onImageUpload(file);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    <p className="mt-2 text-xs leading-5 text-[#7e7f77]">
                      The upload route should commit the file server-side using
                      your GitHub token. Never expose that token in this client
                      component.
                    </p>
                  </div>
                </div>
              </div>
            </EditorSection>

            <EditorSection
              eyebrow="04"
              title="Product details"
              description="These fields map to your ProductDetail relation and can power the detailed product page content."
            >
              <div className="grid gap-5">
                <Field label="Highlight 1">
                  <input
                    value={form.highlight1}
                    onChange={(event) =>
                      onChange("highlight1", event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Supports a brighter-looking complexion"
                  />
                </Field>

                <Field label="Highlight 2">
                  <input
                    value={form.highlight2}
                    onChange={(event) =>
                      onChange("highlight2", event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Cleanses without leaving skin feeling stripped"
                  />
                </Field>

                <Field label="Highlight 3">
                  <input
                    value={form.highlight3}
                    onChange={(event) =>
                      onChange("highlight3", event.target.value)
                    }
                    className={inputClassName}
                    placeholder="Made for a simple daily routine"
                  />
                </Field>

                <Field label="How to use">
                  <textarea
                    value={form.howToUse? form.howToUse : ""}
                    onChange={(event) =>
                      onChange("howToUse", event.target.value)
                    }
                    rows={5}
                    className={`${inputClassName} resize-y rounded-2xl py-3`}
                    placeholder="Wet skin, lather gently, massage, rinse..."
                  />
                </Field>
              </div>
            </EditorSection>
          </div>

          <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-3 border-t border-[#ddcfbd] bg-[#f7f1e8]/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 rounded-full border border-[#bfae95] px-6 text-xs font-semibold uppercase tracking-[0.14em] text-[#4d504a] transition hover:bg-[#ede4d7]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="min-h-12 rounded-full bg-[#244a2c] px-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#fffaf2] transition hover:bg-[#19371f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving…"
                : form.id
                  ? "Save changes"
                  : "Create product"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function EditorSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[26px] border border-[#ded2c0] bg-[#fffaf2] p-5 sm:p-6">
      <div className="mb-6 border-b border-[#eadfd0] pb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a3742b]">
          {eyebrow}
        </p>
        <h3 className="mt-1 font-serif text-2xl font-light text-[#2d382f]">
          {title}
        </h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#74756e]">
          {description}
        </p>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#615c54]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClassName =
  "min-h-11 w-full rounded-xl border border-[#d8ccba] bg-[#fbf7f0] px-3.5 text-sm text-[#2d382f] outline-none transition placeholder:text-[#a19b91] focus:border-[#244a2c] focus:ring-2 focus:ring-[#244a2c]/10";
