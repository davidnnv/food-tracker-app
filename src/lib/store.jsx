// App state: device preferences, local accounts, and the signed-in user's diary.
// Everything persists in localStorage under the `zalak:` prefix.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { translate } from './i18n.js';
import { DEFAULT_GOALS, scale } from './nutrition.js';
import { addDays } from './dates.js';
import { buildDemo } from './demo.js';
import { FOODS } from '../data/foods.js';

const KEY = { accounts: 'zalak:accounts', session: 'zalak:session', prefs: 'zalak:prefs', data: (id) => `zalak:data:${id}` };

const read = (k, fallback) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const remove = (k) => { try { localStorage.removeItem(k); } catch {} };
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));

async function hash(password, salt) {
  const text = `${salt}:${password}`;
  if (crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0; for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) | 0; return String(h);
}

export const emptyData = () => ({
  profile: { name: '', sex: 'female', age: '', heightCm: '', weightKg: '', activity: 'light', goal: 'maintain' },
  goals: { ...DEFAULT_GOALS },
  entries: {}, water: {}, weights: [], customFoods: [], favorites: [], recent: [], onboarded: false,
});

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

function initialLang() {
  const p = read(KEY.prefs, null);
  if (p?.lang) return p.lang;
  return (navigator.language || '').toLowerCase().startsWith('mk') ? 'mk' : 'en';
}

