// src/components/CompanyProfile.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { companyService } from '../services/api';
import type { CompanyData, PaymentInfoResponse } from '../types/auth.types';
import { Building2, CreditCard, Save, Edit, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from './Input';

const companySchema = z.object({
  nomeEmpresa: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  endereco: z.string().min(5, 'Endereço é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 letras'),
  telefoneComercial: z.string().min(10, 'Telefone inválido'),
  segmentoAtuacao: z.string().min(2, 'Segmento é obrigatório'),
});

type CompanyFormData = z.infer<typeof companySchema>;

export const CompanyProfile: React.FC = () => {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormData>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [companyData, paymentData] = await Promise.all([
        companyService.getCompany(),
        companyService.getPaymentInfo().catch(() => null),
      ]);
      setCompany(companyData);
      setPaymentInfo(paymentData);
      reset(companyData);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    setSaving(true);
    try {
      const updated = await companyService.updateCompany(data);
      setCompany(updated);
      reset(updated);
      setEditing(false);
      setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao atualizar' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white text-center py-12">Carregando dados da empresa...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building2 size={28} className="text-red-main" />
          Perfil da Empresa
        </h2>
        {!editing && (
          <button onClick={() => setEditing(true)} className="px-4 py-2 bg-red-main text-white rounded-lg hover:bg-red-dark transition-colors flex items-center gap-2">
            <Edit size={18} /> Editar
          </button>
        )}
      </div>

      {/* Mensagem */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-600/20 text-green-400' : 'bg-red-main/10 text-red-main'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Formulário */}
      <div className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Nome da empresa" error={errors.nomeEmpresa?.message} disabled={!editing} {...register('nomeEmpresa')} />
            <Input label="CNPJ" error={errors.cnpj?.message} disabled={!editing} {...register('cnpj')} />
            <Input label="Endereço" error={errors.endereco?.message} disabled={!editing} {...register('endereco')} />
            <Input label="Cidade" error={errors.cidade?.message} disabled={!editing} {...register('cidade')} />
            <Input label="Estado" maxLength={2} error={errors.estado?.message} disabled={!editing} {...register('estado')} />
            <Input label="Telefone comercial" error={errors.telefoneComercial?.message} disabled={!editing} {...register('telefoneComercial')} />
            <div className="md:col-span-2">
              <Input label="Segmento de atuação" error={errors.segmentoAtuacao?.message} disabled={!editing} {...register('segmentoAtuacao')} />
            </div>
          </div>
          {editing && (
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setEditing(false); reset(company!); }} className="px-4 py-2 btn-secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 btn-primary flex items-center gap-2">
                {saving ? 'Salvando...' : <><Save size={16} /> Salvar</>}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Informações de pagamento */}
      {paymentInfo && (
        <div className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <CreditCard size={24} className="text-red-main" />
            Método de Pagamento
          </h3>
          <div className="space-y-2 text-gray-300">
            <p><span className="text-gray-400">Método:</span> {paymentInfo.paymentMethod === 'CREDIT_CARD' ? 'Cartão de Crédito' : paymentInfo.paymentMethod === 'DEBIT_CARD' ? 'Cartão de Débito' : 'PIX'}</p>
            {paymentInfo.cardDetails && (
              <>
                <p><span className="text-gray-400">Bandeira:</span> {paymentInfo.cardDetails.brand}</p>
                <p><span className="text-gray-400">Final:</span> **** {paymentInfo.cardDetails.last4}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};