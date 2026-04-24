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

export interface LoginResponse {
  token: string;
  role?: string;
  message: string;
  type?: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },
  register: async (name: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', { name, email, password });
    return response.data;
  },
  verifyToken: async (): Promise<VerifyTokenResponse> => {
    const response = await api.get<VerifyTokenResponse>('/auth/verify');
    return response.data;
  },
};

export const productService = {
  createProduct: async (productData: CreateProductDTO): Promise<Product> => {
    const response = await api.post('/products/admin/create', productData);
    return response.data;
  },

  getAllProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products/all');
      if (Array.isArray(response.data)) return response.data;
      if (response.data?.products) return response.data.products;
      if (response.data?.data) return response.data.data;
      return [];
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      return [];
    }
  },

  updateProduct: async (productId: number, productData: Partial<CreateProductDTO>): Promise<Product> => {
    const response = await api.put(`/products/admin/update/${productId}`, productData);
    return response.data;
  },

  addStock: async (productId: number, quantidade: number): Promise<Product> => {
    const response = await api.put(`/products/admin/add-stock/${productId}?quantidade=${quantidade}`);
    return response.data;
  },

  removeStock: async (productId: number, quantidade: number): Promise<Product> => {
    const response = await api.put(`/products/admin/remove-stock/${productId}?quantidade=${quantidade}`);
    return response.data;
  },

  getLowStockProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products/low-stock');
      if (Array.isArray(response.data)) return response.data;
      if (response.data?.products) return response.data.products;
      return [];
    } catch (error) {
      console.error('Erro ao carregar produtos com estoque baixo:', error);
      return [];
    }
  },

  getOutOfStockProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/products/out-of-stock');
      if (Array.isArray(response.data)) return response.data;
      if (response.data?.products) return response.data.products;
      return [];
    } catch (error) {
      console.error('Erro ao carregar produtos sem estoque:', error);
      return [];
    }
  },

  deleteProduct: async (productId: number): Promise<void> => {
    await api.delete(`/products/admin/delete/${productId}`);
  },

  // ========== NOVOS MÉTODOS ==========
  getLastCreatedProduct: async (): Promise<{ product: Product; cadastradoEm: string } | null> => {
    try {
      const response = await api.get('/products/last-created');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar último produto criado:', error);
      return null;
    }
  },

  getLastUpdatedProduct: async (): Promise<{ product: Product; atualizadoEm: string } | null> => {
    try {
      const response = await api.get('/products/last-updated');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar último produto atualizado:', error);
      return null;
    }
  },
};

export const userService = {
  getAllUsers: async (): Promise<UsersResponse> => {
    const response = await api.get('/admin/users/all');
    return response.data;
  },
  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },
  getUserByEmail: async (email: string): Promise<User> => {
    const response = await api.get(`/admin/users/email/${email}`);
    return response.data;
  },
  updateUser: async (id: number, userData: UpdateUserDTO): Promise<User> => {
    const response = await api.put(`/admin/users/update/${id}`, userData);
    return response.data;
  },
  promoteToAdmin: async (id: number): Promise<User> => {
    const response = await api.put(`/admin/users/promote/${id}`);
    return response.data;
  },
  demoteToUser: async (id: number): Promise<User> => {
    const response = await api.put(`/admin/users/demote/${id}`);
    return response.data;
  },
  resetPassword: async (id: number): Promise<{ message: string }> => {
    const response = await api.put(`/admin/users/reset-password/${id}`);
    return response.data;
  },
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
    if (response.data?.ordens) return response.data.ordens;
    if (Array.isArray(response.data)) return response.data;
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
    if (response.data?.ordens) return response.data.ordens;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },
  getOSByCliente: async (nome: string): Promise<OrdemServico[]> => {
    const response = await api.get(`/os/cliente/${nome}`);
    if (response.data?.ordens) return response.data.ordens;
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