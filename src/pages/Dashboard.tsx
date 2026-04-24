import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ProductsPage } from './ProductsPage';
import { UserManagement } from '../components/UserManagement';
import { OSManagement } from '../components/OSManagement';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/api';
import {
  Package,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  ArrowUp,
  Crown,
  User,
  Clock,
  PlusCircle,
  Edit3
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0,
    totalSold: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
    loadRecentActivities();
  }, []);

  // Debug para ver qual tab está ativa
  useEffect(() => {
    console.log('ActiveTab mudou para:', activeTab);
  }, [activeTab]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [allProducts, lowStock, outOfStock] = await Promise.all([
        productService.getAllProducts(),
        productService.getLowStockProducts(),
        productService.getOutOfStockProducts()
      ]);

      const productsArray = Array.isArray(allProducts) ? allProducts : [];
      const lowStockArray = Array.isArray(lowStock) ? lowStock : [];
      const outOfStockArray = Array.isArray(outOfStock) ? outOfStock : [];

      const totalValue = productsArray.reduce((sum, product) =>
        sum + (product.precoAtacado * product.quantidadeEstoque), 0
      );

      setStats({
        totalProducts: productsArray.length,
        lowStock: lowStockArray.length,
        outOfStock: outOfStockArray.length,
        totalValue: totalValue,
        totalSold: 1245,
        totalRevenue: 45678.90,
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setStats({
        totalProducts: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
        totalSold: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para formatar tempo relativo (ex: "Há 5 minutos")
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora mesmo';
    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  };

  const loadRecentActivities = async () => {
    try {
      // Busca o último produto criado e o último atualizado em paralelo
      const [lastCreated, lastUpdated] = await Promise.all([
        productService.getLastCreatedProduct(),
        productService.getLastUpdatedProduct()
      ]);

      const activities = [];

      if (lastCreated && lastCreated.product && lastCreated.cadastradoEm) {
        activities.push({
          id: 'created',
          action: 'Produto adicionado',
          product: lastCreated.product.nome,
          time: formatRelativeTime(lastCreated.cadastradoEm),
          user: 'Sistema',
          type: 'add',
          timestamp: new Date(lastCreated.cadastradoEm).getTime()
        });
      }

      if (lastUpdated && lastUpdated.product) {
        const updateDate = lastUpdated.atualizadoEm || lastUpdated.product.updatedAt;
        if (updateDate) {
          activities.push({
            id: 'updated',
            action: 'Produto atualizado',
            product: lastUpdated.product.nome,
            time: formatRelativeTime(updateDate),
            user: 'Sistema',
            type: 'update',
            timestamp: new Date(updateDate).getTime()
          });
        }
      }

      // Ordena por timestamp decrescente (mais recente primeiro)
      activities.sort((a, b) => b.timestamp - a.timestamp);

      // Se quiser exibir apenas as 2 mais recentes, fica show. Se não houver dados, mostra mock
      if (activities.length === 0) {
        // Fallback mock (como você já tinha)
        setRecentActivities([
          { id: 1, action: 'Produto adicionado', product: 'Galaxy S24', user: 'Admin', time: 'Há 5 minutos', type: 'add', timestamp: Date.now() - 300000 },
          { id: 2, action: 'Estoque atualizado', product: 'iPhone 15', user: 'Admin', time: 'Há 1 hora', type: 'update', timestamp: Date.now() - 3600000 },
          { id: 3, action: 'Venda realizada', product: 'Notebook Dell', user: 'Vendedor', time: 'Há 2 horas', type: 'sale', timestamp: Date.now() - 7200000 },
          { id: 4, action: 'Produto removido', product: 'Mouse Logitech', user: 'Admin', time: 'Há 3 horas', type: 'remove', timestamp: Date.now() - 10800000 },
        ]);
      } else {
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error('Erro ao carregar atividades recentes:', error);
      // Fallback mock em caso de erro
      setRecentActivities([
        { id: 1, action: 'Produto adicionado', product: 'Galaxy S24', user: 'Admin', time: 'Há 5 minutos', type: 'add', timestamp: Date.now() - 300000 },
        { id: 2, action: 'Estoque atualizado', product: 'iPhone 15', user: 'Admin', time: 'Há 1 hora', type: 'update', timestamp: Date.now() - 3600000 },
      ]);
    }
  };

  const renderContent = () => {
    console.log('Renderizando conteúdo para tab:', activeTab);

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Welcome Section com Role Badge */}
            <div className="bg-gradient-to-r from-red-main/20 to-black-main/50 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${isAdmin ? 'bg-red-main/20' : 'bg-blue-600/20'}`}>
                    {isAdmin ? (
                      <Crown className="w-8 h-8 text-red-main" />
                    ) : (
                      <User className="w-8 h-8 text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Bem-vindo, {user?.name || user?.email?.split('@')[0]}!
                    </h2>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-400">
                        {isAdmin ? 'Você está no modo Administrador' : 'Você está no modo Visualização'}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isAdmin ? 'bg-red-main/20 text-red-main' : 'bg-blue-600/20 text-blue-400'
                        }`}>
                        {isAdmin ? 'ADMIN' : 'USER'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="bg-black-main/50 rounded-lg px-4 py-2">
                    <Calendar className="w-5 h-5 text-gray-400 inline mr-2" />
                    <span className="text-gray-300">
                      {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Total Produtos */}
              <div className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:shadow-lg hover:shadow-red-main/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-main/10 rounded-lg">
                    <Package className="w-6 h-6 text-red-main" />
                  </div>
                  {loading ? (
                    <div className="animate-pulse w-16 h-8 bg-gray-700 rounded"></div>
                  ) : (
                    <span className="text-3xl font-bold text-white">{stats.totalProducts}</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">Total de Produtos</p>
                <div className="mt-2 flex items-center text-green-400 text-xs">
                  <ArrowUp size={12} />
                  <span className="ml-1">+12% este mês</span>
                </div>
              </div>

              {/* Estoque Baixo */}
              <div
                className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 cursor-pointer"
                onClick={() => stats.lowStock > 0 && setActiveTab('low-stock')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-600/10 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-yellow-500" />
                  </div>
                  {loading ? (
                    <div className="animate-pulse w-16 h-8 bg-gray-700 rounded"></div>
                  ) : (
                    <span className="text-3xl font-bold text-yellow-500">{stats.lowStock}</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">Produtos com Estoque Baixo</p>
                <div className="mt-2 flex items-center text-red-400 text-xs">
                  <ArrowUp size={12} />
                  <span className="ml-1">+5% esta semana</span>
                </div>
              </div>

              {/* Sem Estoque */}
              <div
                className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 cursor-pointer"
                onClick={() => stats.outOfStock > 0 && setActiveTab('out-of-stock')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-main/10 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-main" />
                  </div>
                  {loading ? (
                    <div className="animate-pulse w-16 h-8 bg-gray-700 rounded"></div>
                  ) : (
                    <span className="text-3xl font-bold text-red-main">{stats.outOfStock}</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">Produtos sem Estoque</p>
                <div className="mt-2 flex items-center text-red-400 text-xs">
                  <ArrowUp size={12} />
                  <span className="ml-1">+3% esta semana</span>
                </div>
              </div>

              {/* Valor Total */}
              <div className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-600/10 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  {loading ? (
                    <div className="animate-pulse w-24 h-8 bg-gray-700 rounded"></div>
                  ) : (
                    <span className="text-2xl font-bold text-green-400">
                      R$ {stats.totalValue.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">Valor Total em Estoque</p>
                <div className="mt-2 flex items-center text-green-400 text-xs">
                  <ArrowUp size={12} />
                  <span className="ml-1">+8% este mês</span>
                </div>
              </div>
            </div>

            {/* Second Row Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vendas e Receita - Só aparece para ADMIN */}
              {isAdmin && (
                <div className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Desempenho de Vendas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-black-dark rounded-lg">
                      <ShoppingCart className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{stats.totalSold}</p>
                      <p className="text-gray-400 text-sm">Total de Vendas</p>
                    </div>
                    <div className="text-center p-4 bg-black-dark rounded-lg">
                      <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">
                        R$ {stats.totalRevenue.toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm">Receita Total</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Atividades Recentes - Agora com dados reais */}
              <div className={`bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 ${!isAdmin ? 'lg:col-span-2' : ''}`}>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-red-main" />
                  Últimas Atividades
                </h3>
                <div className="space-y-3">
                  {recentActivities.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Nenhuma atividade recente</p>
                  ) : (
                    recentActivities.map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-black-dark rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${activity.type === 'add' ? 'bg-green-600/20' :
                              activity.type === 'update' ? 'bg-blue-600/20' :
                                activity.type === 'sale' ? 'bg-purple-600/20' : 'bg-red-600/20'
                            }`}>
                            {activity.type === 'add' && <PlusCircle className="w-4 h-4 text-green-400" />}
                            {activity.type === 'update' && <Edit3 className="w-4 h-4 text-blue-400" />}
                            {activity.type === 'sale' && <ShoppingCart className="w-4 h-4 text-purple-400" />}
                            {activity.type === 'remove' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold">{activity.action}</p>
                            <p className="text-gray-400 text-xs">{activity.product}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">{activity.time}</p>
                          <p className="text-gray-500 text-xs">por {activity.user}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Alertas e Notificações */}
            {(stats.lowStock > 0 || stats.outOfStock > 0) && (
              <div
                className="bg-yellow-600/10 border border-yellow-600/30 rounded-xl p-4 cursor-pointer hover:bg-yellow-600/20 transition-all duration-300"
                onClick={() => {
                  if (stats.lowStock > 0) setActiveTab('low-stock');
                  else if (stats.outOfStock > 0) setActiveTab('out-of-stock');
                }}
              >
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-500 font-semibold">Atenção! Estoque crítico</h4>
                    <p className="text-gray-300 text-sm">
                      Você tem {stats.lowStock} produtos com estoque baixo e {stats.outOfStock} produtos sem estoque.
                      {isAdmin && ' Clique aqui para visualizar.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dicas Rápidas */}
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <h4 className="text-blue-400 font-semibold">Dica Rápida</h4>
                  <p className="text-gray-300 text-sm">
                    {isAdmin
                      ? '✅ Você tem permissão de administrador. Use o menu "Adicionar Produto" para incluir novos itens ao estoque.'
                      : '👁️ Você está visualizando o estoque. Entre em contato com o administrador para solicitar alterações.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'users':
        console.log('Renderizando UserManagement');
        return <UserManagement />;
      case 'os':
        console.log('Renderizando OSManagement');
        return <OSManagement />;
      case 'products':
        return <ProductsPage filterType="all" />;
      case 'add-product':
        return <ProductsPage filterType="all" />;
      case 'low-stock':
        return <ProductsPage filterType="low-stock" />;
      case 'out-of-stock':
        return <ProductsPage filterType="out-of-stock" />;
      default:
        console.log('Tab não encontrada, retornando default');
        return <ProductsPage filterType="all" />;
    }
  };

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="flex h-screen bg-gradient-to-br from-black-dark via-gray-dark to-black-main">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-main mx-auto"></div>
                <p className="text-white mt-4">Carregando dashboard...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-black-dark via-gray-dark to-black-main overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};