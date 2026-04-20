import React, { useState } from 'react';
import { Smartphone, X, Copy, CheckCircle } from 'lucide-react';

export const MobileQRCode: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const ip = '192.168.0.18'; // Seu IP
  const url = `http://${ip}:3000`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Botão flutuante que abre o modal */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 z-50 bg-red-main text-white p-3 rounded-full shadow-lg hover:bg-red-dark transition-all duration-200"
      >
        <Smartphone size={24} />
      </button>

      {/* Modal com instruções */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-black-main rounded-xl border border-gray-700 max-w-sm w-full p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Acessar no Celular</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center mb-6">
              {/* QR Code gerado via API online (não precisa de biblioteca) */}
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`}
                  alt="QR Code"
                  width={180}
                  height={180}
                />
              </div>
              <p className="text-gray-400 text-sm mb-2">
                Escaneie o QR Code com seu celular
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <code className="bg-black-dark px-3 py-2 rounded text-sm text-white break-all flex-1">
                  {url}
                </code>
                <button
                  onClick={copyToClipboard}
                  className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  title="Copiar URL"
                >
                  {copied ? <CheckCircle size={18} className="text-green-400" /> : <Copy size={18} className="text-white" />}
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-400 space-y-3">
              <div className="flex items-start gap-2">
                <span>📱</span>
                <span>Conecte o celular na mesma rede Wi-Fi</span>
              </div>
              <div className="flex items-start gap-2">
                <span>📷</span>
                <span>Abra a câmera e aponte para o QR Code</span>
              </div>
              <div className="flex items-start gap-2">
                <span>🌐</span>
                <span>O site abrirá automaticamente no celular</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 bg-red-main text-white py-2 rounded-lg hover:bg-red-dark transition-colors font-semibold"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};