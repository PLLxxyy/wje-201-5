import { useMemo } from 'react';
import { cocktails } from '../data';
import { generateShoppingList } from '../utils';
import type { PartyPlanItem, ShoppingListItem } from '../types';

interface Props {
  partyPlan: PartyPlanItem[];
  updatePartyPlanOrder: (items: PartyPlanItem[]) => void;
  togglePartyPlan: (id: string) => void;
  clearPartyPlan: () => void;
  openDetail: (id: string) => void;
  goHome: () => void;
}

export function PartyPlanPage({
  partyPlan,
  updatePartyPlanOrder,
  togglePartyPlan,
  clearPartyPlan,
  openDetail,
  goHome,
}: Props) {
  const sortedPlan = useMemo(
    () => [...partyPlan].sort((a, b) => a.order - b.order),
    [partyPlan]
  );

  const planCocktails = useMemo(() => {
    return sortedPlan
      .map(item => ({
        ...item,
        cocktail: cocktails.find(c => c.id === item.cocktailId),
      }))
      .filter(item => item.cocktail !== undefined);
  }, [sortedPlan]);

  const shoppingList = useMemo((): ShoppingListItem[] => {
    const cocktailList = planCocktails
      .map(p => p.cocktail)
      .filter((c): c is typeof cocktails[0] => c !== undefined);
    return generateShoppingList(cocktailList);
  }, [planCocktails]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newPlan = [...sortedPlan];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newPlan.length) return;

    [newPlan[index], newPlan[targetIndex]] = [newPlan[targetIndex], newPlan[index]];

    const reordered = newPlan.map((item, i) => ({
      ...item,
      order: i + 1,
    }));

    updatePartyPlanOrder(reordered);
  };

  if (partyPlan.length === 0) {
    return (
      <main className="main-content">
        <div className="empty-state">
          <span className="icon">🎉</span>
          <h3>派对计划是空的</h3>
          <p>去首页浏览鸡尾酒，点击卡片上的 ⬜ 勾选想要调制的酒款吧！</p>
          <button
            className="detail-fav-btn"
            style={{ marginTop: 20 }}
            onClick={goHome}
          >
            去首页选酒
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="party-plan-page">
      <main className="main-content">
        <div className="party-plan-header">
          <div>
            <h1 className="party-plan-title">🎉 派对计划</h1>
            <p className="party-plan-subtitle">
              已选择 <span className="results-count">{planCocktails.length}</span> 款鸡尾酒，
              共 <span className="results-count">{shoppingList.length}</span> 项用料需要采购
            </p>
          </div>
          <button
            className="clear-plan-btn"
            onClick={clearPartyPlan}
          >
            🗑️ 清空计划
          </button>
        </div>

        <div className="party-plan-sections">
          <div className="party-plan-section">
            <h2 className="section-title">
              <span className="icon">📋</span> 调酒顺序
            </h2>
            <div className="drink-order-list">
              {planCocktails.map(({ cocktail, order }, index) => (
                <div
                  key={cocktail!.id}
                  className="drink-order-item"
                >
                  <div className="drink-order-number">{order}</div>
                  <div
                    className="drink-order-info"
                    onClick={() => openDetail(cocktail!.id)}
                  >
                    <div
                      className="drink-order-color"
                      style={{ background: cocktail!.color }}
                    />
                    <div>
                      <div className="drink-order-name">{cocktail!.name}</div>
                      <div className="drink-order-name-en">{cocktail!.nameEn}</div>
                    </div>
                  </div>
                  <div className="drink-order-actions">
                    <button
                      className="order-btn"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      title="上移"
                    >
                      ↑
                    </button>
                    <button
                      className="order-btn"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === planCocktails.length - 1}
                      title="下移"
                    >
                      ↓
                    </button>
                    <button
                      className="remove-btn"
                      onClick={() => togglePartyPlan(cocktail!.id)}
                      title="移除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="party-plan-section">
            <h2 className="section-title">
              <span className="icon">🛒</span> 购物清单
            </h2>
            <div className="shopping-list">
              {shoppingList.map((item, index) => (
                <div key={index} className="shopping-item">
                  <div className="shopping-item-main">
                    <span className="shopping-item-name">{item.name}</span>
                  </div>
                  <div className="shopping-item-amounts">
                    {item.amountGroups.map((group, gIndex) => (
                      <div
                        key={gIndex}
                        className={`shopping-amount-row ${group.type}`}
                      >
                        <span className="shopping-amount-value">
                          {group.totalAmount}
                        </span>
                        {group.count > 1 && group.type !== 'description' && (
                          <span className="shopping-amount-count">
                            ({group.count}款酒使用)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="shopping-item-cocktails">
                    用于：{item.cocktails.join('、')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
