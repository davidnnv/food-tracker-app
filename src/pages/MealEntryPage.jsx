import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // Import the uuid library
import './MealEntryPage.css';

const MealEntryPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mealItems, setMealItems] = useState([]);
  const [newItem, setNewItem] = useState({
    id: uuidv4(), // Generate a unique id for the new item
    name: '',
    calories: 0,
    protein: 0,
    fat: 0,
    carbohydrates: 0,
    quantity: 0,
  });

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleAddItem = () => {
    setMealItems([...mealItems, newItem]);
    setNewItem({
      id: uuidv4(), // Generate a unique id for the new item
      name: '',
      calories: 0,
      protein: 0,
      fat: 0,
      carbohydrates: 0,
      quantity: 0,
    });
  };

  const handleDeleteItem = (id) => {
    const updatedItems = mealItems.filter((item) => item.id !== id);
    setMealItems(updatedItems);
  };

  const handleSignOut = () => {
    navigate('/login')

  };

  const handleSaveMeal = () => {
    const savedMeal = {
      date: new Date().toISOString().split('T')[0],
      meals: [
        {
          category: selectedCategory,
          items: mealItems,
        },
      ],
    };

    const savedMealsFromStorage = JSON.parse(localStorage.getItem('savedMeals')) || [];
    const updatedSavedMeals = [...savedMealsFromStorage, savedMeal];

    localStorage.setItem('savedMeals', JSON.stringify(updatedSavedMeals));

    navigate('/monthly-overview', { state: { savedMeals: updatedSavedMeals } });
  };

  return (
    <div className="container">
      <button onClick={handleSignOut}>Sign Out</button>
      <h1>Meal Entry Page</h1>
      <div className="categories">
        <button onClick={() => handleCategoryClick('Breakfast')}>Breakfast</button>
        <button onClick={() => handleCategoryClick('Lunch')}>Lunch</button>
        <button onClick={() => handleCategoryClick('Dinner')}>Dinner</button>
        <button onClick={() => handleCategoryClick('Snack')}>Snack</button>
      </div>

      {selectedCategory && (
        <div>
          <h2>{selectedCategory}</h2>
          <div>
            <label>Name:</label>
            <input
              type="text"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>
          <div>
            <label>Calories:</label>
            <input
              type="number"
              value={newItem.calories}
              onChange={(e) => setNewItem({ ...newItem, calories: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label>Protein (g):</label>
            <input
              type="number"
              value={newItem.protein}
              onChange={(e) => setNewItem({ ...newItem, protein: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label>Fat (g):</label>
            <input
              type="number"
              value={newItem.fat}
              onChange={(e) => setNewItem({ ...newItem, fat: parseFloat(e.target.value) })}
            />
          </div>
          <div>
            <label>Quantity (grams):</label>
            <input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
            />
          </div>

          <button onClick={handleAddItem}>Add Item</button>

          {mealItems.length > 0 && (
            <div>
              <h3>Meal Items</h3>
              <ul>
                {mealItems.map((item) => (
                  <li key={item.id}>
                    {item.name} - {item.quantity} g, {item.calories} kcal, {item.protein} protein, {item.fat} g
                    <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={handleSaveMeal}>Save Meal</button>
        </div>
      )}

      <div className="link-back">
        <Link to="/home">Go back to Home Page</Link>
      </div>
    </div>
  );
};

export default MealEntryPage;
