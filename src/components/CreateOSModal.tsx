import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Package } from 'lucide-react';
import { Input } from './Input';
import { osService, productService } from '../services/api';
import type { Product } from '../types/auth.types';

const createOSSchema = z.object({
  clienteNome: z.string().min(3, 'Nome do cliente é obrigatório'),
  clienteTelefone: z.string().min(10, 'Telefone inválido'),
  clienteEmail: z.string().email('Email inválido'),
  modelo: z.string().min(2, 'Modelo é obrigatório'),
  marca: z.string().min(2, 'Marca é obrigatória'),
  problema: z.string().min(5, 'Descreva o problema'),
  observacoes: z.string().optional(),
  itens: z.array(z.object({
    produtoId: z.number().min(1, 'Selecione um produto'),
    quantidade: z.number().min(1, 'Quantidade mínima 1'),
  })).optional(),
});

type CreateOSFormData = z.infer<typeof createOSSchema>;

interface CreateOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOSModal: React.FC<CreateOSModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateOSFormData>({
    resolver: zodResolver(createOSSchema),
    defaultValues: {
      itens: [{ produtoId: 0, quantidade: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'itens'
  });

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const onSubmit = async (data: CreateOSFormData) => {
    setIsSubmitting(true);
    try {
      // Filtrar itens vazios
      const itens = data.itens?.filter(item => item.produtoId > 0) || [];
      await osService.createOS({ ...data, itens });
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar OS');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 overflow-y-auto">
      <div className="bg-black-main rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 flex justify-between items-center p-6 border-b border-gray-700 bg-black-main">
          <h2 className="text-xl font-bold text-white">Nova Ordem de Serviço</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Dados do Cliente */}
          <div className="bg-black-dark rounded-lg p-4 space-y-4">
            <h3 className="text-white font-semibold">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nome"
                placeholder="Nome do cliente"
                error={errors.clienteNome?.message}
                {...register('clienteNome')}
              />
              <Input
                label="Telefone"
                placeholder="(11) 99999-9999"
                error={errors.clienteTelefone?.message}
                {...register('clienteTelefone')}
              />
              <Input
                label="Email"
                type="email"
                placeholder="email@exemplo.com"
                error={errors.clienteEmail?.message}
                {...register('clienteEmail')}
              />
            </div>
          </div>

          {/* Dados do Equipamento */}
          <div className="bg-black-dark rounded-lg p-4 space-y-4">
            <h3 className="text-white font-semibold">Dados do Equipamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Marca"
                placeholder="Ex: Samsung, Apple, Dell"
                error={errors.marca?.message}
                {...register('marca')}
              />
              <Input
                label="Modelo"
                placeholder="Ex: Galaxy S24, iPhone 15"
                error={errors.modelo?.message}
                {...register('modelo')}
              />
              <div className="md:col-span-2">
                <label className="block text-gray-300 font-semibold mb-2">Problema relatado</label>
                <textarea
                  rows={3}
                  placeholder="Descreva o problema do equipamento..."
                  className="input-field"
                  {...register('problema')}
                />
                {errors.problema && <p className="text-red-main text-sm mt-1">{errors.problema.message}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-300 font-semibold mb-2">Observações (opcional)</label>
                <textarea
                  rows={2}
                  placeholder="Informações adicionais..."
                  className="input-field"
                  {...register('observacoes')}
                />
              </div>
            </div>
          </div>

          {/* Itens (Peças) */}
          <div className="bg-black-dark rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-semibold">Peças/Serviços</h3>
              <button
                type="button"
                onClick={() => append({ produtoId: 0, quantidade: 1 })}
                className="text-sm text-red-main hover:text-red-dark flex items-center gap-1"
              >
                <Plus size={14} /> Adicionar item
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-gray-300 text-sm mb-1">Produto</label>
                  <select
                    className="input-field"
                    {...register(`itens.${index}.produtoId`, { valueAsNumber: true })}
                  >
                    <option value={0}>Selecione um produto</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} - {p.marca} {p.modelo} (R$ {p.precoConsertoPeca.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="block text-gray-300 text-sm mb-1">Qtd</label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    {...register(`itens.${index}.quantidade`, { valueAsNumber: true })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-main hover:bg-red-main/10 rounded-lg mb-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {loadingProducts && <p className="text-gray-400 text-sm">Carregando produtos...</p>}
          </div>

          <div className="flex gap-3 pt-4 sticky bottom-0 bg-black-main pb-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="flex-1 btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Criando...' : 'Criar OS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};