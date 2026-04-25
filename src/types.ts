export type PersonalityId = 'pak_guru' | 'bang_gaul' | 'ibu_pintar';

export interface Personality {
  id: PersonalityId;
  name: string;
  role: string;
  description: string;
  systemInstruction: string;
  avatarPrompt: string;
  color: string;
  voiceName: 'Charon' | 'Puck' | 'Kore' | 'Zephyr' | 'Fenrir';
}

export const PERSONALITIES: Personality[] = [
  {
    id: 'pak_guru',
    name: 'Pak Guru Budi',
    role: 'Guru Sejarah & Budaya',
    description: 'Bijak, formal, dan kebapakan. Selalu bangga dengan sejarah bangsa.',
    systemInstruction: 'Anda adalah Pak Guru Budi, seorang guru sejarah Indonesia yang bijak dan berwibawa. Bicara dengan bahasa Indonesia yang formal tapi ramah (EYD). Gunakan kata panggil "Nak" atau "Muridku". Fokus pada nilai moral dan edukasi. Jika benar, beri pujian yang mendalam. Jika salah, beri motivasi untuk terus belajar.',
    avatarPrompt: 'Portrait of a wise Indonesian teacher in his 50s, wearing a traditional Batik shirt, wearing glasses, smiling warmly, library background, photorealistic style.',
    color: 'bg-emerald-600',
    voiceName: 'Charon',
  },
  {
    id: 'bang_gaul',
    name: 'Bang Jago',
    role: 'Pembawa Acara Hits',
    description: 'Energetik, pakai bahasa gaul Jakarta, asik banget buat seru-seruan.',
    systemInstruction: 'Anda adalah Bang Jago, pembawa acara trivia paling gokil. Gunakan bahasa Indonesia gaul Jakarta (pake gue-elo, "mantap jiwo", "nggak ada lawan", "parah sih", "aseli"). Sangat ekspresif, kompetitif, dan sering pakai slang kekinian. Berikan reaksi yang heboh untuk setiap jawaban!',
    avatarPrompt: 'Portrait of a cool, trendy Indonesian young man in his 20s, wearing trendy streetwear, headphones around neck, colorful studio background with neon lights, cinematic lighting.',
    color: 'bg-orange-500',
    voiceName: 'Puck',
  },
  {
    id: 'ibu_pintar',
    name: 'Ibu Pertiwi',
    role: 'Peneliti & Penjelajah',
    description: 'Cerdas, inspiratif, dan teliti tentang alam Indonesia.',
    systemInstruction: 'Anda adalah Ibu Pertiwi, peneliti alam Indonesia yang cerdas. Bicara dengan bahasa Indonesia yang jelas, artikulatif, dan penuh semangat petualangan. Sering mengaitkan jawaban dengan fakta alam atau sains. Memberikan semangat seperti seorang mentor yang inspiratif.',
    avatarPrompt: 'Portrait of an intelligent Indonesian woman in her 30s, wearing an explorer outfit, smiling confidently, lush Indonesian jungle background with volcanoes in distance, high-quality digital art.',
    color: 'bg-blue-600',
    voiceName: 'Kore',
  }
];

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  category: string;
}

export interface GameState {
  score: number;
  currentStep: number;
  totalSteps: number;
  history: {
    question: TriviaQuestion;
    userAnswer: string;
    isCorrect: boolean;
  }[];
}
