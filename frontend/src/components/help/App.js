import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

const App = () => {
  const [user, setUser] = useState(null);
  const [services, setServices] = useState([]);
  const [profile, setProfile] = useState({});
  const [faq, setFaq] = useState([]);
  
  useEffect(() => {
    if (user) {
      axios.get('http://localhost:5000/api/services')
        .then(response => setServices(response.data));
      
      axios.get('http://localhost:5000/api/help')
        .then(response => setFaq(response.data));
    }
  }, [user]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      localStorage.setItem('token', response.data.token);
      setUser({ username });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const register = async (username, password) => {
    try {
      await axios.post('http://localhost:5000/api/register', { username, password });
      login(username, password);
    } catch (err) {
      console.error("Registration failed:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (newProfile) => {
    try {
      await axios.put('http://localhost:5000/api/profile', { profile: newProfile }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile(newProfile);
    } catch (err) {
      console.error("Profile update failed:", err);
    }
  };

  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> |
        <Link to="/profile">Profile</Link> |
        <Link to="/services">Services</Link> |
        <Link to="/help">Help</Link> |
        {user ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>

      <Switch>
        <Route exact path="/" render={() => <Home user={user} />} />
        <Route path="/login" render={() => <LoginForm login={login} />} />
        <Route path="/profile" render={() => <ProfileForm profile={profile} updateProfile={updateProfile} />} />
        <Route path="/services" render={() => <Services services={services} />} />
        <Route path="/help" render={() => <Help faq={faq} />} />
      </Switch>
    </Router>
  );
};

const Home = ({ user }) => (
  <div>
    <h1>Welcome {user ? user.username : 'Guest'}</h1>
    {!user && <Link to="/login">Login</Link>}
  </div>
);

const LoginForm = ({ login }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
      <button type="submit">Login</button>
    </form>
  );
};

const ProfileForm = ({ profile, updateProfile }) => {
  const [newProfile, setNewProfile] = useState(profile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProfile({ ...newProfile, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(newProfile);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        value={newProfile.name || ''}
        onChange={handleChange}
        placeholder="Name"
      />
      <textarea
        name="bio"
        value={newProfile.bio || ''}
        onChange={handleChange}
        placeholder="Bio"
      />
      <button type="submit">Update Profile</button>
    </form>
  );
};

const Services = ({ services }) => (
  <div>
    <h2>Services</h2>
    {services.map((service) => (
      <div key={service.id}>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
      </div>
    ))}
  </div>
);

const Help = ({ faq }) => (
  <div>
    <h2>Help</h2>
    {faq.map((item, index) => (
      <div key={index}>
        <h4>{item.question}</h4>
        <p>{item.answer}</p>
      </div>
    ))}
  </div>
);

export default App;
