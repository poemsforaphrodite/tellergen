"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { UploadIcon, Loader2, MicIcon, ImageIcon, UserIcon, PlayIcon, PauseIcon, DownloadIcon, StopCircle, HomeIcon, CreditCardIcon, XIcon, CheckIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuIcon } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Book, Gamepad2, Mic, VideoIcon as Movie, Sparkles, Settings2 } from 'lucide-react'
import { Avatar } from "@/components/ui/avatar"
import { MainContent } from "@/components/MainContent"
import { Sidebar } from "@/components/Sidebar"
import { VoiceProvider } from "@/contexts/VoiceContext"

// Update the type definition
type CustomMediaRecorder = MediaRecorder & { intervalId?: NodeJS.Timeout };

// Update the type definition for voice categories
type VoiceCategory = {
  _id: string;
  category: string;
  voices: Array<{ name: string; file_url: string; is_free: boolean }>;
};

// Update the Hindi default text constant
const defaultHindiText = "यह डिफ़ॉल्ट हिंदी पाठ है। वॉइस जनरेट करने के लिए शब्दों को अधिक से अधिक पैराग्राफ में रखें। बेहतर परिणाम के लिए एक पैराग्राफ में केवल बीस से पच्चीस शब्द ही रखें अन्यथा वॉइस की गुणवत्ता प्रभावित हो सकती है।";

// Add this utility function before the Home component
const getAudioDuration = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audioElement = new Audio(URL.createObjectURL(file));
    audioElement.onloadedmetadata = () => {
      resolve(audioElement.duration);
    };
    audioElement.onerror = (error) => {
      reject(new Error('Error loading audio file'));
    };
  });
};

export default function Home() {
  const [activeTab, setActiveTab] = useState("TTS")
  const [text, setText] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [progress, setProgress] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedVoice, setSelectedVoice] = useState("")
  const [characterLimit, setCharacterLimit] = useState(1000)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<CustomMediaRecorder | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [voiceCategories, setVoiceCategories] = useState<VoiceCategory[]>([]);
  const [userTTSCredits, setUserTTSCredits] = useState<{
    isSubscribed: boolean;
    subscriptionEndDate: string | null;
    isLocked: boolean;
  }>({
    isSubscribed: false,
    subscriptionEndDate: null,
    isLocked: false
  });
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [cloneVoiceAudioFile, setCloneVoiceAudioFile] = useState<File | null>(null);

  useEffect(() => {
    console.log('Fetching voice categories...');
    fetchVoiceCategories();
    fetchUserCredits();
  }, []);

  const fetchVoiceCategories = async () => {
    try {
      const response = await fetch('/api/voice-categories');
      const data = await response.json();
      
      console.log('Fetched voice categories:', data); // Add this line
      
      if (response.ok) {
        setVoiceCategories(data);
      } else {
        console.error('Error fetching voice categories:', data.error); // Add this line
      }
    } catch (error) {
      console.error('Error fetching voice categories:', error); // Add this line
    }
  };

  const fetchUserCredits = async () => {
    try {
      const response = await fetch('/api/user/credits');
      const data = await response.json();
      if (response.ok) {
        setUserTTSCredits(data.credits['Text to Speech Pro']);
      } else {
        console.error('Error fetching user credits:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user credits:', error);
    }
  };

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/auth/status')
      const data = await response.json()
      setIsLoggedIn(data.isLoggedIn)
      setCharacterLimit(data.isLoggedIn ? 5000 : 1000)
    } catch (error) {
      // Handle error silently or update state to show error message
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        setIsLoggedIn(false)
        setCharacterLimit(1000)
        // Optionally, you can redirect the user or show a success message
      } else {
        // Handle logout failure silently or update state to show error message
      }
    } catch (error) {
      // Handle error silently or update state to show error message
    }
  }

  useEffect(() => {
    setSelectedVoice("")
  }, [selectedCategory])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      const updateProgress = () => {
        const value = (audio.currentTime / audio.duration) * 100
        setProgress(value)
      }
      audio.addEventListener('timeupdate', updateProgress)
      return () => audio.removeEventListener('timeupdate', updateProgress)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "Voice Cloning") {
      setText(""); // Clear text when switching to Voice Cloning tab
    } else if (selectedCategory.toLowerCase() === "hindi") {
      setText(defaultHindiText);
    } else {
      setText(""); // Clear the text for other categories
    }
  }, [activeTab, selectedCategory]);

  const handleGenerate = async () => {
    setError(null);
    setIsLoading(true);
    setGeneratedAudio(null);

    try {
      let currentAudioFile = null;
      if (activeTab === "Voice Cloning") {
        currentAudioFile = cloneVoiceAudioFile;
      }

      if (!text && activeTab === "TTS") {
        throw new Error("Please enter some text");
      }

      if (activeTab === "Voice Cloning" && !currentAudioFile) {
        throw new Error("Please upload an audio file");
      }

      const formData = new FormData();
      
      if (currentAudioFile) {
        formData.append("audio", currentAudioFile);
      }
      
      if (text) {
        formData.append("text", text);
      }

      if (selectedVoice) {
        formData.append("voice", selectedVoice);
      }

      const endpoint = activeTab === "Voice Cloning"
        ? "/api/voice-clone"
        : "/api/text-to-speech";

      if (activeTab === "Voice Cloning") {
        const audioDuration = await getAudioDuration(currentAudioFile!);
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const data = await response.json();
      setGeneratedAudio(data.audio_url);
      
      // Refresh user credits after successful generation
      fetchUserCredits();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => {
          console.error("Error playing audio:", e);
          setError("Failed to play audio. Please try again.");
        });
      }
      setIsPlaying(!isPlaying);
    }
  }

  const handleDownload = async () => {
    if (generatedAudio) {
      try {
        const response = await fetch(generatedAudio);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'generated_audio.mp3';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        setError('Failed to download the audio file.');
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream) as CustomMediaRecorder
      mediaRecorderRef.current = mediaRecorder
      
      const audioChunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        setRecordedAudio(audioBlob)
        setCloneVoiceAudioFile(new File([audioBlob], "recorded_audio.wav", { type: 'audio/wav' }))
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingDuration(0)
      const intervalId = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
      mediaRecorderRef.current.intervalId = intervalId
    } catch (error) {
      console.error("Error accessing microphone:", error)
      setError("Failed to access microphone. Please check your permissions.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      clearInterval(mediaRecorderRef.current.intervalId)
      setIsRecording(false)
    }
  }

  const handleBuyPro = (product: string, price: number) => {
    const queryParams = `product=${encodeURIComponent(product)}&price=${price}&subscription=true`;
    router.push(`/checkout?${queryParams}`);
  }

  useEffect(() => {
    console.log('Voice categories updated:', voiceCategories);
  }, [voiceCategories]);

  return (
    <VoiceProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
        <div className="flex flex-1">
          <div className="hidden md:block border-r shadow-sm">
            <Sidebar />
          </div>
          
          <div className="flex-1">
            <MainContent />
          </div>
        </div>

        <footer className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-lg rounded-full px-8 py-4">
          <div className="flex space-x-12">
            <Link href="/home">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </Button>
            </Link>
            <Link href="/credit">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Credit
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                <UserIcon className="h-5 w-5 mr-2" />
                Account
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </VoiceProvider>
  )
}
