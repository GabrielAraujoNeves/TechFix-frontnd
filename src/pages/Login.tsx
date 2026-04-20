import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Wrench, AlertCircle, CheckCircle } from 'lucide-react';
import { SlideSection } from '../components/SlideSection';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login, error: authError, registerSuccess, clearRegisterSuccess } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState(false);

  useEffect(() => {
    if (registerSuccess) {
      setShowSuccess(true);
      clearRegisterSuccess();
      // Esconder a mensagem após 5 segundos
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [registerSuccess, clearRegisterSuccess]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Slide Section - Lado esquerdo */}
      <SlideSection />

      {/* Form Section - Lado direito */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-black-dark via-gray-dark to-black-main">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="lg:hidden inline-flex items-center justify-center w-20 h-20 bg-red-main/10 rounded-full mb-4 border border-red-main/20">
              <Wrench className="w-10 h-10 text-red-main" />
            </div>
            <h1 className="text-3xl font-bold text-white">Bem-vindo de volta</h1>
            <p className="text-gray-400 mt-2">Faça login para acessar sua conta</p>
          </div>

          {/* Mensagem de sucesso do registro */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 text-green-400 rounded-lg flex items-center gap-3 animate-slide-up">
              <CheckCircle size={20} />
              <div>
                <p className="font-semibold">Cadastro realizado com sucesso!</p>
                <p className="text-sm">Agora faça login com suas credenciais.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              {...register('email')}
            />
            
            <Input
              label="Senha"
              type="password"
              placeholder="••••••"
              icon={<Lock size={18} />}
              error={errors.password?.message}
              {...register('password')}
            />

            {(error || authError) && (
              <div className="mb-6 p-3 bg-red-main/10 border border-red-main/50 text-red-main rounded-lg text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error || authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-red-main font-semibold hover:text-red-dark transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>

          <div className="mt-6 p-3 bg-black-dark/50 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              Demo: gabriel@gmail.com / 92773379
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};