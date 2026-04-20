import React from 'react';
import { X, Calendar, User, Phone, Mail, Wrench, Package, DollarSign, Clock } from 'lucide-react';
import type { OrdemServico } from '../types/auth.types';

interface OSDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    os: OrdemServico | null;
}

export const OSDetailsModal: React.FC<OSDetailsModalProps> = ({ isOpen, onClose, os }) => {
    if (!isOpen || !os) return null;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDENTE: 'text-yellow-500 bg-yellow-600/20',
            EM_ANDAMENTO: 'text-blue-400 bg-blue-600/20',
            CONCLUIDA: 'text-green-400 bg-green-600/20',
            CANCELADA: 'text-red-main bg-red-main/20'
        };
        return colors[status] || colors.PENDENTE;
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            PENDENTE: 'Pendente',
            EM_ANDAMENTO: 'Em Andamento',
            CONCLUIDA: 'Concluída',
            CANCELADA: 'Cancelada'
        };
        return labels[status] || status;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
            <div className="bg-black-main rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
                <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-700 bg-black-main">
                    <div>
                        <h2 className="text-xl font-bold text-white">Detalhes da OS</h2>
                        <p className="text-sm text-gray-400">{os.numeroOS}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status */}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Status atual:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(os.status)}`}>
                            {getStatusLabel(os.status)}
                        </span>
                    </div>

                    {/* Cliente */}
                    <div className="bg-black-dark rounded-lg p-4 space-y-2">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <User size={16} className="text-red-main" />
                            Dados do Cliente
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User size={14} className="text-gray-400" />
                                <span className="text-white">{os.clienteNome}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-white">{os.clienteTelefone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm md:col-span-2">
                                <Mail size={14} className="text-gray-400" />
                                <span className="text-white">{os.clienteEmail}</span>
                            </div>
                        </div>
                    </div>

                    {/* Equipamento */}
                    <div className="bg-black-dark rounded-lg p-4 space-y-2">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Wrench size={16} className="text-red-main" />
                            Equipamento
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-gray-400 text-xs">Marca</p>
                                <p className="text-white">{os.marca}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs">Modelo</p>
                                <p className="text-white">{os.modelo}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-400 text-xs">Problema</p>
                                <p className="text-white">{os.problema}</p>
                            </div>
                            {os.observacoes && (
                                <div className="col-span-2">
                                    <p className="text-gray-400 text-xs">Observações</p>
                                    <p className="text-white">{os.observacoes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Itens (peças) */}
                    {os.itens && os.itens.length > 0 && (
                        <div className="bg-black-dark rounded-lg p-4 space-y-2">
                            <h3 className="text-white font-semibold flex items-center gap-2">
                                <Package size={16} className="text-red-main" />
                                Peças Utilizadas
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-gray-400 border-b border-gray-700">
                                        <tr>
                                            <th className="text-left py-2">Produto</th>
                                            <th className="text-center py-2">Qtd</th>
                                            <th className="text-right py-2">Unitário</th>
                                            <th className="text-right py-2">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {os.itens.map((item, idx) => (
                                            <tr key={idx} className="border-b border-gray-700/50">
                                                <td className="py-2 text-white">
                                                    {item.produtoNome || item.nomeProduto || `Produto #${item.produtoId}`}
                                                </td>
                                                <td className="py-2 text-center text-white">{item.quantidade}</td>
                                                <td className="py-2 text-right text-white">
                                                    R$ {(item.precoUnitarioPeca || item.precoUnitario || 0).toFixed(2)}
                                                </td>
                                                <td className="py-2 text-right text-white">
                                                    R$ {(item.valorTotalPeca || item.subtotal || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Valores */}
                    <div className="bg-black-dark rounded-lg p-4">
                        <h3 className="text-white font-semibold mb-3">Valores</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Mão de Obra:</span>
                                <span className="text-white">R$ {os.valorTotalConserto.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Peças:</span>
                                <span className="text-white">R$ {os.valorTotalPecas.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-700">
                                <span className="text-gray-300 font-semibold">Total Geral:</span>
                                <span className="text-green-400 font-bold text-lg">R$ {os.valorTotalGeral.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Datas */}
                    <div className="flex justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>Abertura: {new Date(os.dataAbertura).toLocaleString('pt-BR')}</span>
                        </div>
                        {os.dataFinalizacao && (
                            <div className="flex items-center gap-1">
                                <Clock size={14} />
                                <span>Finalização: {new Date(os.dataFinalizacao).toLocaleString('pt-BR')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};