export interface Cocktail {
  id: string;
  name: string;
  nameEn: string;
  baseSpirit: BaseSpirit;
  difficulty: number; // 1-5
  abv: number; // alcohol by volume percentage
  color: string; // hex color for the card strip
  flavor: string;
  description: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  tips: string;
}

export type BaseSpirit = '伏特加' | '威士忌' | '朗姆酒' | '金酒' | '龙舌兰' | '其他';

export const BASE_SPIRITS: BaseSpirit[] = ['伏特加', '威士忌', '朗姆酒', '金酒', '龙舌兰', '其他'];

export interface PartyPlanItem {
  cocktailId: string;
  order: number;
}

export interface ShoppingListItem {
  name: string;
  amountGroups: ShoppingAmountGroup[];
  cocktails: string[];
}

export interface ShoppingAmountGroup {
  type: 'numeric' | 'range' | 'description';
  unit: string;
  totalAmount: string;
  count: number;
}

export interface ParsedAmount {
  type: 'numeric' | 'range' | 'description';
  value: number;
  min?: number;
  max?: number;
  unit: string;
  raw: string;
}
