import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';  

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ id: decoded.id, role: decoded.role, name: decoded.name || '' });
      } catch (err) {
        console.error('Invalid token');
        localStorage.removeItem('token');
        setUser(null);
      }
    }
  }, []);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    const decoded = jwtDecode(data.token);
    setUser({
      id: decoded.id,
      role: decoded.role,
      name: data.user.name,  
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
