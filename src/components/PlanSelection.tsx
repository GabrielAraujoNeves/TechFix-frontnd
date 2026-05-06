import React from 'react';
import { PlanType, PaymentPeriod, PaymentMethod } from '../types/auth.types';

const PLANS: { type: PlanType; name: string; price: Record<PaymentPeriod, number>; features: string[] }[] = [
  {
    type: PlanType.BASIC,
    name: 'Básico',
    price: { MONTHLY: 49.9, QUARTERLY: 139.9, ANNUAL: 499.9 },
    features: ['Até 50 produtos', 'Relatórios básicos', 'Suporte por email']
  },
  {
    type: PlanType.PRO,
    name: 'Profissional',
    price: { MONTHLY: 99.9, QUARTERLY: 279.9, ANNUAL: 999.9 },
    features: ['Produtos ilimitados', 'Relatórios avançados', 'Suporte prioritário', 'API de integração']
  },
  {
    type: PlanType.PREMIUM,
    name: 'Premium',
    price: { MONTHLY: 199.9, QUARTERLY: 549.9, ANNUAL: 1999.9 },
    features: ['Tudo do Pro', 'Suporte 24/7', 'Treinamento personalizado', 'Certificação especial']
  }
];

interface Props {
  selectedPlan: PlanType;
  selectedPeriod: PaymentPeriod;
  selectedMethod: PaymentMethod;
  onPlanChange: (plan: PlanType) => void;
  onPeriodChange: (period: PaymentPeriod) => void;
  onMethodChange: (method: PaymentMethod) => void;
  onNext: () => void;
}

export const PlanSelection: React.FC<Props> = ({
  selectedPlan,
  selectedPeriod,
  selectedMethod,
  onPlanChange,
  onPeriodChange,
  onMethodChange,
  onNext,
}) => {
  const getPrice = (plan: typeof PLANS[0]) => plan.price[selectedPeriod];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Escolha seu plano</h2>

      {/* Periodicidade */}
      <div className="bg-black-dark rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Período de pagamento</h3>
        <div className="flex gap-3">
          {Object.values(PaymentPeriod).map((period) => (
            <button
              key={period}
              onClick={() => onPeriodChange(period)}
              className={`flex-1 px-4 py-2 rounded-lg transition ${
                selectedPeriod === period
                  ? 'bg-red-main text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {period === 'MONTHLY' && 'Mensal'}
              {period === 'QUARTERLY' && 'Trimestral'}
              {period === 'ANNUAL' && 'Anual'}
            </button>
          ))}
        </div>
      </div>

      {/* Cards dos planos */}
      <div className="grid md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.type}
            className={`bg-black-dark rounded-xl border-2 p-5 cursor-pointer transition ${
              selectedPlan === plan.type ? 'border-red-main' : 'border-gray-700 hover:border-red-main/50'
            }`}
            onClick={() => onPlanChange(plan.type)}
          >
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            <p className="text-2xl font-bold text-red-main mt-2">
              R$ {getPrice(plan).toFixed(2)}
              <span className="text-sm text-gray-400 font-normal">
                {selectedPeriod === 'MONTHLY' && '/mês'}
                {selectedPeriod === 'QUARTERLY' && '/trimestre'}
                {selectedPeriod === 'ANNUAL' && '/ano'}
              </span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feat, idx) => (
                <li key={idx} className="text-gray-300 text-sm flex items-center gap-2">
                  <span className="text-green-400">✓</span> {feat}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Método de pagamento */}
      <div className="bg-black-dark rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Método de pagamento</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onMethodChange(PaymentMethod.PIX)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedMethod === PaymentMethod.PIX
                ? 'bg-red-main text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >PIX</button>
          <button
            onClick={() => onMethodChange(PaymentMethod.CREDIT_CARD)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedMethod === PaymentMethod.CREDIT_CARD
                ? 'bg-red-main text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >Cartão de Crédito</button>
          <button
            onClick={() => onMethodChange(PaymentMethod.DEBIT_CARD)}
            className={`px-4 py-2 rounded-lg transition ${
              selectedMethod === PaymentMethod.DEBIT_CARD
                ? 'bg-red-main text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >Cartão de Débito</button>
        </div>
      </div>

      <div className="bg-black-dark rounded-lg p-4 text-right">
        <p className="text-gray-400">Total a pagar:</p>
        <p className="text-2xl font-bold text-green-400">
          R$ {getPrice(PLANS.find(p => p.type === selectedPlan)!).toFixed(2)}
        </p>
      </div>

      <button onClick={onNext} className="w-full btn-primary">Continuar para pagamento</button>
    </div>
  );
};