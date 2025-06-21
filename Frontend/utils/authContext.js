import React, { createContext, useContext, useState } from 'react';
import api from '../utils/api'; // your axios or fetch wrapper

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user info or null

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/users/login', { email, password });
      setUser(res.data.user); // assume backend returns user object
    } catch (err) {
      console.error('Login error', err);
      throw err;
    }
  };

  const signUp = async (email, password, username, avatarUrl) => {
    try {
      const res = await api.post('/api/users/signup', { email, password, username, avatarUrl });
      setUser(res.data.user);
    } catch (err) {
      console.error('Signup error', err);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
