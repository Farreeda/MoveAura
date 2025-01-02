import React, { useEffect, useState } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [dashboard, setDashboard] = useState({ users: [], services: [], events: [] });

  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('http://localhost:5004/api/admin/dashboard', {
        headers: { Authorization: token }
      });
      setDashboard(data);
    };
    fetchDashboard();
  }, []);

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <h3>Users</h3>
      <ul>{dashboard.users.map(user => <li key={user.username}>{user.username}</li>)}</ul>
      <h3>Services</h3>
      <ul>{dashboard.services.map(service => <li key={service.id}>{service.name}</li>)}</ul>
      <h3>Events</h3>
      <ul>{dashboard.events.map(event => <li key={event.id}>{event.name}</li>)}</ul>
    </div>
  );
}

export default AdminDashboard;
