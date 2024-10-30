// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GuestList from './components/Guests/GuestList';
import GuestDetails from './components/Guests/GuestDetails';
import Accounting from './components/Accounting/Accounting';
import Login from './components/Auth/Login';
import GuestAdd from './components/Guests/form';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/guests" element={<GuestList />} />
          <Route path="/guests/form" element={<GuestAdd />} />
          <Route path="/guests/:id" element={<GuestDetails />} />
          <Route path="/accounting" element={<Accounting />} />
        </Routes>
    </Router >
  );
}

export default App;
