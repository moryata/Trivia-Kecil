import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Personality, TriviaQuestion, GameState } from '../types';
import { generateTriviaQuestions, getHostReaction, textToSpeech, playAudio } from '../services/gemini';
import HostAvatar from './HostAvatar';
import { CheckCircle2, XCircle, Loader2, Trophy, RotateCcw, BookOpen, Volume2, VolumeX } from 'lucide-react';

interface Props {
  personality: Personality;
  onReset: () => void;
}

export default function TriviaGame({ personality, onReset }: Props) {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    currentStep: 0,
    totalSteps: 5,
    history: [],
  });
  const [loading, setLoading] = useState(true);
  const [hostMessage, setHostMessage] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const currentAudioRef = useRef<HTMLAudioElement | AudioBufferSourceNode | null>(null);

  const speak = async (text: string) => {
    if (isMuted) return;
    try {
      const result = await textToSpeech(text, personality);
      if (result) {
        // Interrupt previous audio
        if (currentAudioRef.current) {
          if ('pause' in currentAudioRef.current) {
            currentAudioRef.current.pause();
          } else if ('stop' in currentAudioRef.current) {
            try {
              currentAudioRef.current.stop();
            } catch (e) {
              // Ignore errors if already stopped or not started
            }
          }
        }

        // Play new audio
        const audio = await playAudio(result.data, result.mimeType);
        if (audio) {
          currentAudioRef.current = audio;
        }
      }
    } catch (err) {
      console.error("[TriviaGame] Speech failed:", err);
    }
  };

  useEffect(() => {
    async function initGame() {
      const qs = await generateTriviaQuestions(personality);
      setQuestions(qs);
      const intro = await getHostReaction(personality, "intro");
      setHostMessage(intro);
      speak(intro);
      setLoading(false);
    }
    initGame();
  }, [personality]);

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer || isAnswering) return;
    
    const currentQ = questions[gameState.currentStep];
    const isCorrect = answer === currentQ.correctAnswer;
    
    setSelectedAnswer(answer);
    setIsAnswering(true);
    setFeedback(isCorrect);

    const reaction = await getHostReaction(personality, isCorrect ? "correct" : "wrong", {
      question: currentQ.question,
      score: gameState.score + (isCorrect ? 1 : 0),
      total: gameState.totalSteps
    });
    setHostMessage(reaction);
    speak(reaction);

    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        history: [...prev.history, { question: currentQ, userAnswer: answer, isCorrect }]
      }));
      setIsAnswering(false);
    }, 2000);
  };

  const nextQuestion = () => {
    setGameState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    setSelectedAnswer(null);
    setFeedback(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] space-y-4">
        <div className="w-20 h-20 border-8 border-white/20 border-t-brand-yellow rounded-full animate-spin"></div>
        <p className="text-white font-black text-xl animate-pulse uppercase tracking-widest italic">Menyiapkan Tantangan...</p>
      </div>
    );
  }

  const isGameOver = gameState.currentStep >= questions.length;

  if (isGameOver) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-12">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[40px] shadow-2xl w-full text-center space-y-8 border-b-[12px] border-indigo-200"
        >
          <div className="inline-flex p-6 rounded-full bg-brand-yellow text-indigo-900 shadow-xl">
            <Trophy className="w-16 h-16" />
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-slate-900 uppercase">Misi Selesai!</h2>
            <p className="text-indigo-600 font-black tracking-widest uppercase">Skor Pencapaianmu</p>
            <div className="text-8xl font-black text-slate-900 flex items-center justify-center gap-4">
              {gameState.score} 
              <span className="text-3xl text-slate-300 font-normal">/ {questions.length}</span>
            </div>
          </div>
          
          <button 
            onClick={onReset}
            className="w-full py-6 bg-brand-indigo text-white rounded-3xl font-black text-xl flex items-center justify-center space-x-3 hover:bg-brand-indigo-dark transition-all border-b-8 border-indigo-800 shadow-xl active:translate-y-1 active:border-b-4"
          >
            <RotateCcw className="w-6 h-6" />
            <span>MAIN LAGI</span>
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = questions[gameState.currentStep];

  return (
    <div className="w-full max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-full items-start">
      {/* Host Column */}
      <div className="lg:col-span-4 flex flex-col gap-8">
        <div className="flex justify-end">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/30 hover:bg-white/30 transition-all"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
        <HostAvatar 
          personality={personality} 
          message={hostMessage} 
          isCorrect={feedback} 
          onReplay={() => speak(hostMessage)}
        />
      </div>

      {/* Trivia Column */}
      <div className="lg:col-span-8 flex flex-col gap-6 h-full">
        <motion.div 
          key={gameState.currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="bg-white rounded-[40px] p-10 shadow-2xl border-b-[8px] border-indigo-200 flex flex-col min-h-[600px]"
        >
          <div className="flex justify-between items-center mb-10">
            <div className="space-y-1">
              <span className="text-indigo-600 font-black text-xs tracking-[0.3em] uppercase">Pertanyaan {String(gameState.currentStep + 1).padStart(2, '0')}/{String(questions.length).padStart(2, '0')}</span>
              <div className="h-2 w-48 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(gameState.currentStep / questions.length) * 100}%` }}
                  className="h-full bg-brand-indigo"
                />
              </div>
            </div>
            <div className="px-4 py-2 bg-indigo-50 rounded-full border-2 border-indigo-100 flex items-center gap-2">
              <div className="w-3 h-3 bg-brand-indigo rounded-full animate-pulse"></div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{currentQuestion.category}</span>
            </div>
          </div>
          
          <h2 className="text-4xl font-black text-slate-800 leading-tight mb-12 min-h-[120px]">
            {currentQuestion.question}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            {currentQuestion.options.map((option, idx) => {
              const letter = ["A", "B", "C", "D"][idx];
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correctAnswer;
              const showCorrect = selectedAnswer && isCorrect;
              const showWrong = isSelected && !isCorrect;

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={!!selectedAnswer}
                  className={`
                    group relative p-6 rounded-2xl border-2 transition-all flex items-center gap-4 text-left border-b-8
                    ${!selectedAnswer ? 'bg-slate-50 border-slate-200 hover:bg-brand-yellow hover:border-brand-yellow active:translate-y-1 active:border-b-4' : ''}
                    ${showCorrect ? 'bg-emerald-50 border-brand-emerald text-emerald-800 border-b-8 shadow-none translate-y-1 border-b-emerald-700' : ''}
                    ${showWrong ? 'bg-rose-50 border-brand-rose text-rose-800 border-b-8 shadow-none translate-y-1 border-b-rose-700' : ''}
                    ${selectedAnswer && !isSelected && !isCorrect ? 'opacity-30 border-slate-100' : ''}
                  `}
                >
                  <span className={`
                    w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-lg
                    ${!selectedAnswer ? 'bg-indigo-100 text-brand-indigo group-hover:bg-indigo-900 group-hover:text-white' : ''}
                    ${showCorrect ? 'bg-brand-emerald text-white' : ''}
                    ${showWrong ? 'bg-brand-rose text-white' : ''}
                    ${selectedAnswer && !isSelected && !isCorrect ? 'bg-slate-200 text-slate-400' : ''}
                  `}>
                    {letter}
                  </span>
                  <span className="text-xl font-bold">{option}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedAnswer && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-8 pt-6 border-t-2 border-slate-100 space-y-6"
              >
                <div className="flex gap-4 items-start bg-indigo-50 p-6 rounded-3xl border-2 border-indigo-100 italic">
                  <div className="p-2 bg-brand-indigo rounded-full text-white">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <p className="text-indigo-900 font-bold leading-relaxed">
                    "{currentQuestion.explanation}"
                  </p>
                </div>
                {!isAnswering && (
                  <button 
                    onClick={nextQuestion}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg uppercase tracking-[0.2em] hover:bg-brand-yellow hover:text-slate-900 transition-all border-b-8 border-slate-800 active:translate-y-1 active:border-b-4"
                  >
                    Lanjutkan Misi
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
