import { motion, AnimatePresence } from 'motion/react';
import { Personality } from '../types';
import { User, Zap, BookOpen, Volume2 } from 'lucide-react';

interface Props {
  personality: Personality;
  message: string;
  isCorrect?: boolean | null;
  onReplay?: () => void;
}

export default function HostAvatar({ personality, message, isCorrect, onReplay }: Props) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'pak_guru': return <BookOpen className="w-16 h-16" />;
      case 'bang_gaul': return <Zap className="w-16 h-16" />;
      case 'ibu_pintar': return <User className="w-16 h-16" />;
      default: return <User className="w-16 h-16" />;
    }
  };

  const statusBorder = isCorrect === true 
    ? 'border-brand-emerald' 
    : isCorrect === false 
      ? 'border-brand-rose' 
      : 'border-white';

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="relative">
        <motion.div 
          animate={isCorrect !== null ? { scale: [1, 1.05, 1], rotate: [0, -1, 1, 0] } : {}}
          className={`aspect-[4/5] rounded-[40px] shadow-2xl border-8 overflow-hidden relative ${statusBorder} ${personality.color} transition-colors`}
        >
          {/* Abstract Avatar Style */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-white/30 rounded-full blur-3xl opacity-50"></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="p-6 bg-white/20 backdrop-blur-xl rounded-full border-2 border-white/40 shadow-2xl text-white">
              {getIcon(personality.id)}
            </div>
          </div>

          {/* Voice Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i}
                animate={{ height: [8, 16, 8] }}
                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                className="w-1 bg-white/60 rounded-full"
              />
            ))}
          </div>
        </motion.div>
        
        {/* Personality Tag */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-brand-yellow px-6 py-2 rounded-full shadow-lg border-2 border-slate-900 whitespace-nowrap">
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900">
            Host: {personality.name}
          </span>
        </div>
      </div>

      {/* Speech Bubble */}
      <div className="bg-white p-6 rounded-3xl rounded-tl-none shadow-xl border-b-4 border-slate-200 relative group/bubble">
        <div className="absolute -top-3 left-0 w-6 h-6 bg-white rounded-bl-full shadow-[-4px_4px_0_0_#e2e8f0] hidden md:block"></div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={message}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex items-start justify-between gap-2"
          >
            <p className="text-lg font-bold italic leading-relaxed text-slate-700">
              "{message}"
            </p>
            {onReplay && (
              <button 
                onClick={onReplay}
                className="p-2 text-slate-300 hover:text-brand-indigo transition-colors flex-shrink-0"
                title="Putar Ulang"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
