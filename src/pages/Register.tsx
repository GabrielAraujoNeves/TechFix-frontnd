import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/Input';
import { PlanSelection } from '../components/PlanSelection';
import { PaymentSimulation } from '../components/PaymentSimulation';
import { authService, subscriptionService } from '../services/api';
import { PlanType, PaymentPeriod, PaymentMethod } from '../types/auth.types';
import { Building2, User, Wrench, ArrowRight, ArrowLeft } from 'lucide-react';
import { SlideSection } from '../components/SlideSection';
import { businessSegments } from '../constants/segments';

// Esquema de validação para dados pessoais
const personalInfoSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

// Esquema de validação para dados da empresa (agora com select)
const companyInfoSchema = z.object({
  nomeEmpresa: z.string().min(2, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  endereco: z.string().min(5, 'Endereço é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 letras'),
  telefoneComercial: z.string().min(10, 'Telefone inválido'),
  segmentoAtuacao: z.string().min(2, 'Selecione o segmento de atuação'),
  segmentoCode: z.string().optional(), // será preenchido automaticamente
});

type PersonalInfo = z.infer<typeof personalInfoSchema>;
type CompanyInfo = z.infer<typeof companyInfoSchema>;
type Step = 'personal' | 'company' | 'plan' | 'payment';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('personal');
  const [personalData, setPersonalData] = useState<PersonalInfo | null>(null);
  const [companyData, setCompanyData] = useState<CompanyInfo | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(PlanType.BASIC);
  const [selectedPeriod, setSelectedPeriod] = useState<PaymentPeriod>(PaymentPeriod.MONTHLY);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.PIX);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [subscriptionConfirmed, setSubscriptionConfirmed] = useState(false);

  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const companyForm = useForm<CompanyInfo>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      nomeEmpresa: '',
      cnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      telefoneComercial: '',
      segmentoAtuacao: '',
      segmentoCode: '',
    },
  });

  // Quando o usuário selecionar um segmento, preenche automaticamente o código
  const handleSegmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLabel = e.target.value;
    const selected = businessSegments.find(seg => seg.label === selectedLabel);
    if (selected) {
      companyForm.setValue('segmentoAtuacao', selected.label);
      companyForm.setValue('segmentoCode', selected.code);
    } else {
      companyForm.setValue('segmentoAtuacao', selectedLabel);
      companyForm.setValue('segmentoCode', '');
    }
  };

  const onPersonalSubmit = (data: PersonalInfo) => {
    setPersonalData(data);
    setCurrentStep('company');
    personalForm.reset();
  };

  const onCompanySubmit = (data: CompanyInfo) => {
    setCompanyData(data);
    setCurrentStep('plan');
    companyForm.reset();
  };

  // Envia os dados para criar usuário + assinatura pendente
  const handleProceedToPayment = async () => {
    if (!personalData || !companyData) {
      setError('Dados incompletos. Volte e preencha todas as etapas.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.register({
        ...personalData,
        ...companyData,
        planType: selectedPlan,
        paymentPeriod: selectedPeriod,
        paymentMethod: selectedMethod,
      });
      if (response.success && response.subscriptionId) {
        setSubscriptionId(response.subscriptionId);
        setCurrentStep('payment');
      } else {
        setError('Erro ao criar assinatura. Tente novamente.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirma o pagamento usando o subscriptionId obtido
  const handlePaymentConfirm = async () => {
    if (!subscriptionId) return;
    setIsLoading(true);
    setError('');
    try {
      await subscriptionService.confirmPayment(subscriptionId);
      setSubscriptionConfirmed(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao confirmar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const getAmount = () => {
    const prices = {
      [PlanType.BASIC]: { [PaymentPeriod.MONTHLY]: 49.9, [PaymentPeriod.QUARTERLY]: 139.9, [PaymentPeriod.ANNUAL]: 499.9 },
      [PlanType.PRO]: { [PaymentPeriod.MONTHLY]: 99.9, [PaymentPeriod.QUARTERLY]: 279.9, [PaymentPeriod.ANNUAL]: 999.9 },
      [PlanType.PREMIUM]: { [PaymentPeriod.MONTHLY]: 199.9, [PaymentPeriod.QUARTERLY]: 549.9, [PaymentPeriod.ANNUAL]: 1999.9 },
    };
    return prices[selectedPlan][selectedPeriod];
  };

  if (subscriptionConfirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center text-white">
          <Wrench className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Cadastro concluído!</h2>
          <p className="text-gray-300 mb-4">Seu pagamento foi confirmado e sua conta está ativa.</p>
          <p className="text-gray-400">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <form onSubmit={personalForm.handleSubmit(onPersonalSubmit)} className="space-y-4">
            <div className="bg-black-dark rounded-lg p-4 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <User size={18} className="text-red-main" /> Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome completo" placeholder="Seu nome" error={personalForm.formState.errors.name?.message} {...personalForm.register('name')} />
                <Input label="Email" type="email" placeholder="seu@email.com" error={personalForm.formState.errors.email?.message} {...personalForm.register('email')} />
                <Input label="Senha" type="password" placeholder="******" error={personalForm.formState.errors.password?.message} {...personalForm.register('password')} />
                <Input label="Confirmar senha" type="password" placeholder="******" error={personalForm.formState.errors.confirmPassword?.message} {...personalForm.register('confirmPassword')} />
              </div>
            </div>
            <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
              Próximo <ArrowRight size={18} />
            </button>
          </form>
        );

      case 'company':
        return (
          <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
            <div className="bg-black-dark rounded-lg p-4 space-y-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Building2 size={18} className="text-red-main" /> Dados da Empresa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome da empresa" placeholder="Ex: Tech Solutions" error={companyForm.formState.errors.nomeEmpresa?.message} {...companyForm.register('nomeEmpresa')} />
                <Input label="CNPJ" placeholder="00.000.000/0001-00" error={companyForm.formState.errors.cnpj?.message} {...companyForm.register('cnpj')} />
                <Input label="Endereço" placeholder="Av. Paulista, 1000" error={companyForm.formState.errors.endereco?.message} {...companyForm.register('endereco')} />
                <Input label="Cidade" placeholder="São Paulo" error={companyForm.formState.errors.cidade?.message} {...companyForm.register('cidade')} />
                <Input label="Estado" placeholder="SP" maxLength={2} error={companyForm.formState.errors.estado?.message} {...companyForm.register('estado')} />
                <Input label="Telefone comercial" placeholder="(11) 99999-9999" error={companyForm.formState.errors.telefoneComercial?.message} {...companyForm.register('telefoneComercial')} />

                {/* Campo select para segmento de atuação */}
                <div className="md:col-span-2">
                  <label className="block text-gray-300 font-semibold mb-2">Segmento de atuação</label>
                  <select
                    className="input-field"
                    value={companyForm.watch('segmentoAtuacao')}
                    onChange={handleSegmentChange}
                    onBlur={() => companyForm.trigger('segmentoAtuacao')}
                  >
                    <option value="">Selecione o segmento</option>
                    {businessSegments.map((seg) => (
                      <option key={seg.code} value={seg.label}>
                        {seg.label}
                      </option>
                    ))}
                  </select>
                  {companyForm.formState.errors.segmentoAtuacao && (
                    <p className="text-red-main text-sm mt-1">{companyForm.formState.errors.segmentoAtuacao.message}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setCurrentStep('personal')} className="flex-1 btn-secondary flex items-center justify-center gap-2">
                <ArrowLeft size={18} /> Voltar
              </button>
              <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
                Próximo <ArrowRight size={18} />
              </button>
            </div>
          </form>
        );

      case 'plan':
        return (
          <div>
            <PlanSelection
              selectedPlan={selectedPlan}
              selectedPeriod={selectedPeriod}
              selectedMethod={selectedMethod}
              onPlanChange={setSelectedPlan}
              onPeriodChange={setSelectedPeriod}
              onMethodChange={setSelectedMethod}
              onNext={handleProceedToPayment}
            />
            <button type="button" onClick={() => setCurrentStep('company')} className="w-full mt-4 btn-secondary flex items-center justify-center gap-2">
              <ArrowLeft size={18} /> Voltar
            </button>
            {isLoading && <p className="text-gray-400 text-center mt-4">Criando sua conta...</p>}
            {error && <p className="text-red-main text-center mt-2">{error}</p>}
          </div>
        );

      case 'payment':
        return (
          <div>
            <PaymentSimulation
              planType={selectedPlan}
              paymentPeriod={selectedPeriod}
              paymentMethod={selectedMethod}
              amount={getAmount()}
              subscriptionId={subscriptionId || undefined}
              onConfirm={handlePaymentConfirm}
              onBack={() => setCurrentStep('plan')}
            />
            {error && <div className="text-red-main text-sm mt-2">{error}</div>}
            {isLoading && <p className="text-gray-400 text-center mt-4">Confirmando pagamento...</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex">
      <SlideSection />
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-black-dark via-gray-dark to-black-main">
        <div className="w-full max-w-3xl animate-slide-up">
          <div className="text-center mb-8">
            <Wrench className="w-12 h-12 text-red-main mx-auto mb-3" />
            <h1 className="text-3xl font-bold text-white">Criar conta</h1>
            <p className="text-gray-400">
              {currentStep === 'personal' && 'Dados pessoais'}
              {currentStep === 'company' && 'Dados da empresa'}
              {currentStep === 'plan' && 'Escolha o plano'}
              {currentStep === 'payment' && 'Pagamento'}
            </p>
            <div className="flex justify-center mt-4 gap-2">
              <div className={`w-3 h-3 rounded-full ${currentStep === 'personal' ? 'bg-red-main' : 'bg-gray-600'}`} />
              <div className={`w-3 h-3 rounded-full ${currentStep === 'company' ? 'bg-red-main' : 'bg-gray-600'}`} />
              <div className={`w-3 h-3 rounded-full ${currentStep === 'plan' ? 'bg-red-main' : 'bg-gray-600'}`} />
              <div className={`w-3 h-3 rounded-full ${currentStep === 'payment' ? 'bg-red-main' : 'bg-gray-600'}`} />
            </div>
          </div>
          <div className="bg-black-main/50 rounded-xl border border-gray-700 p-6">{renderStep()}</div>
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Já tem conta? <Link to="/login" className="text-red-main font-semibold hover:text-red-dark">Faça login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};