// ========== MODELOS PRINCIPAIS ==========
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
  nomeEmpresa: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefoneComercial: string;
  segmentoAtuacao: string;
  planType: PlanType;
  paymentPeriod: PaymentPeriod;
  paymentMethod: PaymentMethod;
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
  userId?: number;
  companyId?: number;
  subscriptionId?: number;
}

export interface VerifyTokenResponse {
  valid: boolean;
  email: string;
  message: string;
}

// ========== PRODUTOS ==========
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

// ========== USUÁRIOS (ADMIN) ==========
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

// ========== ORDEM DE SERVIÇO ==========
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
  clienteEmail?: string;
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

// ========== PLANOS E ASSINATURA (sem `enum`, usando type + const) ==========
export const PlanType = {
  BASIC: 'BASIC',
  PRO: 'PRO',
  PREMIUM: 'PREMIUM'
} as const;
export type PlanType = typeof PlanType[keyof typeof PlanType];

export const PaymentPeriod = {
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  ANNUAL: 'ANNUAL'
} as const;
export type PaymentPeriod = typeof PaymentPeriod[keyof typeof PaymentPeriod];

export const PaymentMethod = {
  PIX: 'PIX',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD'
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface CardInfo {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;   // formato "MM/AA"
  cvv: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  nomeEmpresa: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefoneComercial: string;
  segmentoAtuacao: string;
  planType: PlanType;
  paymentPeriod: PaymentPeriod;
  paymentMethod: PaymentMethod;
  cardInfo?: CardInfo;   // ← novo campo opcional
}

export interface UpgradeRequest {
  newPlan: PlanType;
  period: PaymentPeriod;
  paymentMethod: PaymentMethod;
  cardInfo?: CardInfo;
}

// Substitua as interfaces SubscriptionResponse e Subscription por esta:
export interface Subscription {
  id: number;
  planType: 'BASIC' | 'PRO' | 'PREMIUM';
  paymentPeriod: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';
  status: 'ACTIVE' | 'PENDING_PAYMENT' | 'EXPIRED' | 'CANCELED';
  paymentMethod: string;
  startDate: string | null;
  endDate: string | null;
  message?: string;
}

// Use o mesmo nome nos serviços (Subscription)
export type SubscriptionResponse = Subscription;


export interface CompanyData {
  id: number;
  nomeEmpresa: string;
  cnpj: string;
  endereco: string;
  cidade: string;
  estado: string;
  telefoneComercial: string;
  segmentoAtuacao: string;
  segmentoCode: string;
  edificacaoId?: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentInfoResponse {
  paymentMethod: string;
  cardDetails?: {
    last4: string;
    brand: string;
  };
}