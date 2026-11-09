// Builds a realistic 4-week diary for the demo account.
import { FOODS } from '../data/foods.js';
import { addDays, todayKey } from './dates.js';
import { scale, suggestGoals } from './nutrition.js';

const byId = Object.fromEntries(FOODS.map((f) => [f.id, f]));

// Rotating menus: [foodId, grams]
const MENUS = {
  breakfast: [
    [['oats', 50], ['milk', 200], ['banana', 120], ['honey', 10]],
    [['egg', 100], ['wholegrain-bread', 70], ['white-cheese', 30], ['tomato', 120]],
    [['greek-yogurt', 170], ['granola', 40], ['blueberries', 80]],
    [['burek', 200], ['yogurt', 180]],
    [['egg', 100], ['avocado', 70], ['wholegrain-bread', 35], ['coffee-milk', 200]],
  ],
  lunch: [
    [['chicken-breast', 150], ['rice', 180], ['broccoli', 100], ['olive-oil', 8]],
    [['tavche-gravche', 350], ['white-bread', 60], ['shopska', 200]],
    [['pasta', 200], ['tuna', 100], ['tomato', 120], ['olive-oil', 10]],
    [['beef', 140], ['potato', 220], ['lettuce', 80], ['olive-oil', 8]],
    [['salmon', 125], ['sweet-potato', 180], ['spinach', 60]],
    [['lentils', 250], ['wholegrain-bread', 50], ['ajvar', 30]],
  ],
  dinner: [
    [['shopska', 250], ['white-cheese', 40], ['wholegrain-bread', 35]],
    [['cevapi', 150], ['white-bread', 60], ['onion', 40], ['ajvar', 30]],
    [['turkey', 130], ['brown-rice', 150], ['pepper', 120]],
    [['pizza', 220]],
    [['tofu', 150], ['rice', 150], ['broccoli', 100], ['carrot', 60]],
    [['egg', 100], ['potato', 200], ['cucumber', 150]],
  ],
  snack: [
    [['apple', 180]],
    [['almonds', 28]],
    [['protein-shake', 300]],
    [['dark-chocolate', 20], ['coffee-milk', 200]],
    [['orange', 150], ['walnuts', 20]],
    [['greek-yogurt', 170]],
    [['cola', 330]],
  ],
};

// Small seeded PRNG so the demo looks the same every time.
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

export function buildDemo() {
  const r = rng(42);
  const profile = { name: 'Ana', sex: 'female', age: 29, heightCm: 168, weightKg: 68, activity: 'moderate', goal: 'lose' };
  const g = suggestGoals(profile);
  const goals = { calories: g.calories, protein: g.protein, carbs: g.carbs, fat: g.fat, water: 2250 };
  const entries = {};
  const water = {};
  const weights = [];
  const today = todayKey();
  const recentIds = new Set();

  for (let i = 27; i >= 0; i--) {
    const day = addDays(today, -i);
    if (i > 0 && r() < 0.08) continue; // a few days not logged
    const list = [];
    for (const meal of ['breakfast', 'lunch', 'dinner', 'snack']) {
      if (i === 0 && (meal === 'dinner' || (meal === 'snack' && r() < 0.5))) continue; // today in progress
      if (meal === 'snack' && r() < 0.25) continue;
      const menus = MENUS[meal];
      const menu = menus[Math.floor(r() * menus.length)];
      menu.forEach(([fid, grams], idx) => {
        const f = byId[fid];
        const gr = Math.round(grams * (0.85 + r() * 0.35));
        list.push({
          id: `${day}-${meal}-${idx}`,
          meal, foodId: fid, name: f.name, grams: gr,
          ...scale(f.per100, gr), time: Date.now() - i * 86400000,
        });
        recentIds.add(fid);
      });
    }
    entries[day] = list;
    water[day] = i === 0 ? 1000 : 1250 + Math.round(r() * 5) * 250;
    if (i % 3 === 0) weights.push({ date: day, kg: Math.round((70.4 - (27 - i) * 0.085 + (r() - 0.5) * 0.5) * 10) / 10 });
  }

  return {
    profile: { ...profile, weightKg: weights[weights.length - 1].kg },
    goals, entries, water, weights,
    customFoods: [
      { id: 'c-mom-pie', name: { en: 'Mom’s pita', mk: 'Мамина пита' }, category: 'custom', per100: { kcal: 280, protein: 9, carbs: 30, fat: 14, fiber: 1 }, serving: { g: 150, label: { en: '1 piece', mk: '1 парче' } } },
    ],
    favorites: ['banana', 'greek-yogurt', 'chicken-breast', 'shopska'],
    recent: [...recentIds].slice(0, 12),
    onboarded: true,
  };
}
