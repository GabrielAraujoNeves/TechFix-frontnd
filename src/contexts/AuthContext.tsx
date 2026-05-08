import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { PlanType, PaymentPeriod, PaymentMethod } from '../types/auth.types';

interface User {
  email: string;
  name?: string;
  role?: 'ADMIN' | 'USER';
}

interface DecodedToken {
  sub: string;
  role?: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    nomeEmpresa: string,
    cnpj: string,
    endereco: string,
    cidade: string,
    estado: string,
    telefoneComercial: string,
    segmentoAtuacao: string,
    planType: PlanType,
    paymentPeriod: PaymentPeriod,
    paymentMethod: PaymentMethod
  ) => Promise<void>;
  logout: () => void;
  error: string | null;
  registerSuccess: boolean;
  clearRegisterSuccess: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    const loadStoredUser = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (token && storedUser) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          const userData = JSON.parse(storedUser);
          const role = decoded.role === 'ADMIN' ? 'ADMIN' : 'USER';
          userData.role = role;
          setUser(userData);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    loadStoredUser();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setRegisterSuccess(false);
    try {
      const response = await authService.login(email, password);
      if (response.token) {
        localStorage.setItem('token', response.token);
        const decoded = jwtDecode<DecodedToken>(response.token);
        const role = decoded.role === 'ADMIN' ? 'ADMIN' : 'USER';
        const userData: User = { email, name: email.split('@')[0], role };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
      throw err;
    }
  };

  // REGISTER com 13 parâmetros
  const register = async (
    name: string,
    email: string,
    password: string,
    nomeEmpresa: string,
    cnpj: string,
    endereco: string,
    cidade: string,
    estado: string,
    telefoneComercial: string,
    segmentoAtuacao: string,
    planType: PlanType,
    paymentPeriod: PaymentPeriod,
    paymentMethod: PaymentMethod
  ) => {
    setError(null);
    setRegisterSuccess(false);
    try {
      const response = await authService.register({
        name,
        email,
        password,
        nomeEmpresa,
        cnpj,
        endereco,
        cidade,
        estado,
        telefoneComercial,
        segmentoAtuacao,
        planType,
        paymentPeriod,
        paymentMethod
      });
      if (response.success) {
        setRegisterSuccess(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer registro');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    setRegisterSuccess(false);
  };

  const clearRegisterSuccess = () => setRegisterSuccess(false);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      error,
      registerSuccess,
      clearRegisterSuccess,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};