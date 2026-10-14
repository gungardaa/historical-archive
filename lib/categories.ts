import type { CategorySlug } from "@/types/archive";

export interface CategoryMeta {
  slug: CategorySlug;
  label: string;
  numeral: string;
  note: string;
  intro: string;
}

// ponytail: hardcoded curatorial copy, no CMS — move to data/categories.json if non-devs need to edit it.
export const CATEGORIES: CategoryMeta[] = [
  {
    slug: "wars",
    label: "Wars",
    numeral: "I",
    note: "Conflicts that redrew maps",
    intro:
      "Prolonged conflicts between states and peoples. The great ruptures that ended empires and drew the borders we live with.",
  },
  {
    slug: "battles",
    label: "Battles",
    numeral: "II",
    note: "Single days that decided eras",
    intro:
      "Compressed violence in which a single field, a single day and a single decision bent the longer war around it.",
  },
  {
    slug: "empires",
    label: "Empires",
    numeral: "III",
    note: "Civilizations at their height",
    intro:
      "The large orders. How they rose, what held them together and what their collapse left behind.",
  },
  {
    slug: "people",
    label: "People",
    numeral: "IV",
    note: "Lives that bent history",
    intro:
      "Individuals whose choices scaled up beyond their own lifetimes, from generals and rulers to voices that carried further still.",
  },
  {
    slug: "technology",
    label: "Technology",
    numeral: "V",
    note: "Machines and material craft",
    intro:
      "Instruments of power and knowledge, from concrete that heals in seawater to machines that ended the battleship age.",
  },
  {
    slug: "oddities",
    label: "Oddities",
    numeral: "VI",
    note: "Strange but documented events",
    intro:
      "The archive's cabinet of curiosities holds mysteries, impossible missions and events that read like fiction but happened.",
  },
];

export function getCategory(slug: string): CategoryMeta | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}
