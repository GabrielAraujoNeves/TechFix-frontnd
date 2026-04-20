export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  message: string;
  type: string;
  role?: string;
}

export interface RegisterResponse {
  message: string;
  success: boolean;
}

export interface VerifyTokenResponse {
  valid: boolean;
  email: string;
  message: string;
}

export interface Product {
  id: number;
  nome: string;
  modelo: string;
  marca: string;
  precoAtacado: number;
  precoConsertoPeca: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductDTO {
  nome: string;
  modelo: string;
  marca: string;
  precoAtacado: number;
  precoConsertoPeca: number;
  quantidadeEstoque: number;
  estoqueMinimo: number;
}

export interface UpdateStockDTO {
  quantidade: number;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

export interface OSItem {
  id?: number;
  produtoId: number;
  quantidade: number;
  produtoNome?: string;
  produtoModelo?: string;
  produtoMarca?: string;
  precoUnitarioPeca?: number;
  valorTotalPeca?: number;
  valorConserto?: number;
  subtotal?: number;
  observacao?: string | null;
  // Campos antigos para compatibilidade
  nomeProduto?: string;
  precoUnitario?: number;
}

export interface OrdemServico {
  id: number;
  numeroOS: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string;
  modelo: string;
  marca: string;
  problema: string;
  observacoes?: string;
    status: 'PENDENTE' | 'CONSERTANDO' | 'FINALIZADO' | 'CANCELADO';
  valorTotalConserto: number;
  valorTotalPecas: number;
  valorTotalGeral: number;
  itens: OSItem[];
  dataAbertura: string;
  dataFinalizacao?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOSDTO {
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail?: string;   // opcional
  modelo: string;
  marca: string;
  problema: string;
  observacoes?: string;
  itens: { produtoId: number; quantidade: number }[];
}

export interface OSStatusUpdateDTO {
  status: string;
  observacao?: string;
}