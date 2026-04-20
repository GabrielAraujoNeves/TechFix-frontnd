import React, { useEffect, useState } from 'react';
import { osService } from '../services/api';
import type { OrdemServico } from '../types/auth.types';
import { useAuth } from '../contexts/AuthContext';
import {
    ClipboardList,
    Search,
    Eye,
    XCircle,
    Trash2,
    AlertCircle,
    CheckCircle,
    User,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    PlusCircle
} from 'lucide-react';
import { CreateOSModal } from './CreateOSModal';
import { OSDetailsModal } from './OSDetailsModal';

export const OSManagement: React.FC = () => {
    const [ordens, setOrdens] = useState<OrdemServico[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('TODOS');
    const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const { isAdmin } = useAuth();

    useEffect(() => {
        loadOrdens();
    }, []);

    const loadOrdens = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await osService.getAllOS();
            setOrdens(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erro ao carregar ordens de serviço');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, newStatus: string) => {
        try {
            console.log(error)
            const observacao = `Status alterado para ${newStatus} pelo sistema`;
            await osService.updateOSStatus(id, newStatus, observacao);
            setMessage({ type: 'success', text: `Status atualizado para ${newStatus}` });
            loadOrdens();
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao atualizar status' });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleCancelOS = async (id: number) => {
        if (window.confirm('Tem certeza que deseja cancelar esta OS?')) {
            try {
                await osService.cancelOS(id);
                setMessage({ type: 'success', text: 'OS cancelada com sucesso!' });
                loadOrdens();
                setTimeout(() => setMessage(null), 3000);
            } catch (err: any) {
                setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao cancelar OS' });
                setTimeout(() => setMessage(null), 3000);
            }
        }
    };

    const handleDeleteOS = async (id: number) => {
        if (window.confirm('Tem certeza que deseja deletar esta OS? Esta ação não pode ser desfeita.')) {
            try {
                await osService.deleteOS(id);
                setMessage({ type: 'success', text: 'OS deletada com sucesso!' });
                loadOrdens();
                setTimeout(() => setMessage(null), 3000);
            } catch (err: any) {
                setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao deletar OS' });
                setTimeout(() => setMessage(null), 3000);
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDENTE: 'bg-yellow-600/20 text-yellow-500',
            CONSERTANDO: 'bg-purple-600/20 text-purple-400',
            FINALIZADO: 'bg-green-600/20 text-green-400',
            CANCELADO: 'bg-red-main/20 text-red-main'
        };
        const labels: Record<string, string> = {
            PENDENTE: 'Pendente',
            CONSERTANDO: 'Consertando',
            FINALIZADO: 'Finalizado',
            CANCELADO: 'Cancelado'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.PENDENTE}`}>
                {labels[status] || status}
            </span>
        );
    };

    const filteredOrdens = ordens.filter(os => {
        const matchesSearch = os.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            os.numeroOS.toLowerCase().includes(searchTerm.toLowerCase()) ||
            os.modelo.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'TODOS' || os.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-main mx-auto"></div>
                    <p className="text-white mt-4">Carregando ordens de serviço...</p>
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
                        <ClipboardList size={28} className="text-red-main" />
                        Ordens de Serviço
                    </h2>
                    <p className="text-gray-400 mt-1">{filteredOrdens.length} OS(s) encontrada(s)</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-red-main text-white rounded-lg hover:bg-red-dark transition-colors flex items-center gap-2"
                >
                    <PlusCircle size={18} />
                    Nova OS
                </button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, número OS ou modelo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-black-main border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-red-main focus:ring-1 focus:ring-red-main"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-black-main border border-gray-700 rounded-lg text-white focus:border-red-main focus:ring-1 focus:ring-red-main"
                >
                    <option value="TODOS">Todos os status</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="CONSERTANDO">Consertando</option>
                    <option value="FINALIZADO">Finalizado</option>
                    <option value="CANCELADO">Cancelado</option>
                </select>
            </div>

            {/* Mensagem de feedback */}
            {message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'success'
                    ? 'bg-green-600/20 border border-green-600/50 text-green-400'
                    : 'bg-red-main/10 border border-red-main/50 text-red-main'
                }`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Cards de OS */}
            {filteredOrdens.length === 0 ? (
                <div className="text-center py-12 bg-black-main/30 rounded-xl border border-gray-700">
                    <ClipboardList className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Nenhuma ordem de serviço encontrada</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredOrdens.map((os) => (
                        <div key={os.id} className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-5 hover:shadow-lg hover:shadow-red-main/10 transition-all duration-300">
                            {/* Cabeçalho */}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-xs text-gray-400">Nº OS</p>
                                    <p className="text-lg font-bold text-white">{os.numeroOS}</p>
                                </div>
                                {getStatusBadge(os.status)}
                            </div>

                            {/* Cliente */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <User size={14} className="text-gray-400" />
                                    <span className="text-white font-medium">{os.clienteNome}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone size={14} className="text-gray-400" />
                                    <span className="text-gray-300">{os.clienteTelefone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail size={14} className="text-gray-400" />
                                    <span className="text-gray-300 truncate">{os.clienteEmail}</span>
                                </div>
                            </div>

                            {/* Produto */}
                            <div className="bg-black-dark rounded-lg p-3 mb-4">
                                <p className="text-gray-300 text-sm">{os.marca} - {os.modelo}</p>
                                <p className="text-gray-400 text-xs line-clamp-2">{os.problema}</p>
                            </div>

                            {/* Valores */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Calendar size={12} />
                                    <span>{new Date(os.dataAbertura).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <DollarSign size={14} className="text-green-400" />
                                    <span className="text-lg font-bold text-green-400">R$ {os.valorTotalGeral.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="flex gap-2 pt-3 border-t border-gray-700">
                                <button
                                    onClick={() => {
                                        setSelectedOS(os);
                                        setShowDetailsModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                                >
                                    <Eye size={16} />
                                    <span className="text-sm">Detalhes</span>
                                </button>

                                {/* Seletor de status - aparece para OS não finalizadas e não canceladas */}
                                {os.status !== 'FINALIZADO' && os.status !== 'CANCELADO' && (
                                    <select
                                        onChange={(e) => handleUpdateStatus(os.id, e.target.value)}
                                        value={os.status}
                                        className="px-3 py-2 bg-black-main border border-gray-700 rounded-lg text-white text-sm focus:border-red-main"
                                    >
                                        <option value="PENDENTE">Pendente</option>
                                        <option value="CONSERTANDO">Consertando</option>
                                        <option value="FINALIZADO">Finalizar</option>
                                    </select>
                                )}

                                {/* Cancelar (ADMIN) - aparece apenas se não estiver cancelado/finalizado */}
                                {isAdmin && os.status !== 'CANCELADO' && os.status !== 'FINALIZADO' && (
                                    <button
                                        onClick={() => handleCancelOS(os.id)}
                                        className="px-3 py-2 bg-yellow-600/20 text-yellow-500 rounded-lg hover:bg-yellow-600/30 transition-colors"
                                        title="Cancelar OS"
                                    >
                                        <XCircle size={16} />
                                    </button>
                                )}

                                {/* Deletar (apenas ADMIN) */}
                                {isAdmin && (
                                    <button
                                        onClick={() => handleDeleteOS(os.id)}
                                        className="px-3 py-2 bg-red-main/20 text-red-main rounded-lg hover:bg-red-main/30 transition-colors"
                                        title="Deletar OS"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modais */}
            <CreateOSModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    loadOrdens();
                    setMessage({ type: 'success', text: 'OS criada com sucesso!' });
                    setTimeout(() => setMessage(null), 3000);
                }}
            />

            <OSDetailsModal
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedOS(null);
                }}
                os={selectedOS}
            />
        </div>
    );
};