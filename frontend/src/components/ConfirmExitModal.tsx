interface ConfirmExitModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmExitModal({ isOpen, onConfirm, onCancel }: ConfirmExitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-600 rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-fade-in text-center">
        <div className="text-5xl mb-4">🚪</div>
        <h2 className="text-2xl font-black text-white mb-2">Deseja mesmo sair?</h2>
        <p className="text-slate-400 mb-8 font-medium">Todo o seu progresso financeiro deste ano será perdido e não poderá ser recuperado.</p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onCancel}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]"
          >
            Voltar para o Jogo
          </button>
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-slate-700 hover:bg-red-600 text-white font-bold rounded-xl transition-colors"
          >
            Sim, Desistir
          </button>
        </div>
      </div>
    </div>
  );
}