// src/hooks/useSubscription.ts
import { useEffect, useState } from 'react';
import { subscriptionService } from '../services/api';
import type { Subscription } from '../types/auth.types';

const CHECK_INTERVAL = 2 * 60 * 60 * 1000; // 2 horas

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    try {
      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar assinatura');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    const interval = setInterval(fetchSubscription, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const isActive = () => subscription?.status === 'ACTIVE';
  const getPlanType = () => subscription?.planType;
  const getUserLimit = (): number => {
    switch (subscription?.planType) {
      case 'BASIC': return 5;
      case 'PRO': return 15;
      case 'PREMIUM': return Infinity;
      default: return 0;
    }
  };
  const canAddUser = (currentUserCount: number) => {
    if (!isActive()) return false;
    return currentUserCount < getUserLimit();
  };

  return {
    subscription,
    loading,
    error,
    isActive,
    getPlanType,
    getUserLimit,
    canAddUser,
    refresh: fetchSubscription,
  };
};