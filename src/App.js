import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MealEntryPage from './pages/MealEntryPage';
import MonthlyOverviewPage from './pages/MonthlyOverviewPage';
import LoginForm from './pages/LoginForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<HomePage />} />
        <Route path="/meal-entry" element={<MealEntryPage />} />
        <Route path="/monthly-overview" element={<MonthlyOverviewPage />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;
