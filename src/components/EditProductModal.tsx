import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Input } from './Input';
import type { Product } from '../types/auth.types';

const editProductSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  modelo: z.string().min(2, 'Modelo deve ter no mínimo 2 caracteres'),
  marca: z.string().min(2, 'Marca deve ter no mínimo 2 caracteres'),
  precoAtacado: z.number().min(0, 'Preço deve ser maior que 0'),
  precoConsertoPeca: z.number().min(0, 'Preço deve ser maior que 0'),
  quantidadeEstoque: z.number().min(0, 'Quantidade deve ser maior ou igual a 0'),
  estoqueMinimo: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a 0'),
});

type EditProductFormData = z.infer<typeof editProductSchema>;

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EditProductFormData) => Promise<void>;
  product: Product | null;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  product 
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
  });

  React.useEffect(() => {
    if (product && isOpen) {
      reset({
        nome: product.nome,
        modelo: product.modelo,
        marca: product.marca,
        precoAtacado: product.precoAtacado,
        precoConsertoPeca: product.precoConsertoPeca,
        quantidadeEstoque: product.quantidadeEstoque,
        estoqueMinimo: product.estoqueMinimo,
      });
    }
  }, [product, isOpen, reset]);

  const handleFormSubmit = async (data: EditProductFormData) => {
    await onSubmit(data);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-black-main rounded-xl border border-gray-700 w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Editar Produto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <Input
            label="Nome"
            type="text"
            placeholder="Ex: Galaxy S24"
            error={errors.nome?.message}
            {...register('nome')}
          />
          
          <Input
            label="Modelo"
            type="text"
            placeholder="Ex: SM-S921B"
            error={errors.modelo?.message}
            {...register('modelo')}
          />
          
          <Input
            label="Marca"
            type="text"
            placeholder="Ex: Samsung"
            error={errors.marca?.message}
            {...register('marca')}
          />
          
          <Input
            label="Preço Atacado (R$)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.precoAtacado?.message}
            {...register('precoAtacado', { valueAsNumber: true })}
          />
          
          <Input
            label="Preço Conserto (R$)"
            type="number"
            step="0.01"
            placeholder="0.00"
            error={errors.precoConsertoPeca?.message}
            {...register('precoConsertoPeca', { valueAsNumber: true })}
          />
          
          <Input
            label="Quantidade em Estoque"
            type="number"
            placeholder="0"
            error={errors.quantidadeEstoque?.message}
            {...register('quantidadeEstoque', { valueAsNumber: true })}
          />
          
          <Input
            label="Estoque Mínimo"
            type="number"
            placeholder="10"
            error={errors.estoqueMinimo?.message}
            {...register('estoqueMinimo', { valueAsNumber: true })}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};