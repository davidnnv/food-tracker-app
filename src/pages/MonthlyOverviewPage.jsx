import React, { useState, useEffect } from 'react';
import './MonthlyOverviewPage.css';
import { Link } from 'react-router-dom';

const MonthlyOverviewPage = ({ location }) => {
  const [savedMeals, setSavedMeals] = useState([]);

  useEffect(() => {
    if (location && location.state && location.state.savedMeals) {
      setSavedMeals(location.state.savedMeals);
    } else {
      const savedMealsFromStorage = JSON.parse(localStorage.getItem('savedMeals')) || [];
      setSavedMeals(savedMealsFromStorage);
    }
  }, [location]);

  const handleDeleteCard = (date) => {
    const updatedSavedMeals = savedMeals.filter((meal) => meal.date !== date);
    setSavedMeals(updatedSavedMeals);
    localStorage.setItem('savedMeals', JSON.stringify(updatedSavedMeals));
  };

  const calculateTotalCalories = (meals) => {
    return meals.reduce((total, mealCategory) => {
      return (
        total +
        mealCategory.items.reduce((mealTotal, item) => mealTotal + item.calories * (item.quantity / 100), 0)
      );
    }, 0);
  };

  return (
    <div className="container">
      <h1>Monthly Overview Page</h1>

      {savedMeals.length === 0 ? (
        <p>No saved meals for the month. Start entering meals on the Meal Entry Page.</p>
      ) : (
        <div className="meal-cards">
          {savedMeals.map((savedMeal) => (
            <div key={savedMeal.date} className="meal-card">
              <h2>{savedMeal.date}</h2>
              {savedMeal.meals.map((mealCategory) => (
                <div key={mealCategory.category} className="meal-category">
                  <h3>{mealCategory.category}</h3>
                  <ul>
                    {mealCategory.items.map((item, index) => (
                      <li key={index}>
                        {item.name} - {item.quantity} g, {item.calories} kcal, {item.protein} g protein, {item.fat} fat
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button onClick={() => handleDeleteCard(savedMeal.date)}>Delete Card</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MonthlyOverviewPage;
