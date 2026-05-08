// src/components/UserManagement.tsx
import React, { useEffect, useState } from 'react';
import { companyUserService } from '../services/api';
import type { User } from '../types/auth.types';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { 
  Users, 
  Search, 
  Trash2, 
  Edit,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Info
} from 'lucide-react';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { isAdmin } = useAuth();
  const { subscription, getUserLimit, canAddUser, refresh: refreshSubscription } = useSubscription();

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await companyUserService.getCompanyUsers();
      setUsers(response.users || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const currentUserCount = users.length;
  const limit = getUserLimit();
  const canAddMore = canAddUser(currentUserCount);
  const isPlanExpired = subscription?.status !== 'ACTIVE';

  const handleAddUser = async (data: { name: string; email: string; password: string }) => {
    // Verificar limite antes de enviar (além do backend)
    if (!canAddMore) {
      setMessage({
        type: 'error',
        text: `Limite de usuários do plano ${subscription?.planType} foi atingido (${limit}). Faça upgrade para adicionar mais.`
      });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    if (isPlanExpired) {
      setMessage({ type: 'error', text: 'Sua assinatura expirou. Renove para adicionar usuários.' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    try {
      await companyUserService.addUser(data);
      setMessage({ type: 'success', text: 'Usuário adicionado com sucesso!' });
      loadUsers();
      // Atualizar assinatura (pode ter mudado o plano)
      refreshSubscription();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      const backendError = err.response?.data?.error || err.response?.data?.message || 'Erro ao adicionar usuário';
      setMessage({ type: 'error', text: backendError });
      setTimeout(() => setMessage(null), 5000);
      throw err;
    }
  };

  const handleEditUser = async (data: { name: string; email: string }) => {
    if (!selectedUser) return;
    try {
      await companyUserService.updateUser(selectedUser.id, data);
      setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
      loadUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao editar usuário' });
      setTimeout(() => setMessage(null), 3000);
      throw err;
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Deletar este usuário permanentemente?')) {
      try {
        await companyUserService.deleteUser(userId);
        setMessage({ type: 'success', text: 'Usuário removido com sucesso!' });
        loadUsers();
        setTimeout(() => setMessage(null), 3000);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao deletar usuário' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || !subscription) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-main mx-auto"></div>
          <p className="text-white mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-main mx-auto mb-4" />
          <p className="text-red-main">{error}</p>
          <button onClick={loadUsers} className="mt-4 px-4 py-2 bg-red-main text-white rounded-lg hover:bg-red-dark">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users size={28} className="text-red-main" />
            Gerenciar Usuários
          </h2>
          <p className="text-gray-400 mt-1">
            {filteredUsers.length} usuário(s) encontrado(s) | 
            Plano <span className="font-semibold text-red-main">{subscription.planType}</span> • 
            Limite: {limit === Infinity ? 'Ilimitado' : limit} usuários
          </p>
          {!isPlanExpired && (
            <p className="text-gray-500 text-xs mt-1">
              Vencimento: {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('pt-BR') : 'N/A'}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-black-main border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-main focus:ring-1 focus:ring-red-main"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            disabled={!canAddMore || isPlanExpired}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              (canAddMore && !isPlanExpired)
                ? 'bg-red-main text-white hover:bg-red-dark'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
            title={!canAddMore ? `Limite do plano atingido (${limit} usuários)` : isPlanExpired ? 'Assinatura expirada' : ''}
          >
            <PlusCircle size={18} />
            Adicionar Usuário
          </button>
        </div>
      </div>

      {/* Aviso de limite */}
      {!canAddMore && limit !== Infinity && (
        <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-3 flex items-center gap-2 text-yellow-500">
          <Info size={18} />
          <span className="text-sm">
            Limite máximo de usuários do plano {subscription.planType} foi atingido ({limit} usuários).
            Para adicionar mais, faça upgrade do plano.
          </span>
        </div>
      )}

      {isPlanExpired && (
        <div className="bg-red-main/20 border border-red-main/50 rounded-lg p-3 flex items-center gap-2 text-red-main">
          <AlertCircle size={18} />
          <span className="text-sm">Sua assinatura expirou. Renove para continuar gerenciando usuários.</span>
        </div>
      )}

      {/* Mensagem de feedback */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-600/20 border border-green-600/50 text-green-400'
            : 'bg-red-main/10 border border-red-main/50 text-red-main'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabela de usuários */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-black-main/30 rounded-xl border border-gray-700">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-black-main/30 rounded-xl border border-gray-700">
          <table className="w-full">
            <thead className="bg-black-main/50 border-b border-gray-700">
              <tr className="text-left">
                <th className="px-4 py-3 text-gray-300 font-semibold">ID</th>
                <th className="px-4 py-3 text-gray-300 font-semibold">Nome</th>
                <th className="px-4 py-3 text-gray-300 font-semibold">Email</th>
                <th className="px-4 py-3 text-gray-300 font-semibold">Role</th>
                <th className="px-4 py-3 text-gray-300 font-semibold">Data Criação</th>
                <th className="px-4 py-3 text-gray-300 font-semibold text-center">Ações</th>
               </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-black-main/50 transition-colors">
                  <td className="px-4 py-3 text-white">#{user.id}</td>
                  <td className="px-4 py-3 text-white font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-300">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'ADMIN' 
                        ? 'bg-red-main/20 text-red-main' 
                        : 'bg-blue-600/20 text-blue-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
                        className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                        title="Editar usuário"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 bg-red-main/20 text-red-main rounded-lg hover:bg-red-main/30 transition-colors"
                        title="Deletar usuário"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-700 bg-black-main/30">
            <p className="text-gray-400 text-sm">Total de usuários: <span className="text-white font-semibold">{filteredUsers.length}</span> / {limit === Infinity ? '∞' : limit}</p>
          </div>
        </div>
      )}

      {/* Modais */}
      <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddUser} />
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
        onSubmit={handleEditUser}
        user={selectedUser}
      />
    </div>
  );
};