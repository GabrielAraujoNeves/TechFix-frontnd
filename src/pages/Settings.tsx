import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { subscriptionService } from '../services/api';
import { PlanType, PaymentPeriod, PaymentMethod } from '../types/auth.types';
import { Settings, Crown, AlertCircle, CheckCircle } from 'lucide-react';
import { PlanSelection } from '../components/PlanSelection';
import { useAuth } from '../contexts/AuthContext';

export const SettingsPage: React.FC = () => {
  const { subscription, refresh, getUserLimit, isActive } = useSubscription();
  const { isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(subscription?.planType || PlanType.BASIC);
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriod>(subscription?.paymentPeriod || PaymentPeriod.MONTHLY);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(subscription?.paymentMethod as PaymentMethod || PaymentMethod.PIX);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const getAmount = (plan: PlanType, period: PaymentPeriod) => {
    const prices = {
      [PlanType.BASIC]: { [PaymentPeriod.MONTHLY]: 49.9, [PaymentPeriod.QUARTERLY]: 139.9, [PaymentPeriod.ANNUAL]: 499.9 },
      [PlanType.PRO]: { [PaymentPeriod.MONTHLY]: 99.9, [PaymentPeriod.QUARTERLY]: 279.9, [PaymentPeriod.ANNUAL]: 999.9 },
      [PlanType.PREMIUM]: { [PaymentPeriod.MONTHLY]: 199.9, [PaymentPeriod.QUARTERLY]: 549.9, [PaymentPeriod.ANNUAL]: 1999.9 },
    };
    return prices[plan][period];
  };

  const handleChangePlan = async () => {
    // Verifica se houve alguma alteração
    if (
      selectedPlan === subscription?.planType &&
      selectedPeriod === subscription?.paymentPeriod &&
      selectedMethod === (subscription?.paymentMethod as PaymentMethod)
    ) {
      setMessage({ type: 'error', text: 'Nenhuma alteração detectada. Escolha um plano, período ou método diferente.' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    setProcessing(true);
    try {
      // 1. Solicita a mudança de plano (cria assinatura pendente)
      const newSub = await subscriptionService.upgradePlan({
        newPlan: selectedPlan,
        period: selectedPeriod,
        paymentMethod: selectedMethod,
      });
      // 2. Confirma o pagamento imediatamente (simulação)
      await subscriptionService.confirmPayment(newSub.id);
      // 3. Exibe mensagem de sucesso
      setMessage({ type: 'success', text: 'Plano alterado com sucesso!' });
      setTimeout(() => setMessage(null), 5000);
      // 4. Atualiza os dados da assinatura
      refresh();
      // 5. Fecha o modal
      setShowModal(false);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao alterar plano' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setProcessing(false);
    }
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
        <p className="text-gray-400">Gerencie as informações da sua conta e assinatura</p>
      </div>

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

      {/* Plano atual */}
      <div className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-main/10 rounded-full">
              <Crown size={28} className="text-red-main" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Plano {planNames[subscription.planType]}</h3>
              <p className="text-gray-400">
                Período: {subscription.paymentPeriod === 'MONTHLY' ? 'Mensal' :
                          subscription.paymentPeriod === 'QUARTERLY' ? 'Trimestral' : 'Anual'}
              </p>
              <p className="text-gray-400 text-sm mt-1">Limite: {limitText}</p>
              <p className="text-gray-500 text-xs mt-1">
                Status: {subscription.status === 'ACTIVE' ? 'Ativo' :
                         subscription.status === 'PENDING_PAYMENT' ? 'Aguardando pagamento' :
                         subscription.status === 'EXPIRED' ? 'Expirado' : 'Cancelado'}
              </p>
              {subscription.endDate && (
                <p className="text-gray-500 text-xs">Vence em: {new Date(subscription.endDate).toLocaleDateString('pt-BR')}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Método: {subscription.paymentMethod === 'PIX' ? 'PIX' :
                         subscription.paymentMethod === 'CREDIT_CARD' ? 'Cartão' : 'Débito'}
              </p>
            </div>
          </div>
          {canChangePlan && (
            <button
              onClick={() => {
                setSelectedPlan(subscription.planType);
                setSelectedPeriod(subscription.paymentPeriod);
                setSelectedMethod(subscription.paymentMethod as PaymentMethod);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-red-main text-white rounded-lg hover:bg-red-dark transition-colors"
            >
              Mudar Plano
            </button>
          )}
        </div>
      </div>

      {/* Modal de seleção de plano */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
          <div className="bg-black-main rounded-xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-black-main p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Alterar Plano</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <PlanSelection
                selectedPlan={selectedPlan}
                selectedPeriod={selectedPeriod}
                selectedMethod={selectedMethod}
                onPlanChange={setSelectedPlan}
                onPeriodChange={setSelectedPeriod}
                onMethodChange={setSelectedMethod}
                onNext={handleChangePlan} // Agora chama diretamente o fluxo completo
              />
              {processing && <p className="text-gray-400 text-center mt-4">Processando alteração do plano...</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};