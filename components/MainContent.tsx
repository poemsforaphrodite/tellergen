"use client"

import { Book, Gamepad2, Mic, VideoIcon as Movie, Sparkles, Settings2, PlayIcon, Square as StopIcon, XIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useRef, useEffect } from 'react'
import { Avatar } from "@/components/ui/avatar"
import { useVoice } from "@/contexts/VoiceContext"

type Voice = {
  name: string;
  file_url: string;
  is_free: boolean;
};

type VoiceCategory = {
  category: string;
  voices: Voice[];
};

const examples = [
  { icon: Book, label: "Tell a story" },
  { icon: Sparkles, label: "Listen to a joke" },
  { icon: Mic, label: "Narrate an ad" },
  { icon: Movie, label: "Play dramatic movie dialogue" },
  { icon: Gamepad2, label: "Hear from a video game character" },
]

export function MainContent() {
  const [text, setText] = useState('')
  const { selectedVoice, setSelectedVoice } = useVoice()
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const maxLength = 10000
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [voiceCategories, setVoiceCategories] = useState<VoiceCategory[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // State for voice cloning form
  const [cloneText, setCloneText] = useState('')
  const [cloneLanguage, setCloneLanguage] = useState<string>('en')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [cloneLoading, setCloneLoading] = useState<boolean>(false)
  const [cloneError, setCloneError] = useState<string | null>(null)
  const [clonedAudioUrl, setClonedAudioUrl] = useState<string | null>(null)

  useEffect(() => {
    const fetchVoices = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/voice-categories')
        if (!response.ok) {
          throw new Error(`Error fetching voices: ${response.statusText}`)
        }
        const data: VoiceCategory[] = await response.json()
        setVoiceCategories(data)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Failed to fetch voices')
      } finally {
        setLoading(false)
      }
    }

    fetchVoices()
  }, [])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value
    if (newText.length <= maxLength) {
      setText(newText)
    }
  }

  const handleVoiceSelect = (voice: Voice) => {
    setSelectedVoice(voice);
    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsModalOpen(false);
  }

  const handleTryVoice = async (voice: Voice) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    try {
      audioRef.current.src = voice.file_url;
      await audioRef.current.play();
      setIsPlaying(true);

      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
    }
  }

  // Handle voice cloning form submission
  const handleCloneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCloneLoading(true)
    setCloneError(null)
    setClonedAudioUrl(null)

    if (!cloneText || !selectedVoice || !cloneLanguage || !audioFile) {
      setCloneError('Please provide all required fields.')
      setCloneLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('text', cloneText)
      formData.append('voice', selectedVoice.name)
      formData.append('language', cloneLanguage)
      formData.append('audio_file', audioFile)

      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clone voice.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setClonedAudioUrl(url)
    } catch (err: any) {
      console.error(err)
      setCloneError(err.message || 'An error occurred during voice cloning.')
    } finally {
      setCloneLoading(false)
    }
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="h-full relative">
        <div className="p-8">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Speech Synthesis</h1>
              <p className="text-muted-foreground">
                Unleash the power of our cutting-edge technology to generate realistic, captivating speech in a wide range of
                languages.
              </p>
            </div>
            <Tabs defaultValue="simple">
              <TabsList>
                <TabsTrigger value="simple">Simple</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Tabs Section */}
          <div className="mb-4">
            <Tabs defaultValue="generate">
              <TabsList>
                <TabsTrigger value="generate">Generate</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Speech Synthesis Section */}
          <div className="relative bg-white rounded-lg border shadow-sm p-4">
            <Textarea
              className="min-h-[150px] p-4 resize-none text-lg border-0 focus-visible:ring-0 rounded-lg"
              placeholder="Start typing here or paste any text you want to turn into lifelike speech."
              value={text}
              onChange={handleTextChange}
            />
            <div className="border-t p-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  className="h-8 gap-2"
                  onClick={() => {
                    if (selectedVoice) {
                      handleTryVoice(selectedVoice);
                    } else {
                      setIsModalOpen(true);
                    }
                  }}
                >
                  <Avatar className="w-5 h-5 bg-pink-500">
                    <span className="text-[10px]">{selectedVoice?.name?.[0] || 'R'}</span>
                  </Avatar>
                  <span className="text-sm">{selectedVoice?.name || 'Select Voice'}</span>
                  {selectedVoice && (
                    isPlaying ? <StopIcon className="w-4 h-4 ml-2" /> : <PlayIcon className="w-4 h-4 ml-2" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  <Settings2 className="w-4 h-4" />
                  <span className="ml-2">Settings</span>
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {text.length} / {maxLength}
                </span>
                <Button className="h-8" disabled={!text.length}>
                  Generate speech
                </Button>
              </div>
            </div>
          </div>


          {/* Voice Selection Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-xl shadow-lg w-11/12 max-w-md p-6 overflow-y-auto max-h-[80vh] transition-transform transform scale-100 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Select Voice</h2>
                  <button onClick={() => setIsModalOpen(false)}>
                    <XIcon className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
                  </button>
                </div>
                
                {loading && <p className="text-center">Loading voices...</p>}
                {error && <p className="text-center text-red-500">{error}</p>}
                {!loading && !error && voiceCategories.length === 0 && (
                  <p className="text-center">No voices available.</p>
                )}
                
                {!loading && !error && voiceCategories.map((category) => (
                  <div key={category.category} className="mb-6">
                    <h3 className="text-lg font-medium mb-2">{category.category}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {category.voices.map((voice) => (
                        <div 
                          key={voice.name} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handleVoiceSelect(voice)}
                        >
                          <div className="flex items-center">
                            <Avatar className="w-10 h-10 bg-blue-500 mr-4">
                              <span className="text-lg">{voice.name[0]}</span>
                            </Avatar>
                            <div>
                              <p className="font-medium">{voice.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {voice.is_free ? 'Free' : 'Premium'}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTryVoice(voice)
                            }}
                          >
                            {isPlaying && selectedVoice?.name === voice.name ? 'Stop' : 'Try'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Examples Section */}
          <div className="mt-8">
            <p className="text-center text-muted-foreground mb-4">Or try out an example to get started!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {examples.map((example) => (
                <Button key={example.label} variant="outline" className="h-auto py-2 px-4">
                  <example.icon className="w-4 h-4 mr-2" />
                  {example.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Background */}
        <div className="absolute inset-x-0 bottom-0 h-64 pointer-events-none">
          <svg
            className="absolute bottom-0 w-full h-full"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              fill="url(#gradient)"
            />
            <defs>
              <linearGradient id="gradient" x1="720" y1="0" x2="720" y2="320" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" stopOpacity="0.1" />
                <stop offset="1" stopColor="#3B82F6" stopOpacity="0.05" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </main>
  )
}
