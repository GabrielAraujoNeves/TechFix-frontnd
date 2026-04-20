import React from 'react';
import type { Product } from '../types/auth.types';
import { Package, Trash2, Plus, Minus, Edit2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  onAddStock?: (id: number) => void;
  onRemoveStock?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (product: Product) => void;
  allowEdit?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddStock, 
  onRemoveStock, 
  onDelete,
  onEdit,
  allowEdit = true
}) => {
  const { isAdmin } = useAuth();
  const isLowStock = product.quantidadeEstoque <= product.estoqueMinimo;
  const isOutOfStock = product.quantidadeEstoque === 0;

  return (
    <div className="h-full bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4 hover:shadow-lg hover:shadow-red-main/10 transition-all duration-300 flex flex-col">
      {/* Header com nome e badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto min-w-0">
          <div className="p-2 bg-red-main/10 rounded-lg flex-shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-red-main" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-white break-words line-clamp-2">
              {product.nome}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 break-words line-clamp-1">
              {product.marca} - {product.modelo}
            </p>
          </div>
        </div>
        
        {/* Stock Status Badge - Responsivo */}
        <div className="flex-shrink-0 self-start sm:self-auto">
          {isOutOfStock ? (
            <span className="inline-block px-2 sm:px-3 py-1 bg-red-main/20 text-red-main rounded-full text-xs font-semibold whitespace-nowrap">
              SEM ESTOQUE
            </span>
          ) : isLowStock ? (
            <span className="inline-block px-2 sm:px-3 py-1 bg-yellow-600/20 text-yellow-500 rounded-full text-xs font-semibold whitespace-nowrap">
              ESTOQUE BAIXO
            </span>
          ) : (
            <span className="inline-block px-2 sm:px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-semibold whitespace-nowrap">
              EM ESTOQUE
            </span>
          )}
        </div>
      </div>

      {/* Informações do produto - Grid responsivo com textos adaptáveis */}
      <div className="grid grid-cols-1 gap-2 mb-4 flex-1">
        <div className="flex justify-between items-center p-2 bg-black-dark/50 rounded-lg">
          <span className="text-gray-400 text-xs sm:text-sm font-medium">Quantidade:</span>
          <span className={`text-base sm:text-xl md:text-2xl font-bold ${
            isOutOfStock ? 'text-red-main' : isLowStock ? 'text-yellow-500' : 'text-green-400'
          }`}>
            {product.quantidadeEstoque}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-black-dark/50 rounded-lg">
          <span className="text-gray-400 text-xs sm:text-sm font-medium">Preço Atacado:</span>
          <span className="text-white font-semibold text-sm sm:text-base">
            R$ {product.precoAtacado.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-black-dark/50 rounded-lg">
          <span className="text-gray-400 text-xs sm:text-sm font-medium">Preço Conserto:</span>
          <span className="text-white font-semibold text-sm sm:text-base">
            R$ {product.precoConsertoPeca.toFixed(2)}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-black-dark/50 rounded-lg">
          <span className="text-gray-400 text-xs sm:text-sm font-medium">Estoque Mínimo:</span>
          <span className="text-gray-300 text-sm sm:text-base font-medium">
            {product.estoqueMinimo} unidades
          </span>
        </div>
      </div>

      {/* Botões de ação - Layout responsivo */}
      {isAdmin && allowEdit && (
        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-700 mt-auto">
          <button
            onClick={() => onAddStock?.(product.id)}
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-xs sm:text-sm font-medium"
            title="Adicionar estoque"
          >
            <Plus size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Adicionar</span>
          </button>
          <button
            onClick={() => onRemoveStock?.(product.id)}
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 bg-yellow-600/20 text-yellow-500 rounded-lg hover:bg-yellow-600/30 transition-colors text-xs sm:text-sm font-medium"
            disabled={product.quantidadeEstoque === 0}
            title="Remover estoque"
          >
            <Minus size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Remover</span>
          </button>
          <button
            onClick={() => onEdit?.(product)}
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-xs sm:text-sm font-medium"
            title="Editar produto"
          >
            <Edit2 size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Editar</span>
          </button>
          <button
            onClick={() => onDelete?.(product.id)}
            className="flex items-center justify-center gap-1 sm:gap-2 px-2 py-2 bg-red-main/20 text-red-main rounded-lg hover:bg-red-main/30 transition-colors text-xs sm:text-sm font-medium"
            title="Excluir produto"
          >
            <Trash2 size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm">Excluir</span>
          </button>
        </div>
      )}
      
      {/* Admin View - Sem permissão de edição */}
      {isAdmin && !allowEdit && (
        <div className="pt-4 border-t border-gray-700 mt-auto">
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs sm:text-sm">
            <Eye size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-center">Modo de visualização apenas</span>
          </div>
        </div>
      )}
      
      {/* User View - Apenas visualização */}
      {!isAdmin && (
        <div className="pt-4 border-t border-gray-700 mt-auto">
          <p className="text-xs text-gray-500 text-center">
            Apenas administradores podem gerenciar o estoque
          </p>
        </div>
      )}
    </div>
  );
};