// src/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { subscriptionService, companyService } from '../services/api';
import { PlanType, PaymentPeriod, PaymentMethod, type CardInfo, type SubscriptionResponse, type CompanyData, type PaymentInfoResponse } from '../types/auth.types';
import { Settings, Crown, AlertCircle, CheckCircle, Building2, CreditCard, Save, Edit } from 'lucide-react';
import { PlanSelection } from '../components/PlanSelection';
import { PaymentSimulation } from '../components/PaymentSimulation';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/Input';

// Schema para validação dos dados da empresa
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

export const SettingsPage: React.FC = () => {
  const { subscription, refresh, getUserLimit, isActive } = useSubscription();
  const { isAdmin } = useAuth();
  
  // Estados para upgrade de plano
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(subscription?.planType || PlanType.BASIC);
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriod>(subscription?.paymentPeriod || PaymentPeriod.MONTHLY);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(subscription?.paymentMethod as PaymentMethod || PaymentMethod.PIX);
  const [newSubscriptionId, setNewSubscriptionId] = useState<number | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estados para empresa
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfoResponse | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(true);
  const [editingCompany, setEditingCompany] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormData>();

  // Carregar dados da empresa e pagamento
  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    setLoadingCompany(true);
    try {
      const [companyData, paymentData] = await Promise.all([
        companyService.getCompany(),
        companyService.getPaymentInfo().catch(() => null),
      ]);
      setCompany(companyData);
      setPaymentInfo(paymentData);
      reset(companyData);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao carregar dados da empresa' });
    } finally {
      setLoadingCompany(false);
    }
  };

  const onCompanySubmit = async (data: CompanyFormData) => {
    setSavingCompany(true);
    try {
      const updated = await companyService.updateCompany(data);
      setCompany(updated);
      reset(updated);
      setEditingCompany(false);
      setMessage({ type: 'success', text: 'Dados da empresa atualizados!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao atualizar empresa' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setSavingCompany(false);
    }
  };

  const getAmount = (plan: PlanType, period: PaymentPeriod) => {
    const prices = {
      [PlanType.BASIC]: { [PaymentPeriod.MONTHLY]: 49.9, [PaymentPeriod.QUARTERLY]: 139.9, [PaymentPeriod.ANNUAL]: 499.9 },
      [PlanType.PRO]: { [PaymentPeriod.MONTHLY]: 99.9, [PaymentPeriod.QUARTERLY]: 279.9, [PaymentPeriod.ANNUAL]: 999.9 },
      [PlanType.PREMIUM]: { [PaymentPeriod.MONTHLY]: 199.9, [PaymentPeriod.QUARTERLY]: 549.9, [PaymentPeriod.ANNUAL]: 1999.9 },
    };
    return prices[plan][period];
  };

  const handleRequestUpgrade = async () => {
    if (selectedPlan === subscription?.planType && selectedPeriod === subscription?.paymentPeriod && selectedMethod === (subscription?.paymentMethod as PaymentMethod)) {
      setMessage({ type: 'error', text: 'Nenhuma alteração detectada.' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    setProcessing(true);
    try {
      const newSub = await subscriptionService.upgradePlan({
        newPlan: selectedPlan,
        period: selectedPeriod,
        paymentMethod: selectedMethod,
      });
      setNewSubscriptionId(newSub.id);
      setShowPayment(true);
      setShowModal(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao solicitar upgrade' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmPayment = async (_subscription: SubscriptionResponse, _cardInfo?: CardInfo) => {
    setMessage({ type: 'success', text: 'Plano alterado com sucesso!' });
    setTimeout(() => setMessage(null), 5000);
    refresh();
    setShowPayment(false);
  };

  if (!subscription) {
    return <div className="text-white p-8 text-center">Carregando informações do plano...</div>;
  }

  const planNames = { BASIC: 'Básico', PRO: 'Profissional', PREMIUM: 'Premium' };
  const limit = getUserLimit();
  const limitText = limit === Infinity ? 'Usuários ilimitados' : `Até ${limit} usuários`;
  const canChangePlan = isActive() && isAdmin;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings size={28} className="text-red-main" />
          Configurações
        </h2>
        <p className="text-gray-400">Gerencie sua assinatura e os dados da sua empresa</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-600/20 border border-green-600/50 text-green-400' : 'bg-red-main/10 border border-red-main/50 text-red-main'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* SEÇÃO: PLANO ATUAL */}
      <div className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-main/10 rounded-full">
              <Crown size={28} className="text-red-main" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Plano {planNames[subscription.planType]}</h3>
              <p className="text-gray-400">Período: {subscription.paymentPeriod === 'MONTHLY' ? 'Mensal' : subscription.paymentPeriod === 'QUARTERLY' ? 'Trimestral' : 'Anual'}</p>
              <p className="text-gray-400 text-sm mt-1">Limite: {limitText}</p>
              <p className="text-gray-500 text-xs mt-1">Status: {subscription.status === 'ACTIVE' ? 'Ativo' : subscription.status === 'PENDING_PAYMENT' ? 'Aguardando pagamento' : subscription.status === 'EXPIRED' ? 'Expirado' : 'Cancelado'}</p>
              {subscription.endDate && <p className="text-gray-500 text-xs">Vence em: {new Date(subscription.endDate).toLocaleDateString('pt-BR')}</p>}
              <p className="text-gray-500 text-xs mt-1">Método: {subscription.paymentMethod === 'PIX' ? 'PIX' : subscription.paymentMethod === 'CREDIT_CARD' ? 'Cartão' : 'Débito'}</p>
            </div>
          </div>
          {canChangePlan && (
            <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-red-main text-white rounded-lg hover:bg-red-dark transition-colors">
              Mudar Plano
            </button>
          )}
        </div>
      </div>

      {/* SEÇÃO: DADOS DA EMPRESA */}
      <div className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 size={24} className="text-red-main" />
            Dados da Empresa
          </h3>
          {!editingCompany && (
            <button onClick={() => setEditingCompany(true)} className="px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1 text-sm">
              <Edit size={14} /> Editar
            </button>
          )}
        </div>
        {loadingCompany ? (
          <p className="text-gray-400">Carregando...</p>
        ) : (
          <form onSubmit={handleSubmit(onCompanySubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Nome da empresa" error={errors.nomeEmpresa?.message} disabled={!editingCompany} {...register('nomeEmpresa')} />
              <Input label="CNPJ" error={errors.cnpj?.message} disabled={!editingCompany} {...register('cnpj')} />
              <Input label="Endereço" error={errors.endereco?.message} disabled={!editingCompany} {...register('endereco')} />
              <Input label="Cidade" error={errors.cidade?.message} disabled={!editingCompany} {...register('cidade')} />
              <Input label="Estado" maxLength={2} error={errors.estado?.message} disabled={!editingCompany} {...register('estado')} />
              <Input label="Telefone comercial" error={errors.telefoneComercial?.message} disabled={!editingCompany} {...register('telefoneComercial')} />
              <div className="md:col-span-2">
                <Input label="Segmento de atuação" error={errors.segmentoAtuacao?.message} disabled={!editingCompany} {...register('segmentoAtuacao')} />
              </div>
            </div>
            {editingCompany && (
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setEditingCompany(false); reset(company!); }} className="px-4 py-2 btn-secondary">Cancelar</button>
                <button type="submit" disabled={savingCompany} className="px-4 py-2 btn-primary flex items-center gap-2">
                  {savingCompany ? 'Salvando...' : <><Save size={16} /> Salvar</>}
                </button>
              </div>
            )}
          </form>
        )}
      </div>

      {/* SEÇÃO: MÉTODO DE PAGAMENTO (se existir) */}
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

      {/* MODAL DE UPGRADE DE PLANO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
          <div className="bg-black-main rounded-xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black-main p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Alterar Plano</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6">
              <PlanSelection
                selectedPlan={selectedPlan}
                selectedPeriod={selectedPeriod}
                selectedMethod={selectedMethod}
                onPlanChange={setSelectedPlan}
                onPeriodChange={setSelectedPeriod}
                onMethodChange={setSelectedMethod}
                onNext={handleRequestUpgrade}
              />
              {processing && <p className="text-gray-400 text-center mt-4">Processando...</p>}
            </div>
          </div>
        </div>
      )}

      {/* SIMULAÇÃO DE PAGAMENTO */}
      {showPayment && newSubscriptionId && (
        <PaymentSimulation
          planType={selectedPlan}
          paymentPeriod={selectedPeriod}
          paymentMethod={selectedMethod}
          amount={getAmount(selectedPlan, selectedPeriod)}
          subscriptionId={newSubscriptionId}
          onConfirm={handleConfirmPayment}
          onBack={() => setShowPayment(false)}
        />
      )}
    </div>
  );
};