import { motion } from 'motion/react';
import { PERSONALITIES, Personality } from '../types';
import { User, Zap, BookOpen } from 'lucide-react';

interface Props {
  onSelect: (personality: Personality) => void;
}

export default function PersonalitySelector({ onSelect }: Props) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'pak_guru': return <BookOpen className="w-10 h-10" />;
      case 'bang_gaul': return <Zap className="w-10 h-10" />;
      case 'ibu_pintar': return <User className="w-10 h-10" />;
      default: return <User className="w-10 h-10" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-12 w-full max-w-6xl">
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black text-white tracking-tight sm:text-6xl uppercase">
          Siapa Teman Mainmu?
        </h2>
        <p className="text-xl text-indigo-100 font-medium max-w-xl mx-auto">
          Pilih pembawa acara dengan kepribadian unik untuk menemanimu belajar tentang Indonesia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
        {PERSONALITIES.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
            whileHover={{ y: -10, scale: 1.02 }}
            onClick={() => onSelect(p)}
            className="cursor-pointer group flex flex-col bg-white rounded-[40px] overflow-hidden shadow-2xl border-b-[12px] border-slate-200 hover:border-brand-yellow transition-all"
          >
            <div className={`h-48 ${p.color} flex items-center justify-center text-white relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="relative z-10 p-4 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/30 shadow-inner">
                {getIcon(p.id)}
              </div>
            </div>
            <div className="p-8 space-y-4 flex-1 flex flex-col">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900">{p.name}</h3>
                </div>
                <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">{p.role}</p>
              </div>
              <p className="text-slate-600 font-medium leading-relaxed flex-1">
                {p.description}
              </p>
              <div className="pt-4">
                <span className="inline-block w-full text-center py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest group-hover:bg-brand-yellow group-hover:text-slate-900 transition-colors">
                  Pilih Host
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
