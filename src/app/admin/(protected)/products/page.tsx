import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import ProductsManager, {
  type DeleteActionResult,
  type ProductActionResult,
  type ProductPayload,
} from "./ProductsManager";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  category: true,
  buzzWords: true,
  description: true,
  price: true,
  inventory: true,
  imageUrl: true,
  details: {
    select: {
      highlight1: true,
      highlight2: true,
      highlight3: true,
      howToUse: true,
    },
  },
} as const;

function validateProductPayload(payload: ProductPayload): ProductPayload {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid product data.");
  }

  const name = payload.name?.trim();
  const slug = payload.slug?.trim();
  const category = payload.category?.trim();

  if (!name) throw new Error("Product name is required.");
  if (!slug) throw new Error("Slug is required.");
  if (!category) throw new Error("Category is required.");

  if (!Number.isInteger(payload.price) || payload.price < 0) {
    throw new Error("Price must be a non-negative integer in cents.");
  }

  if (!Number.isInteger(payload.inventory) || payload.inventory < 0) {
    throw new Error("Inventory must be a whole number of 0 or more.");
  }

  return {
    name,
    slug,
    category,
    buzzWords: payload.buzzWords?.trim() ?? "",
    description: payload.description?.trim() ?? "",
    price: payload.price,
    inventory: payload.inventory,
    imageUrl: payload.imageUrl?.trim() ?? "",
    details: {
      highlight1: payload.details?.highlight1?.trim() ?? "",
      highlight2: payload.details?.highlight2?.trim() ?? "",
      highlight3: payload.details?.highlight3?.trim() ?? "",
      howToUse: payload.details?.howToUse?.trim() ?? null,
    },
  };
}

async function createProductAction(
  payload: ProductPayload,
): Promise<ProductActionResult> {
  "use server";

  // Add your existing admin-session check here as defense in depth.
  // Example: await requireAdminSession();

  try {
    const data = validateProductPayload(payload);

    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });

    if (existingProduct) {
      return {
        success: false,
        error: "A product with that slug already exists.",
      };
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category,
        buzzWords: data.buzzWords,
        description: data.description,
        price: data.price,
        inventory: data.inventory,
        imageUrl: data.imageUrl,
        details: {
          create: data.details,
        },
      },
      select: productSelect,
    });

    revalidatePath("/admin/products");

    return { success: true, product };
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not create product.",
    };
  }
}

async function updateProductAction(
  id: string,
  payload: ProductPayload,
): Promise<ProductActionResult> {
  "use server";

  // Add your existing admin-session check here as defense in depth.
  // Example: await requireAdminSession();

  try {
    if (!id) throw new Error("Product id is required.");

    const data = validateProductPayload(payload);

    const productWithSlug = await prisma.product.findUnique({
      where: { slug: data.slug },
      select: { id: true },
    });

    if (productWithSlug && productWithSlug.id !== id) {
      return {
        success: false,
        error: "Another product already uses that slug.",
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        category: data.category,
        buzzWords: data.buzzWords,
        description: data.description,
        price: data.price,
        inventory: data.inventory,
        imageUrl: data.imageUrl,
        details: {
          upsert: {
            create: data.details,
            update: data.details,
          },
        },
      },
      select: productSelect,
    });

    revalidatePath("/admin/products");

    return { success: true, product };
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Could not update product.",
    };
  }
}

async function updateInventoryAction(
  id: string,
  inventory: number,
): Promise<ProductActionResult> {
  "use server";

  // Add your existing admin-session check here as defense in depth.
  // Example: await requireAdminSession();

  try {
    if (!id) throw new Error("Product id is required.");

    if (!Number.isInteger(inventory) || inventory < 0) {
      throw new Error("Inventory must be a whole number of 0 or more.");
    }

    const product = await prisma.product.update({
      where: { id },
      data: { inventory },
      select: productSelect,
    });

    revalidatePath("/admin/products");

    return { success: true, product };
  } catch (error) {
    console.error("UPDATE INVENTORY ERROR:", error);

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Could not update inventory.",
    };
  }
}

async function deleteProductAction(id: string): Promise<DeleteActionResult> {
  "use server";

  // Add your existing admin-session check here as defense in depth.
  // Example: await requireAdminSession();

  try {
    if (!id) throw new Error("Product id is required.");

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/products");

    return { success: true };
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Could not delete product. It may still be referenced by an order, review, or another record.",
    };
  }
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    select: productSelect,
    orderBy: {
      name: "asc",
    },
  });

  return (
    <ProductsManager
      initialProducts={products}
      createProductAction={createProductAction}
      updateProductAction={updateProductAction}
      updateInventoryAction={updateInventoryAction}
      deleteProductAction={deleteProductAction}
    />
  );
}
