import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Personality, TriviaQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateTriviaQuestions(personality: Personality, count: number = 5): Promise<TriviaQuestion[]> {
  const prompt = `Generate ${count} trivia questions about Indonesia (History, Geography, Culture, Food, Pop Culture, etc.). 
  The questions should be appropriate for ${personality.name} whose role is ${personality.role}.
  Output must be in Indonesian.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: personality.systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { 
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 4 options"
            },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "Small fact about why it is correct" },
            category: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation", "category"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Failed to parse trivia questions:", error);
    return [];
  }
}

export async function getHostReaction(
  personality: Personality, 
  context: "correct" | "wrong" | "intro" | "conclusion", 
  details?: { question?: string, score?: number, total?: number }
): Promise<string> {
  const prompt = `Berikan pesan ${context} kepada pemain.
  ${details?.question ? `Konteks: Pertanyaannya tadi adalah "${details.question}".` : ""}
  ${details?.score !== undefined ? `Skor saat ini: ${details.score}/${details.total}.` : ""}
  
  PANDUAN KARAKTER:
  - Nama: ${personality.name}
  - Gaya: ${personality.systemInstruction}
  
  TUGAS:
  Bicaralah sepenuhnya sebagai ${personality.name}. 
  Gunakan emosi yang sesuai (senang jika benar, menyemangati jika salah). 
  Maksimal 2 kalimat pendek. Jangan gunakan kode atau format aneh.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: personality.systemInstruction,
    }
  });

  return response.text || "Tetap semangat!";
}

export async function textToSpeech(text: string, personality: Personality): Promise<{ data: string, mimeType: string } | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Bicara sebagai ${personality.name}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: personality.voiceName },
          },
        },
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (part?.inlineData?.data) {
      const mimeType = part.inlineData.mimeType || (part.inlineData as any).mime_type || "audio/pcm";
      return { data: part.inlineData.data, mimeType };
    }
    
    console.warn("[TTS Service] No audio data found");
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

let audioContext: AudioContext | null = null;

export async function playAudio(data: string, mimeType: string) {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    const binaryString = atob(data.replace(/\s/g, ""));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Try standard decoding first
    try {
      const audioBuffer = await audioContext.decodeAudioData(bytes.buffer.slice(0));
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      return source;
    } catch (decodeError) {
      console.log("[Audio Service] Standard decoding failed, falling back to PCM", decodeError);
      // Fallback to raw PCM (Linear16)
      return playPCMAudio(data, mimeType);
    }
  } catch (err) {
    console.error("[Audio Service] Playback setup error:", err);
    return null;
  }
}

async function playPCMAudio(base64Data: string, mimeType: string) {
  try {
    if (!audioContext) return null;
    
    const binaryString = atob(base64Data.replace(/\s/g, ""));
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Ensure buffer length is even for Int16Array
    const bufferToUse = bytes.length % 2 === 0 ? bytes.buffer : bytes.buffer.slice(0, bytes.length - 1);
    const int16Buffer = new Int16Array(bufferToUse);
    const float32Buffer = new Float32Array(int16Buffer.length);
    for (let i = 0; i < int16Buffer.length; i++) {
      float32Buffer[i] = int16Buffer[i] / 32768.0;
    }

    let sampleRate = 24000;
    const rateMatch = mimeType.match(/rate=(\d+)/);
    if (rateMatch) sampleRate = parseInt(rateMatch[1], 10);

    const audioBuffer = audioContext.createBuffer(1, float32Buffer.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32Buffer);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    return source;
  } catch (e) {
    console.error("[Audio Service] PCM recovery failed:", e);
    return null;
  }
}

function base64ToBlob(base64: string, mime: string) {
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}
