import React, { useEffect, useState } from 'react';
import { productService } from '../services/api';
import type { Product } from '../types/auth.types';
import { ProductCard } from '../components/ProductCard';
import { AddProductModal } from '../components/AddProductModal';
import { EditProductModal } from '../components/EditProductModal';
import { StockModal } from '../components/StockModal';
import { useAuth } from '../contexts/AuthContext';
import { Search, AlertCircle, Package } from 'lucide-react';

interface ProductsPageProps {
  filterType?: 'all' | 'low-stock' | 'out-of-stock';
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ filterType = 'all' }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [stockAction, setStockAction] = useState<'add' | 'remove'>('add');
  const { isAdmin } = useAuth();

  // Só permite edição de estoque em "Todos os Produtos"
  const allowStockEdit = filterType === 'all';

  useEffect(() => {
    loadProducts();
  }, [filterType]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      let data: Product[] = [];
      if (filterType === 'low-stock') {
        data = await productService.getLowStockProducts();
      } else if (filterType === 'out-of-stock') {
        data = await productService.getOutOfStockProducts();
      } else {
        data = await productService.getAllProducts();
      }
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Erro ao carregar produtos:', err);
      setError(err.response?.data?.message || 'Erro ao carregar produtos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      await productService.createProduct(productData);
      await loadProducts();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao criar produto');
    }
  };

  const handleUpdateProduct = async (productData: any) => {
    if (!selectedProduct) return;
    try {
      await productService.updateProduct(selectedProduct.id, productData);
      await loadProducts();
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Erro ao atualizar produto');
    }
  };

  const handleAddStock = async (productId: number, quantidade: number) => {
    try {
      await productService.addStock(productId, quantidade);
      await loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao adicionar estoque');
    }
  };

  const handleRemoveStock = async (productId: number, quantidade: number) => {
    try {
      await productService.removeStock(productId, quantidade);
      await loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao remover estoque');
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productService.deleteProduct(productId);
        await loadProducts();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erro ao excluir produto');
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const openStockModal = (productId: number, action: 'add' | 'remove') => {
    setSelectedProductId(productId);
    setStockAction(action);
    setIsStockModalOpen(true);
  };

  const handleStockSubmit = async (quantidade: number) => {
    if (selectedProductId) {
      if (stockAction === 'add') {
        await handleAddStock(selectedProductId, quantidade);
      } else {
        await handleRemoveStock(selectedProductId, quantidade);
      }
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.modelo?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-main mx-auto"></div>
          <p className="text-white mt-4">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {filterType === 'low-stock' && 'Produtos com Estoque Baixo'}
              {filterType === 'out-of-stock' && 'Produtos sem Estoque'}
              {filterType === 'all' && 'Todos os Produtos'}
            </h2>
            <p className="text-gray-400 mt-1">
              {filteredProducts.length} produto(s) encontrado(s)
            </p>
            {!allowStockEdit && (
              <div className="mt-2 text-yellow-500 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>Modo de visualização apenas. Para editar estoque, acesse "Todos os Produtos"</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black-main border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-main focus:ring-1 focus:ring-red-main"
              />
            </div>
            
            {isAdmin && filterType === 'all' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 bg-red-main text-white rounded-lg hover:bg-red-dark transition-colors whitespace-nowrap"
              >
                + Novo Produto
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-main/10 border border-red-main/50 text-red-main rounded-lg flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-black-main/30 rounded-xl border border-gray-700">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddStock={allowStockEdit ? (id) => openStockModal(id, 'add') : undefined}
              onRemoveStock={allowStockEdit ? (id) => openStockModal(id, 'remove') : undefined}
              onDelete={allowStockEdit ? handleDeleteProduct : undefined}
              onEdit={allowStockEdit ? handleEditProduct : undefined}
              allowEdit={allowStockEdit}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProduct}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleUpdateProduct}
        product={selectedProduct}
      />

      <StockModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        onSubmit={handleStockSubmit}
        title={`${stockAction === 'add' ? 'Adicionar' : 'Remover'} Estoque`}
        action={stockAction}
      />
    </div>
  );
};