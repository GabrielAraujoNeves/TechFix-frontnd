import React from 'react';
import { Wrench, Shield, Clock, Award, Users, Target } from 'lucide-react';

export const SlideSection: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Proteção total dos seus dados com criptografia avançada'
    },
    {
      icon: Clock,
      title: 'Agilidade',
      description: 'Atendimento rápido e eficiente para sua empresa'
    },
    {
      icon: Award,
      title: 'Qualidade',
      description: 'Serviços certificados com excelência garantida'
    },
    {
      icon: Users,
      title: 'Suporte',
      description: 'Equipe especializada pronta para ajudar 24/7'
    },
    {
      icon: Target,
      title: 'Resultados',
      description: 'Metas alcançadas com nossa plataforma'
    }
  ];

  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-red-main to-red-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-12 w-full">
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center space-x-3 mb-6">
            <Wrench className="w-12 h-12 text-white" />
            <h2 className="text-4xl font-bold text-white">TechFix Pro</h2>
          </div>
          <p className="text-white/90 text-lg leading-relaxed">
            A plataforma completa para gestão de serviços técnicos. 
            Soluções inteligentes para empresas que buscam excelência.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex items-start space-x-4 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">500+</div>
            <div className="text-white/80 text-sm">Clientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">98%</div>
            <div className="text-white/80 text-sm">Satisfação</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-white/80 text-sm">Suporte</div>
          </div>
        </div>
      </div>
    </div>
  );
};