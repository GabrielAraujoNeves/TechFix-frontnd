import React, { useState } from 'react';
import type { SubscriptionResponse, PlanType, PaymentPeriod, PaymentMethod } from '../types/auth.types';
import { subscriptionService } from '../services/api';
import { AlertCircle } from 'lucide-react';

interface PaymentSimulationProps {
  planType: PlanType;
  paymentPeriod: PaymentPeriod;
  paymentMethod: PaymentMethod;
  amount: number;
  subscriptionId?: number; // novo: ID da assinatura pendente
  onConfirm: (subscription: SubscriptionResponse) => void;
  onBack: () => void;
}

export const PaymentSimulation: React.FC<PaymentSimulationProps> = ({
  planType,
  paymentPeriod,
  paymentMethod,
  amount,
  subscriptionId,
  onConfirm,
  onBack,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [simulatedPayment, setSimulatedPayment] = useState(false);

  const handleCreateAndConfirm = async (skipPixWait = false) => {
    setLoading(true);
    setError('');
    try {
      // Se já temos um subscriptionId, apenas confirma, sem criar nova
      if (subscriptionId) {
        // Para PIX, se não skip, mostrar QR simulado
        if (paymentMethod === 'PIX' && !skipPixWait) {
          setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=simulated-pix-payment');
          setSimulatedPayment(true);
          setLoading(false);
          return;
        }
        const confirmed = await subscriptionService.confirmPayment(subscriptionId);
        onConfirm(confirmed);
      } else {
        // Fallback: cria nova assinatura (fluxo antigo)
        const subscription = await subscriptionService.createSubscription({
          planType,
          paymentPeriod,
          paymentMethod,
        });
        if (paymentMethod === 'PIX' && !skipPixWait) {
          setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=simulated-pix-payment');
          setSimulatedPayment(true);
          setLoading(false);
          return;
        }
        const confirmed = await subscriptionService.confirmPayment(subscription.id);
        onConfirm(confirmed);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const confirmPix = async () => {
    if (!simulatedPayment) return;
    setLoading(true);
    try {
      if (subscriptionId) {
        const confirmed = await subscriptionService.confirmPayment(subscriptionId);
        onConfirm(confirmed);
      } else {
        const subscription = await subscriptionService.createSubscription({
          planType,
          paymentPeriod,
          paymentMethod,
        });
        const confirmed = await subscriptionService.confirmPayment(subscription.id);
        onConfirm(confirmed);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao confirmar PIX');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Pagamento</h2>
      {error && (
        <div className="bg-red-main/10 border border-red-main/50 text-red-main p-3 rounded-lg flex gap-2 items-center">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {paymentMethod === 'PIX' && !simulatedPayment && (
        <div className="bg-black-dark rounded-lg p-6 text-center">
          <p className="text-gray-300 mb-4">Escaneie o QR Code para pagar via PIX</p>
          {qrCode ? (
            <img src={qrCode} alt="QR Code PIX" className="mx-auto w-48 h-48" />
          ) : (
            <button onClick={() => handleCreateAndConfirm()} disabled={loading} className="btn-primary w-full">
              {loading ? 'Gerando...' : 'Gerar QR Code PIX'}
            </button>
          )}
          {qrCode && (
            <button onClick={confirmPix} disabled={loading} className="btn-primary w-full mt-4">
              {loading ? 'Confirmando...' : 'Simular pagamento concluído'}
            </button>
          )}
        </div>
      )}
      {paymentMethod !== 'PIX' && (
        <div className="bg-black-dark rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">Dados do cartão (simulação)</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Número do cartão" className="input-field" defaultValue="4111 1111 1111 1111" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Validade" className="input-field" defaultValue="12/28" />
              <input type="text" placeholder="CVV" className="input-field" defaultValue="123" />
            </div>
            <input type="text" placeholder="Nome no cartão" className="input-field" defaultValue="CLIENTE TESTE" />
          </div>
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 btn-secondary">Voltar</button>
        {paymentMethod !== 'PIX' && (
          <button onClick={() => handleCreateAndConfirm(true)} disabled={loading} className="flex-1 btn-primary">
            {loading ? 'Processando...' : `Pagar R$ ${amount.toFixed(2)}`}
          </button>
        )}
      </div>
    </div>
  );
};