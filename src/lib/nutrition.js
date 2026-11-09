export const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
export const MACROS = ['protein', 'carbs', 'fat'];
export const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 };

export const round = (n, d = 0) => { const p = 10 ** d; return Math.round((n || 0) * p) / p; };

// Nutrients for `grams` of a food defined per 100 g.
export function scale(per100, grams) {
  const f = grams / 100;
  return {
    kcal: round(per100.kcal * f),
    protein: round(per100.protein * f, 1),
    carbs: round(per100.carbs * f, 1),
    fat: round(per100.fat * f, 1),
  };
}

export function totals(entries = []) {
  return entries.reduce(
    (t, e) => ({
      kcal: t.kcal + (e.kcal || 0),
      protein: t.protein + (e.protein || 0),
      carbs: t.carbs + (e.carbs || 0),
      fat: t.fat + (e.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

// Mifflin–St Jeor BMR × activity, adjusted for the goal.
export const ACTIVITY = [
  { id: 'sedentary', factor: 1.2 },
  { id: 'light', factor: 1.375 },
  { id: 'moderate', factor: 1.55 },
  { id: 'active', factor: 1.725 },
];
export const GOALS = [
  { id: 'lose', adj: -450 },
  { id: 'maintain', adj: 0 },
  { id: 'gain', adj: 300 },
];

export function suggestGoals({ sex, age, heightCm, weightKg, activity = 'light', goal = 'maintain' }) {
  if (!age || !heightCm || !weightKg) return null;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'female' ? -161 : 5);
  const factor = ACTIVITY.find((a) => a.id === activity)?.factor ?? 1.375;
  const adj = GOALS.find((g) => g.id === goal)?.adj ?? 0;
  const calories = Math.max(1200, Math.round((bmr * factor + adj) / 10) * 10);
  const protein = Math.round(weightKg * (goal === 'gain' ? 2.0 : goal === 'lose' ? 2.0 : 1.6));
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  const water = Math.round((weightKg * 33) / 250) * 250;
  return { calories, protein, carbs, fat, water, bmr: Math.round(bmr) };
}

export const DEFAULT_GOALS = { calories: 2000, protein: 120, carbs: 230, fat: 65, water: 2000 };

export function bmi(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  return round(weightKg / (heightCm / 100) ** 2, 1);
}

// Day status against the calorie goal, used by the calendar and the week strip.
export function dayStatus(kcal, goal) {
  if (!kcal) return 'empty';
  const r = kcal / goal;
  if (r > 1.1) return 'over';
  if (r < 0.8) return 'under';
  return 'on';
}
