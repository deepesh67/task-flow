import React, { useEffect, useState } from 'react'
import { useNavigate, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import Login from './components/login'
import Signup from './components/signup'
import Layout from './components/layout'
import Dashboard from './components/Dashboard'
import PendingTasks from './components/PendingTasks'
import CompletedTasks from './components/CompletedTasks'
import ProfileSettings from './components/ProfileSettings'

const App = () => {

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const handleAuthSubmit = async (data) => {
    try {
      const endpoint = data.name
        ? 'http://localhost:4000/api/user/register'
        : 'http://localhost:4000/api/user/login';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password, name: data.name })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Something went wrong');

      localStorage.setItem('token', result.token);

      const user = {
        email: data.email,
        name: result.user?.name || data.name || 'user',
        avatar: `http://ui-avatars.com/api/?name=${encodeURIComponent(result.user?.name || data.name || 'user')}&background=random`
      };

      setCurrentUser(user);
      navigate('/', { replace: true });

    } catch (err) {
      console.error('Auth error:', err.message);
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <Routes>
      <Route path='/login' element={
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <Login onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/signup')} />
        </div>
      } />

      <Route path='/signup' element={
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <Signup onSubmit={handleAuthSubmit} onSwitchMode={() => navigate('/login')} />
        </div>
      } />

      <Route path='/' element={
        currentUser
          ? <Layout user={currentUser} onLogout={handleLogout} />
          : <Navigate to='/login' replace />
      }>
        <Route index element={<Dashboard />} />
        <Route path='pending' element={<PendingTasks />} />
        <Route path='completed' element={<CompletedTasks />} />
        <Route path='profile' element={<ProfileSettings />} />
      </Route>

    </Routes>
  );
};

export default App;
