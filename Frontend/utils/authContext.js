import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api'; // your axios or fetch wrapper
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user info or null

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/api/users/me'); // or your user info endpoint
          setUser(res.data);
        }
      } catch (err) {
        console.log('Failed to restore user session:', err.message);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/users/login', { email, password });
      const { user, session } = res.data.data;

      // Save the access token
      await AsyncStorage.setItem('accessToken', session.access_token);

      // Set default Authorization header for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;

      setUser(user);
    } catch (err) {
      console.error('Login error', err);
      throw err;
    }
  };

  const signUp = async (email, password, username, avatarUrl) => {
    try {
      const res = await api.post('/api/users/signup', {
        email,
        password,
        username,
        avatarUrl,
      });
      const { user, accessToken } = res.data.data;

      await AsyncStorage.setItem('accessToken', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      setUser(user);
    } catch (err) {
      console.error('Signup error', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
