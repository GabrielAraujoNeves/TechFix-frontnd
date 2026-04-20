import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Wrench, AlertCircle } from 'lucide-react';
import { SlideSection } from '../components/SlideSection';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const { register: registerUser, error: authError } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError('');
    
    try {
      await registerUser(data.name, data.email, data.password);
      // Após registro bem sucedido, redirecionar para login
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
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
            <h1 className="text-3xl font-bold text-white">Criar Conta</h1>
            <p className="text-gray-400 mt-2">Junte-se ao TechFix Pro</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Nome completo"
              type="text"
              placeholder="Seu nome"
              icon={<User size={18} />}
              error={errors.name?.message}
              {...register('name')}
            />
            
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
            
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="••••••"
              icon={<Lock size={18} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
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
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-red-main font-semibold hover:text-red-dark transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};