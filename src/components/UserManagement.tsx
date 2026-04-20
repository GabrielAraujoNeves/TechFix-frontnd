import React, { useEffect, useState } from 'react';
import { userService } from '../services/api';
import type { User } from '../types/auth.types';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Search, 
  Trash2, 
  Crown, 
  UserX, 
  Key,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userService.getAllUsers();
      console.log('Usuários carregados:', response); // Debug
      setUsers(response.users || []);
    } catch (err: any) {
      console.error('Erro ao carregar usuários:', err);
      setError(err.response?.data?.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja promover este usuário para ADMIN?')) {
      try {
        await userService.promoteToAdmin(userId);
        setMessage({ type: 'success', text: 'Usuário promovido para ADMIN com sucesso!' });
        loadUsers();
        setTimeout(() => setMessage(null), 3000);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao promover usuário' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleDemoteToUser = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja rebaixar este usuário para USER?')) {
      try {
        await userService.demoteToUser(userId);
        setMessage({ type: 'success', text: 'Usuário rebaixado para USER com sucesso!' });
        loadUsers();
        setTimeout(() => setMessage(null), 3000);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao rebaixar usuário' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleResetPassword = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja resetar a senha deste usuário?')) {
      try {
        await userService.resetPassword(userId);
        setMessage({ type: 'success', text: 'Senha resetada com sucesso! Nova senha enviada por email.' });
        setTimeout(() => setMessage(null), 3000);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao resetar senha' });
        setTimeout(() => setMessage(null), 3000);
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.')) {
      try {
        await userService.deleteUser(userId);
        setMessage({ type: 'success', text: 'Usuário deletado com sucesso!' });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-main mx-auto"></div>
          <p className="text-white mt-4">Carregando usuários...</p>
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
          <button
            onClick={loadUsers}
            className="mt-4 px-4 py-2 bg-red-main text-white rounded-lg hover:bg-red-dark"
          >
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
            Gerencie todos os usuários do sistema
          </p>
        </div>

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
      </div>

      {/* Message */}
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

      {/* Users Table */}
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
                      {/* Promover/Demote */}
                      {user.role === 'USER' ? (
                        <button
                          onClick={() => handlePromoteToAdmin(user.id)}
                          className="p-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors"
                          title="Promover para ADMIN"
                        >
                          <Crown size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDemoteToUser(user.id)}
                          className="p-2 bg-yellow-600/20 text-yellow-500 rounded-lg hover:bg-yellow-600/30 transition-colors"
                          title="Rebaixar para USER"
                        >
                          <UserX size={16} />
                        </button>
                      )}

                      {/* Reset Password */}
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                        title="Resetar senha"
                      >
                        <Key size={16} />
                      </button>

                      {/* Delete User */}
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
          
          {/* Footer com total */}
          <div className="px-4 py-3 border-t border-gray-700 bg-black-main/30">
            <p className="text-gray-400 text-sm">
              Total de usuários: <span className="text-white font-semibold">{filteredUsers.length}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};