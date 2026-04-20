import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { jwtDecode } from 'jwt-decode';

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

interface LoginResponse {
  token: string;
  role?: string;
  message: string;
  type?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  registerSuccess: boolean;
  clearRegisterSuccess: () => void;
  isAdmin: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Função para extrair role do token
  const extractRoleFromToken = (token: string): 'ADMIN' | 'USER' => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('Token decodificado:', decoded);
      
      // Verifica se o token tem a role
      if (decoded.role === 'ADMIN') {
        return 'ADMIN';
      }
      return 'USER';
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      return 'USER';
    }
  };

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const loadStoredUser = () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const role = extractRoleFromToken(token);
          const userData = JSON.parse(storedUser);
          userData.role = role;
          setUser(userData);
          
          console.log('Usuário carregado do storage:', userData);
          console.log('Role do usuário:', role);
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    loadStoredUser();
  }, []);

  // Função de login atualizada
  const login = async (email: string, password: string) => {
    setError(null);
    setRegisterSuccess(false);
    
    try {
      // Faz a requisição de login
      const response = await authService.login(email, password) as LoginResponse;
      
      console.log('Resposta do login:', response);
      
      if (response.token) {
        // Salva o token
        localStorage.setItem('token', response.token);
        
        // Extrai a role - primeiro tenta do response, depois do token
        let role: 'ADMIN' | 'USER' = 'USER';
        
        if (response.role === 'ADMIN') {
          role = 'ADMIN';
        } else {
          // Tenta extrair do token como fallback
          role = extractRoleFromToken(response.token);
        }
        
        console.log('Role identificada:', role);
        
        // Extrai o email do token ou usa o email fornecido
        let userEmail = email;
        try {
          const decoded = jwtDecode<DecodedToken>(response.token);
          if (decoded.sub) {
            userEmail = decoded.sub;
          }
        } catch (error) {
          console.error('Erro ao extrair email do token:', error);
        }
        
        // Cria o objeto do usuário
        const userData: User = { 
          email: userEmail,
          name: userEmail.split('@')[0],
          role: role
        };
        
        // Salva no localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Atualiza o estado
        setUser(userData);
        
        console.log('Login realizado com sucesso!');
        console.log('Usuário:', userData);
        console.log('É ADMIN?', role === 'ADMIN');
        
        // Força uma atualização para garantir que a role está correta
        return;
      }
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.response?.data?.message || 'Erro ao fazer login');
      throw err;
    }
  };

  // Função de registro
  const register = async (name: string, email: string, password: string) => {
    setError(null);
    setRegisterSuccess(false);
    
    try {
      const response = await authService.register(name, email, password);
      
      if (response.success) {
        setRegisterSuccess(true);
        console.log('Registro realizado com sucesso! Faça login.');
        return;
      }
    } catch (err: any) {
      console.error('Erro no registro:', err);
      setError(err.response?.data?.message || 'Erro ao fazer registro');
      throw err;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
    setRegisterSuccess(false);
    console.log('Logout realizado');
  };

  const clearRegisterSuccess = () => {
    setRegisterSuccess(false);
  };

  // Propriedades auxiliares
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER' || (!user?.role); // Se não tem role, é USER

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
      isAdmin,
      isUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};