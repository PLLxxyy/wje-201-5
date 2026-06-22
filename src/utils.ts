import type { Cocktail, ParsedAmount, ShoppingListItem, ShoppingAmountGroup } from './types';

export function parseAmount(amountStr: string): ParsedAmount {
  const trimmed = amountStr.trim();

  const rangeMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*([\u4e00-\u9fa5a-zA-Z]+)?$/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    const unit = rangeMatch[3] || '';
    return {
      type: 'range',
      value: (min + max) / 2,
      min,
      max,
      unit,
      raw: trimmed,
    };
  }

  const numericMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*([\u4e00-\u9fa5a-zA-Z]+)?$/);
  if (numericMatch) {
    const value = parseFloat(numericMatch[1]);
    const unit = numericMatch[2] || '';
    return {
      type: 'numeric',
      value,
      unit,
      raw: trimmed,
    };
  }

  return {
    type: 'description',
    value: 0,
    unit: trimmed,
    raw: trimmed,
  };
}

function formatAmount(value: number, unit: string, type: 'numeric' | 'range', min?: number, max?: number): string {
  if (type === 'range' && min !== undefined && max !== undefined) {
    const formatNum = (n: number) => {
      if (Number.isInteger(n)) return n.toString();
      return n.toFixed(1).replace(/\.0$/, '');
    };
    return `${formatNum(min)}-${formatNum(max)}${unit}`;
  }

  const formatNum = (n: number) => {
    if (Number.isInteger(n)) return n.toString();
    return n.toFixed(1).replace(/\.0$/, '');
  };
  return `${formatNum(value)}${unit}`;
}

export function generateShoppingList(cocktails: Cocktail[]): ShoppingListItem[] {
  const ingredientMap = new Map<string, {
    unitGroups: Map<string, {
      type: 'numeric' | 'range' | 'description';
      totalValue: number;
      totalMin: number;
      totalMax: number;
      count: number;
    }>;
    cocktails: string[];
  }>();

  cocktails.forEach(cocktail => {
    cocktail.ingredients.forEach(ing => {
      const parsed = parseAmount(ing.amount);

      if (!ingredientMap.has(ing.name)) {
        ingredientMap.set(ing.name, {
          unitGroups: new Map(),
          cocktails: [],
        });
      }

      const entry = ingredientMap.get(ing.name)!;

      if (!entry.cocktails.includes(cocktail.name)) {
        entry.cocktails.push(cocktail.name);
      }

      const groupKey = parsed.type === 'description' ? `desc:${parsed.raw}` : parsed.unit;

      if (!entry.unitGroups.has(groupKey)) {
        entry.unitGroups.set(groupKey, {
          type: parsed.type,
          totalValue: 0,
          totalMin: 0,
          totalMax: 0,
          count: 0,
        });
      }

      const group = entry.unitGroups.get(groupKey)!;
      group.count += 1;

      if (parsed.type === 'numeric') {
        group.type = 'numeric';
        group.totalValue += parsed.value;
      } else if (parsed.type === 'range') {
        group.type = 'range';
        group.totalMin += (parsed.min || 0);
        group.totalMax += (parsed.max || 0);
        group.totalValue += parsed.value;
      } else {
        group.type = 'description';
        group.totalValue = 1;
      }
    });
  });

  const result: ShoppingListItem[] = [];

  ingredientMap.forEach((entry, name) => {
    const amountGroups: ShoppingAmountGroup[] = [];

    entry.unitGroups.forEach((group, key) => {
      if (group.type === 'description') {
        amountGroups.push({
          type: 'description',
          unit: key.replace(/^desc:/, ''),
          totalAmount: key.replace(/^desc:/, ''),
          count: group.count,
        });
      } else {
        const unit = key;
        let totalAmount: string;

        if (group.type === 'range') {
          totalAmount = formatAmount(group.totalValue, unit, 'range', group.totalMin, group.totalMax);
        } else {
          totalAmount = formatAmount(group.totalValue, unit, 'numeric');
        }

        amountGroups.push({
          type: group.type,
          unit,
          totalAmount,
          count: group.count,
        });
      }
    });

    amountGroups.sort((a, b) => {
      const typeOrder = { numeric: 0, range: 1, description: 2 };
      if (typeOrder[a.type] !== typeOrder[b.type]) {
        return typeOrder[a.type] - typeOrder[b.type];
      }
      return a.unit.localeCompare(b.unit, 'zh-CN');
    });

    result.push({
      name,
      amountGroups,
      cocktails: entry.cocktails,
    });
  });

  result.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

  return result;
}
