import { create } from "zustand";
import type * as THREE from "three";

export type GarmentType = "tshirt" | "polo" | "hoodie" | "tank";
export type GarmentSize = "S" | "M" | "L" | "XL" | "XXL";
export type PrintType = "DTF" | "PUF" | "Embroidery";
export type Panel =
  | "product"
  | "color"
  | "upload"
  | "print"
  | "effects"
  | "buy"
  | null;
export type View = "front" | "back";

export interface CustomizerState {
  // Catalog-backed selections (drive ordering)
  selectedProductSlug: string;
  selectedColorSlug: string | null;
  selectedSizeCode: string;
  selectedPrintTypeSlug: string;

  // Local-only state (drives the 3D scene / UI)
  garment: GarmentType;
  size: GarmentSize;
  color: string;
  printType: PrintType;
  view: View;
  studioBg: string;
  activePanel: Panel;
  cartOpen: boolean;

  imageUrl: string | null;
  text: string;
  textColor: string;

  garmentRoot: THREE.Object3D | null;

  // Setters
  setSelectedProduct: (slug: string, garmentType: GarmentType) => void;
  setSelectedColor: (slug: string | null, hex: string) => void;
  setSelectedSize: (code: string) => void;
  setSelectedPrintType: (slug: string, label: PrintType) => void;

  setGarment: (g: GarmentType) => void;
  setSize: (s: GarmentSize) => void;
  setColor: (c: string) => void;
  setPrintType: (p: PrintType) => void;
  setView: (v: View) => void;
  setStudioBg: (c: string) => void;
  openPanel: (p: Panel) => void;
  closePanel: () => void;
  toggleView: () => void;
  setCartOpen: (open: boolean) => void;

  setImageUrl: (url: string | null) => void;
  setText: (text: string) => void;
  setTextColor: (color: string) => void;
  clearDesign: () => void;

  setGarmentRoot: (g: THREE.Object3D | null) => void;
}

export const STUDIO_BACKDROPS = ["#FFAB9F", "#FFFFFF", "#111111", "#E8E4DC", "#C7E6E2"];

export const useCustomizer = create<CustomizerState>((set) => ({
  selectedProductSlug: "oversized-cotton-tshirt",
  selectedColorSlug: "white",
  selectedSizeCode: "M",
  selectedPrintTypeSlug: "dtf",

  garment: "tshirt",
  size: "M",
  color: "#FFFFFF",
  printType: "DTF",
  view: "front",
  studioBg: STUDIO_BACKDROPS[0],
  activePanel: null,
  cartOpen: false,

  imageUrl: null,
  text: "",
  textColor: "#0f1115",

  garmentRoot: null,

  setSelectedProduct: (slug, garmentType) =>
    set({ selectedProductSlug: slug, garment: garmentType }),
  setSelectedColor: (slug, hex) =>
    set({ selectedColorSlug: slug, color: hex }),
  setSelectedSize: (code) =>
    set({ selectedSizeCode: code, size: code as GarmentSize }),
  setSelectedPrintType: (slug, label) =>
    set({ selectedPrintTypeSlug: slug, printType: label }),

  setGarment: (garment) => set({ garment }),
  setSize: (size) => set({ size }),
  setColor: (color) => set({ color, selectedColorSlug: null }),
  setPrintType: (printType) => set({ printType }),
  setView: (view) => set({ view }),
  setStudioBg: (studioBg) => set({ studioBg }),
  openPanel: (activePanel) => set({ activePanel }),
  closePanel: () => set({ activePanel: null }),
  toggleView: () =>
    set((s) => ({ view: s.view === "front" ? "back" : "front" })),
  setCartOpen: (cartOpen) => set({ cartOpen }),

  setImageUrl: (imageUrl) => set({ imageUrl }),
  setText: (text) => set({ text }),
  setTextColor: (textColor) => set({ textColor }),
  clearDesign: () => set({ imageUrl: null, text: "" }),

  setGarmentRoot: (garmentRoot) => set({ garmentRoot }),
}));
