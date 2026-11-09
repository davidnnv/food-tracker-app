// Built-in food database. Values are per 100 g (or 100 ml), rounded from USDA FoodData Central.
// `serving` is an optional common portion so users can pick "1 egg" instead of typing grams.
// Fields: id, en, mk, cat, kcal, p (protein), c (carbs), f (fat), fib (fibre), serving {g, en, mk}

const F = (id, en, mk, cat, kcal, p, c, f, fib = 0, serving = null) => ({
  id, name: { en, mk }, category: cat, per100: { kcal, protein: p, carbs: c, fat: f, fiber: fib }, serving,
});
const S = (g, en, mk) => ({ g, label: { en, mk } });

export const FOODS = [
  // Fruit
  F('apple', 'Apple', 'Јаболко', 'fruit', 52, 0.3, 13.8, 0.2, 2.4, S(180, '1 medium', '1 средно')),
  F('banana', 'Banana', 'Банана', 'fruit', 89, 1.1, 22.8, 0.3, 2.6, S(120, '1 medium', '1 средна')),
  F('orange', 'Orange', 'Портокал', 'fruit', 47, 0.9, 11.8, 0.1, 2.4, S(150, '1 medium', '1 среден')),
  F('strawberries', 'Strawberries', 'Јагоди', 'fruit', 32, 0.7, 7.7, 0.3, 2.0, S(150, '1 cup', '1 шолја')),
  F('blueberries', 'Blueberries', 'Боровинки', 'fruit', 57, 0.7, 14.5, 0.3, 2.4, S(150, '1 cup', '1 шолја')),
  F('grapes', 'Grapes', 'Грозје', 'fruit', 69, 0.7, 18.1, 0.2, 0.9, S(150, '1 cup', '1 шолја')),
  F('watermelon', 'Watermelon', 'Лубеница', 'fruit', 30, 0.6, 7.6, 0.2, 0.4, S(280, '1 slice', '1 парче')),
  F('avocado', 'Avocado', 'Авокадо', 'fruit', 160, 2.0, 8.5, 14.7, 6.7, S(100, '½ avocado', '½ авокадо')),

  // Vegetables
  F('tomato', 'Tomato', 'Домат', 'veg', 18, 0.9, 3.9, 0.2, 1.2, S(120, '1 medium', '1 среден')),
  F('cucumber', 'Cucumber', 'Краставица', 'veg', 15, 0.7, 3.6, 0.1, 0.5, S(200, '1 medium', '1 средна')),
  F('pepper', 'Bell pepper', 'Пиперка', 'veg', 26, 1.0, 6.0, 0.3, 2.1, S(120, '1 medium', '1 средна')),
  F('broccoli', 'Broccoli', 'Брокула', 'veg', 34, 2.8, 6.6, 0.4, 2.6, S(90, '1 cup', '1 шолја')),
  F('spinach', 'Spinach', 'Спанаќ', 'veg', 23, 2.9, 3.6, 0.4, 2.2, S(30, '1 cup raw', '1 шолја свеж')),
  F('carrot', 'Carrot', 'Морков', 'veg', 41, 0.9, 9.6, 0.2, 2.8, S(60, '1 medium', '1 среден')),
  F('potato', 'Potato, boiled', 'Компир, варен', 'veg', 87, 1.9, 20.1, 0.1, 1.8, S(170, '1 medium', '1 среден')),
  F('sweet-potato', 'Sweet potato, baked', 'Сладок компир, печен', 'veg', 90, 2.0, 20.7, 0.2, 3.3, S(150, '1 medium', '1 среден')),
  F('onion', 'Onion', 'Кромид', 'veg', 40, 1.1, 9.3, 0.1, 1.7, S(110, '1 medium', '1 среден')),
  F('lettuce', 'Lettuce', 'Зелена салата', 'veg', 15, 1.4, 2.9, 0.2, 1.3, S(50, '1 cup', '1 шолја')),
  F('beans', 'White beans, cooked', 'Грав, варен', 'veg', 139, 9.7, 25.1, 0.4, 6.3, S(180, '1 cup', '1 шолја')),
  F('lentils', 'Lentils, cooked', 'Леќа, варена', 'veg', 116, 9.0, 20.1, 0.4, 7.9, S(200, '1 cup', '1 шолја')),

  // Grains & bread
  F('rice', 'White rice, cooked', 'Бел ориз, варен', 'grain', 130, 2.7, 28.2, 0.3, 0.4, S(160, '1 cup', '1 шолја')),
  F('brown-rice', 'Brown rice, cooked', 'Интегрален ориз, варен', 'grain', 123, 2.7, 25.6, 1.0, 1.6, S(160, '1 cup', '1 шолја')),
  F('pasta', 'Pasta, cooked', 'Тестенини, варени', 'grain', 158, 5.8, 30.9, 0.9, 1.8, S(140, '1 cup', '1 шолја')),
  F('oats', 'Rolled oats', 'Овесни снегулки', 'grain', 379, 13.2, 67.7, 6.5, 10.1, S(40, '½ cup', '½ шолја')),
  F('white-bread', 'White bread', 'Бел леб', 'grain', 265, 9.0, 49.0, 3.2, 2.7, S(30, '1 slice', '1 парче')),
  F('wholegrain-bread', 'Wholegrain bread', 'Интегрален леб', 'grain', 247, 13.0, 41.0, 3.4, 7.0, S(35, '1 slice', '1 парче')),
  F('tortilla', 'Flour tortilla', 'Тортиља', 'grain', 312, 8.3, 51.6, 8.0, 3.5, S(45, '1 tortilla', '1 тортиља')),
  F('granola', 'Granola', 'Гранола', 'grain', 471, 10.0, 64.0, 20.0, 7.0, S(50, '½ cup', '½ шолја')),

  // Protein
  F('chicken-breast', 'Chicken breast, grilled', 'Пилешки гради, на скара', 'protein', 165, 31.0, 0, 3.6, 0, S(120, '1 fillet', '1 филе')),
  F('turkey', 'Turkey breast', 'Мисиркини гради', 'protein', 135, 30.0, 0, 1.0, 0, S(100, '1 portion', '1 порција')),
  F('beef', 'Lean beef, cooked', 'Посно говедско, готвено', 'protein', 250, 26.0, 0, 15.0, 0, S(120, '1 portion', '1 порција')),
  F('pork', 'Pork loin, cooked', 'Свинско филе, готвено', 'protein', 242, 27.0, 0, 14.0, 0, S(120, '1 portion', '1 порција')),
  F('salmon', 'Salmon, baked', 'Лосос, печен', 'protein', 206, 22.1, 0, 12.4, 0, S(125, '1 fillet', '1 филе')),
  F('tuna', 'Tuna in water', 'Туна во вода', 'protein', 116, 25.5, 0, 0.8, 0, S(120, '1 can', '1 конзерва')),
  F('egg', 'Egg', 'Јајце', 'protein', 143, 12.6, 0.7, 9.5, 0, S(50, '1 large', '1 големо')),
  F('egg-white', 'Egg white', 'Белка од јајце', 'protein', 52, 10.9, 0.7, 0.2, 0, S(33, '1 large', '1 голема')),
  F('tofu', 'Tofu', 'Тофу', 'protein', 76, 8.0, 1.9, 4.8, 0.3, S(125, '½ block', '½ блок')),
  F('cevapi', 'Kebapi (ćevapi)', 'Кебапчиња', 'protein', 270, 17.0, 3.0, 21.0, 0, S(150, '5 pieces', '5 парчиња')),

  // Dairy
  F('milk', 'Milk 2.8%', 'Млеко 2,8%', 'dairy', 57, 3.3, 4.7, 2.8, 0, S(250, '1 glass', '1 чаша')),
  F('yogurt', 'Yogurt (kiselo mleko)', 'Кисело млеко', 'dairy', 61, 3.5, 4.7, 3.2, 0, S(180, '1 cup', '1 чаша')),
  F('greek-yogurt', 'Greek yogurt 2%', 'Грчки јогурт 2%', 'dairy', 73, 10.0, 3.9, 2.0, 0, S(170, '1 cup', '1 чаша')),
  F('white-cheese', 'White cheese (sirenje)', 'Бело сирење', 'dairy', 264, 14.2, 4.1, 21.3, 0, S(30, '1 slice', '1 парче')),
  F('kashkaval', 'Kashkaval', 'Кашкавал', 'dairy', 350, 25.0, 1.0, 27.0, 0, S(25, '1 slice', '1 парче')),
  F('cottage', 'Cottage cheese', 'Урда / Cottage', 'dairy', 98, 11.1, 3.4, 4.3, 0, S(110, '½ cup', '½ шолја')),
  F('butter', 'Butter', 'Путер', 'dairy', 717, 0.9, 0.1, 81.1, 0, S(10, '1 tbsp', '1 лажица')),

  // Fats, nuts, extras
  F('olive-oil', 'Olive oil', 'Маслиново масло', 'fat', 884, 0, 0, 100, 0, S(13, '1 tbsp', '1 лажица')),
  F('almonds', 'Almonds', 'Бадеми', 'fat', 579, 21.2, 21.6, 49.9, 12.5, S(28, '1 handful', '1 грст')),
  F('walnuts', 'Walnuts', 'Ореви', 'fat', 654, 15.2, 13.7, 65.2, 6.7, S(28, '1 handful', '1 грст')),
  F('peanut-butter', 'Peanut butter', 'Путер од кикирики', 'fat', 588, 25.1, 20.0, 50.4, 6.0, S(16, '1 tbsp', '1 лажица')),
  F('honey', 'Honey', 'Мед', 'sweet', 304, 0.3, 82.4, 0, 0.2, S(21, '1 tbsp', '1 лажица')),
  F('dark-chocolate', 'Dark chocolate 70%', 'Темна чоколада 70%', 'sweet', 598, 7.8, 45.9, 42.6, 10.9, S(20, '2 squares', '2 коцки')),
  F('ajvar', 'Ajvar', 'Ајвар', 'veg', 110, 1.5, 8.0, 8.0, 3.0, S(30, '2 tbsp', '2 лажици')),

  // Ready meals & drinks
  F('burek', 'Burek with cheese', 'Бурек со сирење', 'meal', 317, 9.5, 26.0, 19.5, 1.0, S(200, '1 portion', '1 порција')),
  F('pizza', 'Pizza margherita', 'Пица маргарита', 'meal', 266, 11.0, 33.0, 10.0, 2.3, S(110, '1 slice', '1 парче')),
  F('tavche-gravche', 'Tavče gravče', 'Тавче гравче', 'meal', 150, 7.5, 18.0, 5.5, 6.0, S(300, '1 bowl', '1 чинија')),
  F('shopska', 'Shopska salad', 'Шопска салата', 'meal', 90, 3.5, 4.0, 7.0, 1.3, S(250, '1 bowl', '1 чинија')),
  F('protein-shake', 'Whey protein shake', 'Протеински шејк', 'drink', 120, 24.0, 3.0, 1.5, 0, S(300, '1 shake', '1 шејк')),
  F('orange-juice', 'Orange juice', 'Сок од портокал', 'drink', 45, 0.7, 10.4, 0.2, 0.2, S(250, '1 glass', '1 чаша')),
  F('coffee-milk', 'Coffee with milk', 'Кафе со млеко', 'drink', 30, 1.7, 2.6, 1.4, 0, S(200, '1 cup', '1 шолја')),
  F('cola', 'Cola', 'Кола', 'drink', 42, 0, 10.6, 0, 0, S(330, '1 can', '1 лименка')),
];
