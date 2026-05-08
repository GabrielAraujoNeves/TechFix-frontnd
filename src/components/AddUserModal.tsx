// src/components/AddUserModal.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Input } from './Input';

const addUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type AddUserFormData = z.infer<typeof addUserSchema>;

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddUserFormData) => Promise<void>;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddUserFormData>({
    resolver: zodResolver(addUserSchema),
  });

  const handleFormSubmit = async (data: AddUserFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-black-main rounded-xl border border-gray-700 w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Adicionar Usuário</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <Input label="Nome completo" type="text" placeholder="Nome do usuário" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="usuario@empresa.com" error={errors.email?.message} {...register('email')} />
          <Input label="Senha" type="password" placeholder="******" error={errors.password?.message} {...register('password')} />
          <Input label="Confirmar senha" type="password" placeholder="******" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancelar</button>
            <button type="submit" className="flex-1 btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Adicionando...' : 'Adicionar Usuário'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};