export function StoreProvider({ children }) {
  const [prefs, setPrefs] = useState(() => ({ theme: 'system', ...read(KEY.prefs, {}), lang: initialLang() }));
  const [userId, setUserId] = useState(() => read(KEY.session, null));
  const [account, setAccount] = useState(() => (read(KEY.accounts, []).find((a) => a.id === read(KEY.session, null)) || null));
  const [data, setData] = useState(() => (userId ? { ...emptyData(), ...read(KEY.data(userId), {}) } : null));
  const [toasts, setToasts] = useState([]);
  const toastTimers = useRef({});

  // Persist
  useEffect(() => write(KEY.prefs, prefs), [prefs]);
  useEffect(() => { if (userId && data) write(KEY.data(userId), data); }, [userId, data]);

  // Theme + language on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.lang = prefs.lang;
    if (prefs.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', prefs.theme);
  }, [prefs]);

  const t = useCallback((k, v) => translate(prefs.lang, k, v), [prefs.lang]);
  const foodName = useCallback((f) => (typeof f?.name === 'string' ? f.name : f?.name?.[prefs.lang] || f?.name?.en || ''), [prefs.lang]);

  // ---------- toasts ----------
  const toast = useCallback((message, action) => {
    const id = uid();
    setToasts((ts) => [...ts.slice(-2), { id, message, action }]);
    toastTimers.current[id] = setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), action ? 5000 : 2600);
  }, []);
  const dismissToast = useCallback((id) => { clearTimeout(toastTimers.current[id]); setToasts((ts) => ts.filter((x) => x.id !== id)); }, []);

  // ---------- auth ----------
  const startSession = (acc, d) => {
    write(KEY.session, acc.id);
    setAccount(acc); setUserId(acc.id); setData(d);
  };

  const signup = async ({ name, email, password }) => {
    const accounts = read(KEY.accounts, []);
    const e = email.trim().toLowerCase();
    if (accounts.some((a) => a.email === e)) throw new Error('errExists');
    const salt = uid();
    const acc = { id: uid(), name: name.trim(), email: e, salt, hash: await hash(password, salt), createdAt: Date.now() };
    write(KEY.accounts, [...accounts, acc]);
    const d = emptyData(); d.profile.name = acc.name;
    write(KEY.data(acc.id), d);
    startSession(acc, d);
  };

  const login = async ({ email, password }) => {
    const acc = read(KEY.accounts, []).find((a) => a.email === email.trim().toLowerCase());
    if (!acc || (await hash(password, acc.salt)) !== acc.hash) throw new Error('errLogin');
    startSession(acc, { ...emptyData(), ...read(KEY.data(acc.id), {}) });
  };

  const loginDemo = async () => {
    const accounts = read(KEY.accounts, []);
    let acc = accounts.find((a) => a.email === 'demo@zalak.app');
    if (!acc) {
      const salt = uid();
      acc = { id: uid(), name: 'Ana', email: 'demo@zalak.app', salt, hash: await hash('demo1234', salt), createdAt: Date.now(), demo: true };
      write(KEY.accounts, [...accounts, acc]);
    }
    const d = { ...emptyData(), ...buildDemo() }; // fresh sample data each time
    write(KEY.data(acc.id), d);
    startSession(acc, d);
  };

  const logout = () => { remove(KEY.session); setUserId(null); setAccount(null); setData(null); };

  // ---------- diary ----------
  const update = useCallback((fn) => setData((d) => ({ ...d, ...fn(d) })), []);

  const allFoods = useMemo(() => [...(data?.customFoods || []), ...FOODS], [data?.customFoods]);
  const findFood = useCallback((id) => allFoods.find((f) => f.id === id), [allFoods]);

  const addEntry = (date, meal, food, grams) => {
    const entry = { id: uid(), meal, foodId: food.id, name: food.name, grams, ...scale(food.per100, grams), time: Date.now() };
    update((d) => ({
      entries: { ...d.entries, [date]: [...(d.entries[date] || []), entry] },
      recent: [food.id, ...d.recent.filter((x) => x !== food.id)].slice(0, 20),
    }));
    return entry;
  };

  const addQuick = (date, meal, { name, kcal, protein = 0, carbs = 0, fat = 0 }) => {
    const entry = { id: uid(), meal, foodId: null, name, grams: null, kcal, protein, carbs, fat, time: Date.now() };
    update((d) => ({ entries: { ...d.entries, [date]: [...(d.entries[date] || []), entry] } }));
  };

  const updateEntry = (date, id, { grams, meal }) => update((d) => ({
    entries: {
      ...d.entries,
      [date]: d.entries[date].map((e) => {
        if (e.id !== id) return e;
        const food = e.foodId && findFood(e.foodId);
        const next = { ...e, meal: meal ?? e.meal };
        if (food && grams) Object.assign(next, { grams, ...scale(food.per100, grams) });
        return next;
      }),
    },
  }));

  const removeEntry = (date, id) => {
    const list = data.entries[date] || [];
    const idx = list.findIndex((e) => e.id === id);
    const entry = list[idx];
    update((d) => ({ entries: { ...d.entries, [date]: d.entries[date].filter((e) => e.id !== id) } }));
    toast(translate(prefs.lang, 'deleted', { name: foodName(entry) }), {
      label: translate(prefs.lang, 'undo'),
      run: () => update((d) => { const l = [...(d.entries[date] || [])]; l.splice(idx, 0, entry); return { entries: { ...d.entries, [date]: l } }; }),
    });
  };

  const copyMeal = (date, meal) => {
    const src = (data.entries[addDays(date, -1)] || []).filter((e) => e.meal === meal);
    if (!src.length) return 0;
    const copies = src.map((e) => ({ ...e, id: uid(), time: Date.now() }));
    update((d) => ({ entries: { ...d.entries, [date]: [...(d.entries[date] || []), ...copies] } }));
    return copies.length;
  };

  const setWater = (date, ml) => update((d) => ({ water: { ...d.water, [date]: Math.max(0, Math.min(6000, ml)) } }));

  const saveWeight = (date, kg) => update((d) => {
    const weights = [...d.weights.filter((w) => w.date !== date), { date, kg }].sort((a, b) => a.date.localeCompare(b.date));
    return { weights, profile: { ...d.profile, weightKg: weights[weights.length - 1].kg } };
  });
  const removeWeight = (date) => update((d) => ({ weights: d.weights.filter((w) => w.date !== date) }));

  const saveCustomFood = (food) => {
    const f = { ...food, id: 'c-' + uid(), category: 'custom' };
    update((d) => ({ customFoods: [f, ...d.customFoods] }));
    return f;
  };
  const toggleFavorite = (id) => update((d) => ({ favorites: d.favorites.includes(id) ? d.favorites.filter((x) => x !== id) : [id, ...d.favorites] }));

  const setProfile = (p) => update((d) => ({ profile: { ...d.profile, ...p } }));
  const setGoals = (g) => update((d) => ({ goals: { ...d.goals, ...g } }));
  const finishOnboarding = () => update(() => ({ onboarded: true }));
  const resetDiary = () => update(() => ({ entries: {}, water: {}, weights: [], recent: [] }));
  const importData = (obj) => {
    if (!obj || typeof obj !== 'object' || !obj.entries || !obj.goals) throw new Error('importFailed');
    setData({ ...emptyData(), ...obj, onboarded: true });
  };

  const setPref = (k, v) => setPrefs((p) => ({ ...p, [k]: v }));

  const value = {
    prefs, setPref, t, lang: prefs.lang, foodName,
    account, data, signup, login, loginDemo, logout,
    allFoods, findFood,
    addEntry, addQuick, updateEntry, removeEntry, copyMeal, setWater, saveWeight, removeWeight,
    saveCustomFood, toggleFavorite, setProfile, setGoals, finishOnboarding, resetDiary, importData,
    toasts, toast, dismissToast,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
