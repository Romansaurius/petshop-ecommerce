import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const login = async (email, password) => {
    // Validación de admin
    if (email === 'admin@petshop.com' && password !== 'Ranucci2007:)Roman2007') {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    
    // Simulación de login
    const mockUser = {
      id: 1,
      name: email === 'admin@petshop.com' ? 'Administrador' : 'Usuario Demo',
      email: email,
      role: email === 'admin@petshop.com' ? 'admin' : 'user'
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
    return { success: true };
  };

  const register = async (userData) => {
    // Simulación de registro
    const newUser = {
      id: Date.now(),
      ...userData,
      role: 'user'
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};