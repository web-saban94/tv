import fs from "node:fs";
import path from "node:path";

export interface ProductOverride {
  sku: string;
  imageUrl?: string;
  videoUrl?: string;
  tdsUrl?: string;
  saleTag?: string;
  coverageM2?: number | null;
  coverageNote?: string;
  activeInSignage?: boolean;
  updatedAt: string;
}

const OVERRIDES_FILE = path.resolve(process.cwd(), ".product-overrides.json");

let memoryOverrides: Record<string, ProductOverride> = {};

// Load persisted overrides from disk on module init
try {
  if (fs.existsSync(OVERRIDES_FILE)) {
    const raw = fs.readFileSync(OVERRIDES_FILE, "utf-8");
    memoryOverrides = JSON.parse(raw);
  }
} catch (e) {
  console.warn("[Overrides] Could not load .product-overrides.json:", e);
}

export function getAllOverrides(): Record<string, ProductOverride> {
  try {
    if (fs.existsSync(OVERRIDES_FILE)) {
      const raw = fs.readFileSync(OVERRIDES_FILE, "utf-8");
      memoryOverrides = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("[Overrides] Could not reload .product-overrides.json:", e);
  }
  return { ...memoryOverrides };
}

export function setOverride(sku: string, override: Partial<ProductOverride>): ProductOverride {
  const cleanSku = String(sku).trim();
  const all = getAllOverrides();
  const current = all[cleanSku] || { sku: cleanSku, updatedAt: new Date().toISOString() };
  const updated: ProductOverride = {
    ...current,
    ...override,
    sku: cleanSku,
    updatedAt: new Date().toISOString(),
  };
  memoryOverrides[cleanSku] = updated;

  try {
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(memoryOverrides, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Overrides] Could not save .product-overrides.json:", err);
  }

  return updated;
}

export function clearOverride(sku: string): boolean {
  const cleanSku = String(sku).trim();
  const all = getAllOverrides();
  if (all[cleanSku]) {
    delete memoryOverrides[cleanSku];
    try {
      fs.writeFileSync(OVERRIDES_FILE, JSON.stringify(memoryOverrides, null, 2), "utf-8");
    } catch (err) {
      console.warn("[Overrides] Could not save .product-overrides.json:", err);
    }
    return true;
  }
  return false;
}

export function clearAllOverrides(): void {
  memoryOverrides = {};
  try {
    fs.writeFileSync(OVERRIDES_FILE, JSON.stringify({}, null, 2), "utf-8");
  } catch (err) {
    console.warn("[Overrides] Could not save .product-overrides.json:", err);
  }
}

export function applyOverridesToProducts<T extends { sku: string }>(products: T[]): T[] {
  if (!products || !Array.isArray(products)) return products;
  const overrides = getAllOverrides();

  return products.map((item) => {
    const cleanSku = String(item.sku || "").trim();
    const o = overrides[cleanSku];
    if (!o) return item;

    const merged = { ...item } as Record<string, unknown>;

    if (o.saleTag !== undefined) {
      merged.saleTag = o.saleTag;
      merged.discountTag = o.saleTag;
    }
    if (o.coverageM2 !== undefined && o.coverageM2 !== null) {
      merged.coverageM2 = o.coverageM2;
      merged.coveragePerUnitM2 = o.coverageM2;
    }
    if (o.coverageNote !== undefined) {
      merged.coverageNote = o.coverageNote;
    }
    if (o.imageUrl !== undefined && o.imageUrl.trim()) {
      merged.imageUrl = o.imageUrl;
      merged.image = o.imageUrl;
    }
    if (o.videoUrl !== undefined && o.videoUrl.trim()) {
      merged.videoUrl = o.videoUrl;
      merged.mediaUrl = o.videoUrl;
    }
    if (o.tdsUrl !== undefined && o.tdsUrl.trim()) {
      merged.tdsUrl = o.tdsUrl;
    }
    if (o.activeInSignage !== undefined) {
      merged.activeInSignage = o.activeInSignage;
      merged.isActive = o.activeInSignage;
    }

    merged._hasOverride = true;
    merged._overrideUpdatedAt = o.updatedAt;

    return merged as T;
  });
}
