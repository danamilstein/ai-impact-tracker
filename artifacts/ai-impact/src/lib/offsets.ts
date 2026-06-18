/**
 * Offset catalog (v1.4 §3 + §4 Integration 2).
 *
 * Each offset is a real behavioral practice a user might choose. The
 * `contextNote` is deliberate methodological honesty: offsets are NOT simple
 * binary choices — geography, weather, safety, access, ability, financial
 * constraint, security updates, and food sensitivity all shape whether a given
 * practice is viable for a given person. The `dimensions` array tags which of
 * the Seven Dimensions of Wellness the practice tends to serve, turning the
 * catalog from a guilt-management menu into a whole-person practice menu.
 */
import type { DimensionKey } from "@/lib/wellness";

export const OFFSET_CATALOG_INTRO =
  "These offsets aren't simple binary choices — weather, safety, access, and ability all matter.";

export interface Offset {
  id: string;
  label: string;
  contextNote: string;
  dimensions: DimensionKey[];
}

export const OFFSETS: Offset[] = [
  {
    id: "bike-walk",
    label: "Bike or walk a trip you'd have Ubered",
    contextNote: "Depends on safety, weather, distance, daylight, and physical ability. Not always available.",
    dimensions: ["environmental", "physical", "emotional", "social"],
  },
  {
    id: "transit",
    label: "Public transit instead of driving",
    contextNote: "Depends on transit access and the time you can afford to spend. Some cities are easier than others.",
    dimensions: ["environmental", "occupational"],
  },
  {
    id: "oat-milk",
    label: "Oat milk over dairy",
    contextNote: "Depends on access and how your body tolerates oat milk. Not a universal upgrade.",
    dimensions: ["environmental", "physical"],
  },
  {
    id: "plant-lunch",
    label: "One plant-based lunch instead of beef",
    contextNote: "Depends on food access, nutrient needs, and your relationship with food. The action matters more than the rule.",
    dimensions: ["environmental", "physical"],
  },
  {
    id: "reusable-mug",
    label: "Reusable mug over disposable cup",
    contextNote: "Depends on whether you can carry it, wash it, and remember it. Some coffee shops also charge less when you bring your own.",
    dimensions: ["environmental"],
  },
  {
    id: "thrifted-clothing",
    label: "Thrifted or kept clothing over fast fashion",
    contextNote: "Depends on what fits, what you can find, and how much time you have. Repair counts too.",
    dimensions: ["environmental", "emotional"],
  },
  {
    id: "keep-phone",
    label: "Keep your phone an extra year",
    contextNote: "Depends on whether it still gets security updates and whether the battery still holds a charge. Sometimes upgrading is the right call.",
    dimensions: ["environmental", "occupational"],
  },
  {
    id: "repair-laptop",
    label: "Repair instead of replace a laptop",
    contextNote: "Depends on whether parts are available and what the repair costs versus replacement.",
    dimensions: ["environmental", "occupational"],
  },
  {
    id: "standard-shipping",
    label: "Standard shipping instead of overnight",
    contextNote: "Depends on when you need it. The carbon difference is real but so is the deadline.",
    dimensions: ["environmental"],
  },
  {
    id: "library-book",
    label: "Library book or e-book instead of buying",
    contextNote: "Depends on what your library has and whether you write in books. Some textbooks aren't loanable.",
    dimensions: ["environmental", "intellectual"],
  },
  {
    id: "skip-flight",
    label: "Skip one short-haul flight",
    contextNote: "Depends on the trip's purpose and whether train or bus reaches your destination in a tolerable time.",
    dimensions: ["environmental", "social", "spiritual"],
  },
];
