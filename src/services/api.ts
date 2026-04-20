import axios from 'axios';
import type { 
  RegisterResponse, 
  VerifyTokenResponse, 
  Product, 
  CreateProductDTO,
  User,
  UpdateUserDTO,
  UsersResponse, 
  OrdemServico,
  CreateOSDTO
} from '../types/auth.types';

// Interface específica para o login
export interface LoginResponse {
  token: string;
  role?: string;
  message: string;
  type?: string;
}

const api = axios.create({
  baseURL: 'https://techfix-backend-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', { email, password });
      console.log('Resposta da API de login:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  },

  register: async (name: string, email: string, password: string): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },

  verifyToken: async (): Promise<VerifyTokenResponse> => {
    try {
      const response = await api.get<VerifyTokenResponse>('/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Erro na verificação do token:', error);
      throw error;
    }
  },
};

export const productService = {
  // Criar produto (apenas ADMIN)
  createProduct: async (productData: CreateProductDTO): Promise<Product> => {
    const response = await api.post('/products/admin/create', productData);
    return response.data;
  },

  // Listar todos os produtos (ADMIN e USER)
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products/all');
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.products)) return response.data.products;
        if (Array.isArray(response.data.data)) return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      return [];
    }
  },

  // Atualizar produto (apenas ADMIN)
  updateProduct: async (productId: number, productData: Partial<CreateProductDTO>): Promise<Product> => {
    const response = await api.put(`/products/admin/update/${productId}`, productData);
    return response.data;
  },

  // Adicionar estoque (apenas ADMIN)
  addStock: async (productId: number, quantidade: number): Promise<Product> => {
    const response = await api.put(`/products/admin/add-stock/${productId}?quantidade=${quantidade}`);
    return response.data;
  },

  // Remover estoque (apenas ADMIN)
  removeStock: async (productId: number, quantidade: number): Promise<Product> => {
    const response = await api.put(`/products/admin/remove-stock/${productId}?quantidade=${quantidade}`);
    return response.data;
  },

  // Produtos com estoque baixo
  getLowStockProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products/low-stock');
      if (Array.isArray(response.data)) return response.data;
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.products)) return response.data.products;
        if (Array.isArray(response.data.data)) return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao carregar produtos com estoque baixo:', error);
      return [];
    }
  },

  // Produtos sem estoque
  getOutOfStockProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products/out-of-stock');
      if (Array.isArray(response.data)) return response.data;
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.products)) return response.data.products;
        if (Array.isArray(response.data.data)) return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Erro ao carregar produtos sem estoque:', error);
      return [];
    }
  },

  // Deletar produto (apenas ADMIN)
  deleteProduct: async (productId: number): Promise<void> => {
    await api.delete(`/products/admin/delete/${productId}`);
  },
};

// Serviço de gerenciamento de usuários (apenas ADMIN)
export const userService = {
  // Listar todos os usuários
  getAllUsers: async (): Promise<UsersResponse> => {
    const response = await api.get('/admin/users/all');
    return response.data;
  },

  // Buscar usuário por ID
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Buscar usuário por email
  getUserByEmail: async (email: string): Promise<User> => {
    const response = await api.get(`/admin/users/email/${email}`);
    return response.data;
  },

  // Atualizar usuário
  updateUser: async (id: number, userData: UpdateUserDTO): Promise<User> => {
    const response = await api.put(`/admin/users/update/${id}`, userData);
    return response.data;
  },

  // Promover para ADMIN
  promoteToAdmin: async (id: number): Promise<User> => {
    const response = await api.put(`/admin/users/promote/${id}`);
    return response.data;
  },

  // Rebaixar para USER
  demoteToUser: async (id: number): Promise<User> => {
    const response = await api.put(`/admin/users/demote/${id}`);
    return response.data;
  },

  // Resetar senha
  resetPassword: async (id: number): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/reset-password/${id}`);
    return response.data;
  },

  // Deletar usuário
  deleteUser: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/users/delete/${id}`);
    return response.data;
  },
};


export const osService = {
  createOS: async (data: CreateOSDTO): Promise<OrdemServico> => {
    const response = await api.post('/os/create', data);
    return response.data;
  },

  getAllOS: async (): Promise<OrdemServico[]> => {
    const response = await api.get('/os/all');
    // O backend retorna { total, ordens: [] }
    if (response.data && Array.isArray(response.data.ordens)) {
      return response.data.ordens;
    }
    if (Array.isArray(response.data)) return response.data;
    console.warn('Estrutura inesperada em /os/all:', response.data);
    return [];
  },

  getOSById: async (id: number): Promise<OrdemServico> => {
    const response = await api.get(`/os/${id}`);
    return response.data;
  },

  getOSByNumero: async (numeroOS: string): Promise<OrdemServico> => {
    const response = await api.get(`/os/numero/${numeroOS}`);
    return response.data;
  },

  getOSByStatus: async (status: string): Promise<OrdemServico[]> => {
    const response = await api.get(`/os/status/${status}`);
    // Se a resposta também vier com { total, ordens }
    if (response.data && Array.isArray(response.data.ordens)) return response.data.ordens;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  getOSByCliente: async (nome: string): Promise<OrdemServico[]> => {
    const response = await api.get(`/os/cliente/${nome}`);
    if (response.data && Array.isArray(response.data.ordens)) return response.data.ordens;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  updateOSStatus: async (id: number, status: string, observacao?: string): Promise<OrdemServico> => {
    const response = await api.put(`/os/update-status/${id}`, { status, observacao });
    return response.data;
  },

  cancelOS: async (id: number, motivo?: string): Promise<{ message: string }> => {
    const response = await api.put(`/os/admin/cancel/${id}`, null, { params: { motivo } });
    return response.data;
  },

  deleteOS: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/os/admin/delete/${id}`);
    return response.data;
  },
};


export default api;