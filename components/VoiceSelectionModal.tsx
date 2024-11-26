"use client"

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useVoice } from "@/contexts/VoiceContext"

type Voice = {
  name: string;
  file_url: string;
  is_free: boolean;
};

type VoiceSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectVoice: (voice: Voice) => void;
};

const VoiceSelectionModal: React.FC<VoiceSelectionModalProps> = ({ isOpen, onClose, onSelectVoice }) => {
  const { voiceCategories } = useVoice();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVoices();
    }
  }, [isOpen]);

  const fetchVoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/voice-categories');
      const data = await response.json();
      if (response.ok) {
        const allVoices = data.flatMap((category: any) => category.voices);
        setVoices(allVoices);
      } else {
        setError(data.error || 'Failed to fetch voices');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a Voice</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {loading && <p>Loading voices...</p>}
          {error && <p className="text-red-500">{error}</p>}
          <div className="grid grid-cols-1 gap-4">
            {voices.map((voice) => (
              <Button 
                key={voice.name} 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => onSelectVoice(voice)}
              >
                <span>{voice.name}</span>
                <span className={voice.is_free ? "text-green-500" : "text-gray-500"}>
                  {voice.is_free ? 'Free' : 'Premium'}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceSelectionModal;