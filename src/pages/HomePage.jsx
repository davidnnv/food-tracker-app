import React from 'react';
import { Link } from 'react-router-dom';
import "./HomePage.css";

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to Food Tracker App</h1>
      <p>
        Here you can track your meals and nutrition. View your entries for the previous day
        or start adding new meals today.
      </p>
      <div>
        {}
        <Link to="/meal-entry">Go to Meal Entry Page</Link>
      </div>
      <div>
        {}
        <Link to="/monthly-overview">Go to Monthly Overview Page</Link>
      </div>
    </div>
  );
};

export default HomePage;
