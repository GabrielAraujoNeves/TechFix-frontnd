// src/components/PaymentSimulation.tsx
import React, { useState } from 'react';
import type { SubscriptionResponse, PlanType, PaymentPeriod, PaymentMethod, CardInfo } from '../types/auth.types';
import { subscriptionService } from '../services/api';
import { AlertCircle } from 'lucide-react';

interface PaymentSimulationProps {
  planType: PlanType;
  paymentPeriod: PaymentPeriod;
  paymentMethod: PaymentMethod;
  amount: number;
  subscriptionId?: number;
  onConfirm: (subscription: SubscriptionResponse, cardInfo?: CardInfo) => void;
  onBack: () => void;
}

export const PaymentSimulation: React.FC<PaymentSimulationProps> = ({
  planType: _planType,
  paymentPeriod: _paymentPeriod,
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

  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleConfirm = async () => {
    if ((paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && !cardNumber.trim()) {
      setError('Preencha os dados do cartão');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (subscriptionId) {
        if (paymentMethod === 'PIX') {
          setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=simulated-pix-payment');
          setSimulatedPayment(true);
          setLoading(false);
          return;
        }
        const confirmed = await subscriptionService.confirmPayment(subscriptionId);
        onConfirm(confirmed, undefined);
      } else {
        throw new Error('subscriptionId não fornecido para confirmação de pagamento');
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
        onConfirm(confirmed, undefined);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao confirmar PIX');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async () => {
    const cardInfo: CardInfo = {
      cardNumber: cardNumber.replace(/\s/g, ''),
      cardholderName,
      expiryDate,
      cvv,
    };
    if (cardNumber.length < 15 || cvv.length < 3 || !expiryDate.match(/^\d{2}\/\d{2}$/)) {
      setError('Verifique os dados do cartão');
      return;
    }
    setLoading(true);
    setError('');
    try {
      if (subscriptionId) {
        const confirmed = await subscriptionService.confirmPayment(subscriptionId);
        onConfirm(confirmed, cardInfo);
      } else {
        throw new Error('subscriptionId não fornecido');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao processar pagamento');
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
            <button onClick={handleConfirm} disabled={loading} className="btn-primary w-full">
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

      {(paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') && (
        <div className="bg-black-dark rounded-lg p-6">
          <h3 className="text-white font-semibold mb-4">
            {paymentMethod === 'CREDIT_CARD' ? 'Dados do Cartão de Crédito' : 'Dados do Cartão de Débito'}
          </h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Número do cartão"
              className="input-field"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              maxLength={16}
            />
            <input
              type="text"
              placeholder="Nome impresso no cartão"
              className="input-field"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Validade (MM/AA)"
                className="input-field"
                value={expiryDate}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length >= 2) val = val.slice(0,2) + '/' + val.slice(2,4);
                  setExpiryDate(val.slice(0,5));
                }}
                maxLength={5}
              />
              <input
                type="password"
                placeholder="CVV"
                className="input-field"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0,4))}
                maxLength={4}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 btn-secondary">Voltar</button>
        {paymentMethod !== 'PIX' && (
          <button onClick={handleCardPayment} disabled={loading} className="flex-1 btn-primary">
            {loading ? 'Processando...' : `Pagar R$ ${amount.toFixed(2)}`}
          </button>
        )}
      </div>
    </div>
  );
};