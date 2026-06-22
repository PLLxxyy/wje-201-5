import { useState, useEffect, useCallback } from 'react';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PartyPlanPage } from './pages/PartyPlanPage';
import type { PartyPlanItem } from './types';

type Page = { type: 'home' } | { type: 'detail'; id: string } | { type: 'favorites' } | { type: 'party-plan' };

const FAVORITES_KEY = 'cocktail-favorites';
const PARTY_PLAN_KEY = 'cocktail-party-plan';

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function loadPartyPlan(): PartyPlanItem[] {
  try {
    const raw = localStorage.getItem(PARTY_PLAN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePartyPlan(items: PartyPlanItem[]) {
  localStorage.setItem(PARTY_PLAN_KEY, JSON.stringify(items));
}

export default function App() {
  const [page, setPage] = useState<Page>({ type: 'home' });
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [partyPlan, setPartyPlan] = useState<PartyPlanItem[]>(loadPartyPlan);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    savePartyPlan(partyPlan);
  }, [partyPlan]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id],
    );
  }, []);

  const togglePartyPlan = useCallback((id: string) => {
    setPartyPlan(prev => {
      const exists = prev.find(p => p.cocktailId === id);
      if (exists) {
        return prev.filter(p => p.cocktailId !== id);
      } else {
        const maxOrder = prev.length > 0 ? Math.max(...prev.map(p => p.order)) : 0;
        return [...prev, { cocktailId: id, order: maxOrder + 1 }];
      }
    });
  }, []);

  const updatePartyPlanOrder = useCallback((items: PartyPlanItem[]) => {
    setPartyPlan(items);
  }, []);

  const clearPartyPlan = useCallback(() => {
    setPartyPlan([]);
  }, []);

  const navigate = useCallback((p: Page) => {
    setPage(p);
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="header-top">
          <div
            className="logo"
            onClick={() => navigate({ type: 'home' })}
            role="button"
            tabIndex={0}
          >
            <span className="logo-icon">🍸</span>
            <span>调酒配方大全</span>
          </div>
          <nav className="nav-links">
            <button
              className={`nav-btn ${page.type === 'home' ? 'active' : ''}`}
              onClick={() => navigate({ type: 'home' })}
            >
              🏠 首页
            </button>
            <button
              className={`nav-btn ${page.type === 'favorites' ? 'active' : ''}`}
              onClick={() => navigate({ type: 'favorites' })}
            >
              ❤️ 收藏
              {favorites.length > 0 && <span className="badge">{favorites.length}</span>}
            </button>
            <button
              className={`nav-btn ${page.type === 'party-plan' ? 'active' : ''}`}
              onClick={() => navigate({ type: 'party-plan' })}
            >
              🎉 派对计划
              {partyPlan.length > 0 && <span className="badge">{partyPlan.length}</span>}
            </button>
          </nav>
        </div>
      </header>

      {page.type === 'home' && (
        <HomePage
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          openDetail={(id) => navigate({ type: 'detail', id })}
          partyPlanIds={partyPlan.map(p => p.cocktailId)}
          togglePartyPlan={togglePartyPlan}
        />
      )}

      {page.type === 'detail' && (
        <DetailPage
          id={page.id}
          isFavorite={favorites.includes(page.id)}
          toggleFavorite={toggleFavorite}
          goBack={() => navigate({ type: 'home' })}
        />
      )}

      {page.type === 'favorites' && (
        <FavoritesPage
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          openDetail={(id) => navigate({ type: 'detail', id })}
          goHome={() => navigate({ type: 'home' })}
        />
      )}

      {page.type === 'party-plan' && (
        <PartyPlanPage
          partyPlan={partyPlan}
          updatePartyPlanOrder={updatePartyPlanOrder}
          togglePartyPlan={togglePartyPlan}
          clearPartyPlan={clearPartyPlan}
          openDetail={(id) => navigate({ type: 'detail', id })}
          goHome={() => navigate({ type: 'home' })}
        />
      )}
    </>
  );
}
