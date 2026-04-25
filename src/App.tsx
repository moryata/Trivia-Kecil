import { useState } from 'react';
import { Personality } from './types';
import PersonalitySelector from './components/PersonalitySelector';
import TriviaGame from './components/TriviaGame';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [selectedPersonality, setSelectedPersonality] = useState<Personality | null>(null);

  const resetGame = () => {
    setSelectedPersonality(null);
  };

  return (
    <div className="min-h-screen bg-brand-indigo flex flex-col font-sans text-slate-900 overflow-hidden relative">
      {/* Background Decorative Shapes */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -z-0"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl -z-0"></div>

      <header className="relative z-10 flex justify-between items-center p-6 bg-brand-indigo-dark/50 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl font-black text-indigo-900">P</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Pintar AI</h1>
        </div>
        {selectedPersonality && (
          <div className="flex gap-4">
            <div className="bg-white/20 px-4 py-2 rounded-full border border-white/30 flex items-center gap-2">
              <span className="text-brand-yellow font-bold text-sm tracking-wide">TRIVIA INDO</span>
            </div>
          </div>
        )}
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!selectedPersonality ? (
            <motion.div
              key="selector"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full h-full flex items-center justify-center"
            >
              <PersonalitySelector onSelect={setSelectedPersonality} />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full h-full"
            >
              <TriviaGame 
                personality={selectedPersonality} 
                onReset={resetGame} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 bg-slate-900/40 p-4 backdrop-blur-lg border-t border-white/10 text-center">
        <span className="text-white/60 font-bold text-xs uppercase tracking-widest">
          Gemini AI • Pengetahuan Nusantara • © 2026
        </span>
      </footer>
    </div>
  );
}
