import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import SpLogin from './components/Auth/spLogin';
import ServicesList from './components/Services/ServicesList';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import Home from './Home';

function App() {
    
  return (

    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/splogin" element={<SpLogin />} />
        <Route path="/services" element={<ServicesList />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<Home />} />

      </Routes>
    </Router>
    

  );
}

export default App;

