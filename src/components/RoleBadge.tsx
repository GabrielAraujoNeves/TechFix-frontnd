import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {  User, Crown } from 'lucide-react';

export const RoleBadge: React.FC = () => {
  const { user, isAdmin} = useAuth();

  return (
    <div className="bg-black-main/50 backdrop-blur-sm rounded-xl border border-gray-700 p-4">
      <div className="flex items-center space-x-3">
        {isAdmin ? (
          <>
            <div className="p-2 bg-red-main/10 rounded-lg">
              <Crown className="w-6 h-6 text-red-main" />
            </div>
            <div>
              <p className="text-white font-semibold">Modo Administrador</p>
              <p className="text-red-main text-sm">Você tem acesso total ao sistema</p>
            </div>
          </>
        ) : (
          <>
            <div className="p-2 bg-blue-600/10 rounded-lg">
              <User className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Modo Visualização</p>
              <p className="text-blue-400 text-sm">Você pode visualizar os produtos</p>
            </div>
          </>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Email:</span>
          <span className="text-white">{user?.email}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-gray-400">Role:</span>
          <span className={isAdmin ? 'text-red-main font-semibold' : 'text-blue-400'}>
            {isAdmin ? 'ADMINISTRADOR' : 'USUÁRIO COMUM'}
          </span>
        </div>
      </div>
    </div>
  );
};