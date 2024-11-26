import { createContext, useContext, useState, ReactNode } from 'react';

type Voice = {
  name: string;
  file_url: string;
  is_free: boolean;
};

type VoiceCategory = {
  _id: string;
  category: string;
  voices: Voice[];
};

type VoiceContextType = {
  selectedVoice: Voice | null;
  setSelectedVoice: (voice: Voice | null) => void;
  voiceCategories: VoiceCategory[];
  setVoiceCategories: (categories: VoiceCategory[]) => void;
};

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [voiceCategories, setVoiceCategories] = useState<VoiceCategory[]>([]);

  return (
    <VoiceContext.Provider value={{ selectedVoice, setSelectedVoice, voiceCategories, setVoiceCategories }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}