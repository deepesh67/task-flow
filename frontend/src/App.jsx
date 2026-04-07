import React, { useEffect, useState } from 'react'
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/login'
import Layout from './components/layout'
import Dashboard from './components/Dashboard'
import PendingTasks from './components/PendingTasks'
import CompletedTasks from './components/CompletedTasks'
import ProfileSettings from './components/ProfileSettings'
import AdminDashboard from './pages/dashboard'

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
      const response = await fetch('http://localhost:4000/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Something went wrong');

      localStorage.setItem('token', result.token);

      const user = {
        email: data.email,
        name: result.user?.name || 'user',
        role: result.user?.role || 'employee',
        avatar: `http://ui-avatars.com/api/?name=${encodeURIComponent(result.user?.name || 'user')}&background=random`
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

  const isAdmin = currentUser?.role === 'admin';

  return (
    <Routes>
      <Route path='/login' element={
        !currentUser
          ? <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
              <Login onSubmit={handleAuthSubmit} />
            </div>
          : <Navigate to='/' replace />
      } />

      <Route path='/' element={
        currentUser
          ? <Layout user={currentUser} onLogout={handleLogout} setUser={setCurrentUser} />
          : <Navigate to='/login' replace />
      }>
        <Route index element={isAdmin ? <AdminDashboard /> : <Dashboard />} />
        <Route path='pending' element={<PendingTasks />} />
        <Route path='completed' element={<CompletedTasks />} />
        <Route path='profile' element={<ProfileSettings />} />
        {isAdmin && <Route path='admin' element={<AdminDashboard />} />}
      </Route>

      <Route path='*' element={<Navigate to='/' replace />} />
    </Routes>
  );
};

export default App;