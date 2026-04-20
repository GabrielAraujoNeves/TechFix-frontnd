import React, { useState } from 'react';
import { 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  PlusCircle, 
  LogOut,
  Menu,
  X,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Box,
  Users,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AddProductModal } from './AddProductModal';
import { productService } from '../services/api';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onProductAdded?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onProductAdded }) => {
  const { isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEstoqueOpen, setIsEstoqueOpen] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  const handleAddProduct = () => {
    setIsAddModalOpen(true);
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      await productService.createProduct(productData);
      if (onProductAdded) {
        onProductAdded();
      }
      if (activeTab === 'products') {
        onTabChange('products');
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao criar produto');
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-black-main rounded-lg border border-gray-700"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-40 w-72 bg-black-main border-r border-gray-700 h-screen transition-transform duration-300 overflow-y-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <Package className="w-8 h-8 text-red-main" />
              <div>
                <h1 className="text-xl font-bold text-white">TechFix Pro</h1>
                <p className="text-xs text-gray-400">Sistema de Estoque e OS</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {/* Dashboard */}
            <button
              onClick={() => handleTabChange('dashboard')}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${activeTab === 'dashboard' 
                  ? 'bg-red-main text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <BarChart3 size={20} />
              <span>Dashboard</span>
            </button>

            {/* Gerenciar Usuários - Apenas ADMIN */}
            {isAdmin && (
              <button
                onClick={() => handleTabChange('users')}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${activeTab === 'users' 
                    ? 'bg-red-main text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <Users size={20} />
                <span>Gerenciar Usuários</span>
              </button>
            )}

            {/* Ordens de Serviço - Todos os usuários */}
            <button
              onClick={() => handleTabChange('os')}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${activeTab === 'os' 
                  ? 'bg-red-main text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <ClipboardList size={20} />
              <span>Ordens de Serviço</span>
            </button>

            {/* Estoque - Menu com subitens */}
            <div>
              <button
                onClick={() => setIsEstoqueOpen(!isEstoqueOpen)}
                className={`
                  w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                  ${activeTab === 'products' || activeTab === 'low-stock' || activeTab === 'out-of-stock'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <Box size={20} />
                  <span>Estoque</span>
                </div>
                {isEstoqueOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              
              {isEstoqueOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  <button
                    onClick={() => handleTabChange('products')}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                      ${activeTab === 'products' 
                        ? 'bg-red-main/20 text-red-main' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <Package size={16} />
                    <span>Todos os Produtos</span>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('low-stock')}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                      ${activeTab === 'low-stock' 
                        ? 'bg-red-main/20 text-red-main' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <TrendingDown size={16} />
                    <span>Estoque Baixo</span>
                  </button>
                  
                  <button
                    onClick={() => handleTabChange('out-of-stock')}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm
                      ${activeTab === 'out-of-stock' 
                        ? 'bg-red-main/20 text-red-main' 
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <AlertTriangle size={16} />
                    <span>Sem Estoque</span>
                  </button>
                </div>
              )}
            </div>

            {/* Adicionar Produto - Apenas ADMIN */}
            {isAdmin && (
              <button
                onClick={handleAddProduct}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                  text-gray-300 hover:bg-gray-800 hover:text-white
                `}
              >
                <PlusCircle size={20} />
                <span>Adicionar Produto</span>
              </button>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-700">
            <div className="mb-3 px-4 py-2 bg-black-dark rounded-lg">
              <p className="text-xs text-gray-400">Logado como</p>
              <p className="text-sm text-white font-semibold truncate">{user?.email}</p>
              <span className={`text-xs ${isAdmin ? 'text-red-main' : 'text-blue-400'}`}>
                {isAdmin ? 'Administrador' : 'Usuário Comum'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-main/10 hover:text-red-main transition-all duration-200"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal de Adicionar Produto */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProduct}
      />
    </>
  );
};