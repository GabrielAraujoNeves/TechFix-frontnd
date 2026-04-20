import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from './Input';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quantidade: number) => Promise<void>;
  title: string;
  action: 'add' | 'remove';
}

export const StockModal: React.FC<StockModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  action 
}) => {
  const [quantidade, setQuantidade] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    await onSubmit(quantidade);
    setIsLoading(false);
    onClose();
    setQuantidade(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-black-main rounded-xl border border-gray-700 w-full max-w-md animate-slide-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <Input
            label="Quantidade"
            type="number"
            min="1"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className={`flex-1 ${action === 'add' ? 'btn-primary' : 'bg-yellow-600 hover:bg-yellow-700'}`}
              disabled={isLoading}
            >
              {isLoading ? 'Processando...' : action === 'add' ? 'Adicionar' : 'Remover'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};