"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UploadIcon, Loader2, MicIcon, ImageIcon, UserIcon, PlayIcon, PauseIcon, DownloadIcon, StopCircle, HomeIcon, CreditCardIcon, XIcon, CheckIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MenuIcon } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// Update the type definition
type CustomMediaRecorder = MediaRecorder & { intervalId?: NodeJS.Timeout };

export default function Home() {
  const [activeTab, setActiveTab] = useState("TTS")
  const [text, setText] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [voiceCategories, setVoiceCategories] = useState<Array<{
    _id: string;
    category: string;
    voices: Array<{ name: string; free: boolean }>;
  }>>([])

  useEffect(() => {
    fetchVoiceCategories()
  }, [])

  const fetchVoiceCategories = async () => {
    try {
      const response = await fetch('/api/voice-categories')
      const data = await response.json()
      
      if (response.ok) {
        setVoiceCategories(data)
      } else {
        // Handle error silently or update state to show error message
      }
    } catch (error) {
      // Handle error silently or update state to show error message
    }
  }

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

  const handleGenerate = async () => {
    console.log("handleGenerate called");
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = activeTab === "TTS" ? "/api/tts" : activeTab === "Talking Image" ? "/api/talking-image" : "/api/clone-voice";
      const formData = new FormData();
      formData.append("text", text);
      formData.append("voice", selectedVoice);
      
      // Determine the language based on the selected category
      const language = selectedCategory.toLowerCase() === "hindi" ? "hi" : "en";
      formData.append("language", language);

      if (audioFile) {
        formData.append("audio_file", audioFile);
      }

      // Calculate credits needed based on the length of the text
      const creditsNeeded = text.length; // 1 credit per character
      console.log(`Credits needed: ${creditsNeeded}`);

      // Fetch current credits
      const creditsResponse = await fetch('/api/user/credits');
      const creditsData = await creditsResponse.json();
      console.log('Current credits data:', creditsData);

      // Check credits based on the active tab
      if (activeTab === "TTS") {
        // Check if TTS credits are available
        if (creditsData['credits']['Text to Speech Pro'] >= creditsNeeded) {
          console.log('Using TTS credits');
          // Deduct from TTS credits
          await fetch('/api/user/update-credits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ creditsUsed: creditsNeeded, creditType: 'Text to Speech Pro' }),
          });
        } else if (creditsData['credits']['common'] >= creditsNeeded) {
          console.log('Using common credits');
          // Deduct from common credits if TTS credits are not sufficient
          await fetch('/api/user/update-credits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ creditsUsed: creditsNeeded }),
          });
        } else {
          console.error("Not enough credits for TTS. Please purchase more credits to continue.");
          throw new Error("Not enough credits for TTS. Please purchase more credits to continue.");
        }
      } else if (activeTab === "Talking Image") {
        // Assuming 1 credit per 10 seconds for Talking Image
        const audioDuration = await getAudioDuration(audioFile);
        const creditsNeededForImage = Math.ceil(audioDuration / 10); // 1 credit per 10 seconds

        if (creditsData['credits']['common'] >= creditsNeededForImage) {
          console.log('Using common credits for Talking Image');
          // Deduct from common credits
          await fetch('/api/user/update-credits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ creditsUsed: creditsNeededForImage }),
          });
        } else {
          console.error("Not enough credits for Talking Image. Please purchase more credits to continue.");
          throw new Error("Not enough credits for Talking Image. Please purchase more credits to continue.");
        }
      } else if (activeTab === "Clone voice") {
        // Assuming Clone Voice uses Voice Cloning Pro credits
        if (creditsData['credits']['Voice Cloning Pro'] >= creditsNeeded) {
          console.log('Using Voice Cloning Pro credits');
          // Deduct from Voice Cloning Pro credits
          await fetch('/api/user/update-credits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ creditsUsed: creditsNeeded, creditType: 'Voice Cloning Pro' }),
          });
        } else if (creditsData['credits']['common'] >= creditsNeeded) {
          console.log('Using common credits for Clone Voice');
          // Deduct from common credits if Voice Cloning Pro credits are not sufficient
          await fetch('/api/user/update-credits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ creditsUsed: creditsNeeded }),
          });
        } else {
          console.error("Not enough credits for Clone Voice. Please purchase more credits to continue.");
          throw new Error("Not enough credits for Clone Voice. Please purchase more credits to continue.");
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log('Audio generation result:', result);

      if (response.ok && result.audioData) {
        setGeneratedAudio(result.audioData);
      } else {
        console.error(result.error || "Failed to generate audio");
        throw new Error(result.error || "Failed to generate audio");
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAudioFile(file)
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleDownload = () => {
    if (generatedAudio) {
      const link = document.createElement('a')
      link.href = generatedAudio
      link.download = 'generated_audio.mp3'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

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
        setAudioFile(new File([audioBlob], "recorded_audio.wav", { type: 'audio/wav' }))
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
    const queryParams = `product=${encodeURIComponent(product)}&price=${price}`;
    
    // No need to add credits parameter for Voice Cloning Pro
    // as it will be handled the same as Text-to-Speech Pro
    
    router.push(`/checkout?${queryParams}`);
  }

  const handleImageUpload = () => {
    imageInputRef.current?.click()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
    }
  }

  const handleGenerateTalkingImage = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      if (imageFile) {
        formData.append("image", imageFile)
      }
      if (audioFile) {
        formData.append("audio", audioFile)
      }

      // Get audio duration
      const audioDuration = await getAudioDuration(audioFile)
      
      // Calculate credits needed: 1 credit per 10 seconds, rounded up
      const creditsNeeded = Math.ceil(audioDuration / 10)

      // Check if the user has enough credits
      const creditsResponse = await fetch('/api/user/credits')
      const creditsData = await creditsResponse.json()
      
      if (creditsData.credits < creditsNeeded) {
        throw new Error("Not enough credits. Please purchase more credits to continue.")
      }

      const response = await fetch("/api/talking-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.videoData) {
        setGeneratedVideo(result.videoData)
        
        // Deduct credits
        const updateCreditsResponse = await fetch('/api/user/update-credits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ creditsUsed: creditsNeeded }),
        })
        
        if (!updateCreditsResponse.ok) {
          console.error("Failed to update credits")
        }
      } else {
        throw new Error(result.error || "Failed to generate talking image video")
      }
    } catch (error) {
      console.error("Error generating talking image video:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to get audio duration
  const getAudioDuration = (file: File | null): Promise<number> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No audio file provided"))
        return
      }

      const audio = new Audio()
      audio.onloadedmetadata = () => {
        resolve(audio.duration)
      }
      audio.onerror = () => {
        reject(new Error("Error loading audio file"))
      }
      audio.src = URL.createObjectURL(file)
    })
  }

  useEffect(() => {
   // console.log('voiceCategories updated:', voiceCategories)
  }, [voiceCategories])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/home" className="flex items-center">
              <Image src="/logo.png" alt="Mitra Logo" width={150} height={75} className="h-10 w-auto" />
            </Link>
            <nav className="hidden md:flex space-x-1">
              <Link href="/about">
                <Button variant="ghost" className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200">
                  About
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200">
                  Contact
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-200">
                  Pricing
                </Button>
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <Button variant="outline" onClick={handleLogout} className="text-indigo-600 border-indigo-600 hover:bg-indigo-50">Logout</Button>
              ) : (
                <>
                  <Link href="/login"><Button variant="ghost" className="text-indigo-600 hover:bg-indigo-50">Login</Button></Link>
                  <Link href="/signup"><Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white">Sign Up</Button></Link>
                </>
              )}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-2">
              <Link href="/about"><Button variant="ghost" className="w-full justify-start hover:bg-indigo-50">About</Button></Link>
              <Link href="/contact"><Button variant="ghost" className="w-full justify-start hover:bg-indigo-50">Contact</Button></Link>
              <Link href="/pricing"><Button variant="ghost" className="w-full justify-start hover:bg-indigo-50">Pricing</Button></Link>
              <Link href="/privacy-policy"><Button variant="ghost" className="w-full justify-start hover:bg-indigo-50">Privacy Policy</Button></Link>
              <Link href="/disclaimer"><Button variant="ghost" className="w-full justify-start hover:bg-indigo-50">Terms & Conditions</Button></Link>
              <Link href="/refund-policy"><Button variant="ghost" className="w-full justify-start hover:bg-indigo-50">Refund Policy</Button></Link>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow max-w-5xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8 space-y-12 mb-20">
        <Card className="backdrop-blur-md bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-indigo-800">Voice Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-indigo-100 p-1 rounded-lg">
                <TabsTrigger value="TTS" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 rounded-md transition-all">
                  <MicIcon className="w-4 h-4 mr-2" />
                  TTS
                </TabsTrigger>
                <TabsTrigger 
                  value="Talking Image" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 rounded-md transition-all"
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                    }
                  }}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Talking Image
                </TabsTrigger>
                <TabsTrigger 
                  value="Clone voice" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 rounded-md transition-all"
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                    }
                  }}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Clone voice
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="TTS">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Select voice</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="select-category" className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          id="select-category"
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          <option value="">Select a category</option>
                          {voiceCategories.map((group) => (
                            <option key={group._id} value={group.category}>
                              {group.category}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedCategory && (
                        <div>
                          <label htmlFor="select-voice" className="block text-sm font-medium text-gray-700 mb-1">
                            Voice
                          </label>
                          <select
                            id="select-voice"
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                          >
                            <option value="">Select a voice</option>
                            {voiceCategories.find(group => group.category === selectedCategory)?.voices.map((voice, index) => (
                              <option key={index} value={voice.name} disabled={!isLoggedIn && !voice.free}>
                                {voice.name} {!isLoggedIn && !voice.free ? '(Pro)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="Type your text here..."
                    className="min-h-[200px] resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value.slice(0, characterLimit))}
                    maxLength={characterLimit}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {isLoggedIn ? null : "Login for 5000 character limit"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {text.length} / {characterLimit}
                    </span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="Talking Image">
                {isLoggedIn ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Upload Image and Audio</h2>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={imageInputRef}
                            onChange={handleImageChange}
                          />
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={handleImageUpload}
                          >
                            <UploadIcon className="h-4 w-4 mr-2" />
                            {imageFile ? "Change image" : "Upload image"}
                          </Button>
                          <Input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                          />
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={handleFileUpload}
                          >
                            <UploadIcon className="h-4 w-4 mr-2" />
                            {audioFile ? "Change audio" : "Upload audio"}
                          </Button>
                        </div>
                        
                        {imageFile && (
                          <div className="bg-gray-100 p-4 rounded-md">
                            <p className="text-sm font-medium mb-2">Selected Image:</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{imageFile.name}</span>
                              <Button variant="ghost" size="sm" onClick={() => setImageFile(null)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {audioFile && (
                          <div className="bg-gray-100 p-4 rounded-md">
                            <p className="text-sm font-medium mb-2">Selected Audio:</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{audioFile.name}</span>
                              <Button variant="ghost" size="sm" onClick={() => setAudioFile(null)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-yellow-100 p-4 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Please do not use long paragraphs. Using long paragraphs may degrade the quality of voice. For longer text generation, use multiple paragraphs of 25 to 30 words each.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-md text-center">
                    <p className="text-lg font-semibold mb-2">Pro Feature</p>
                    <p className="text-gray-600 mb-4">Please log in to access the Talking Image feature.</p>
                    <Link href="/login">
                      <Button variant="default">Log In</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="Clone voice">
                {isLoggedIn ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Upload or Record your voice</h2>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                          />
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={handleFileUpload}
                          >
                            <UploadIcon className="h-4 w-4 mr-2" />
                            {audioFile ? "Change file" : "Upload audio"}
                          </Button>
                          <Button
                            variant={isRecording ? "destructive" : "default"}
                            onClick={isRecording ? stopRecording : startRecording}
                            className="flex-1"
                          >
                            {isRecording ? (
                              <>
                                <StopCircle className="h-4 w-4 mr-2" />
                                Stop Recording
                              </>
                            ) : (
                              <>
                                <MicIcon className="h-4 w-4 mr-2" />
                                Start Recording
                              </>
                            )}
                          </Button>
                        </div>
                        
                        {audioFile && !isRecording && (
                          <div className="bg-gray-100 p-4 rounded-md">
                            <p className="text-sm font-medium mb-2">Selected Audio:</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{audioFile.name}</span>
                              <Button variant="ghost" size="sm" onClick={() => setAudioFile(null)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                        
                        {isRecording && (
                          <div className="bg-red-100 p-4 rounded-md flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse" />
                              <span className="text-sm font-medium text-red-700">Recording in progress...</span>
                            </div>
                            <span className="text-sm text-red-700">{recordingDuration}s</span>
                          </div>
                        )}
                        
                        {recordedAudio && !isRecording && (
                          <div className="bg-gray-100 p-4 rounded-md">
                            <p className="text-sm font-medium mb-2">Recorded Audio:</p>
                            <audio src={URL.createObjectURL(recordedAudio)} controls className="w-full" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Textarea
                      placeholder="Type your text here..."
                      className="min-h-[200px] resize-none"
                      value={text}
                      onChange={(e) => setText(e.target.value.slice(0, characterLimit))}
                      maxLength={characterLimit}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {isLoggedIn ? null : "Login for 5000 character limit"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {text.length} / {characterLimit}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-md text-center">
                    <p className="text-lg font-semibold mb-2">Pro Feature</p>
                    <p className="text-gray-600 mb-4">Please log in to access the Clone voice feature.</p>
                    <Link href="/login">
                      <Button variant="default">Log In</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
              size="lg" 
              onClick={activeTab === "Talking Image" ? handleGenerateTalkingImage : handleGenerate} 
              disabled={isLoading || (activeTab === "Clone voice" && !audioFile) || (activeTab === "Talking Image" && (!imageFile || !audioFile))}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate"
              )}
            </Button>
          </CardFooter>
        </Card>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            Error: {error}
          </div>
        )}

        {generatedAudio && (
          <Card className="backdrop-blur-md bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-indigo-800">Generated Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-6 w-6" />
                    ) : (
                      <PlayIcon className="h-6 w-6" />
                    )}
                  </Button>
                  <div className="space-y-1">
                    <h3 className="text-lg font-medium text-indigo-800">Your Generated Audio</h3>
                    <p className="text-sm text-gray-500">Click to play/pause</p>
                  </div>
                </div>
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-indigo-600 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
              <audio
                ref={audioRef}
                src={generatedAudio}
                className="hidden"
                onEnded={() => setIsPlaying(false)}
              />
            </CardContent>
          </Card>
        )}

        {generatedVideo && (
          <Card className="backdrop-blur-md bg-white/90 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-indigo-800">Generated Talking Image Video</CardTitle>
            </CardHeader>
            <CardContent>
              <video controls className="w-full">
                <source src={generatedVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </CardContent>
          </Card>
        )}

        {/* Pricing Plans */}
        <Card className="backdrop-blur-md bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-indigo-800">Our Pro Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "TellerGen Text to Speech Pro", price: 499, features: ["100+ Premium and Celebrity voices", "High quality audio download", "Ultra realistic voices", "1 million characters"] },
                { title: "TellerGen Voice Cloning Pro", price: 499, features: ["Clone up to 1 million characters", "High quality audio", "Ultra realistic cloned voice"] },
                { title: "TellerGen Talking Image Pro", price: 799, features: ["Up to 600 minutes of video generation", "High quality image to video", "Realistic head movement", "Perfect lip syncing"] },
                { title: "TellerGen Combo Pack", price: 999, features: ["Text to Speech Pro", "Talking Image Pro", "Voice Cloning Pro", "Best value for all features"] }
              ].map((plan, index) => (
                <div key={index} className="bg-indigo-50 p-6 rounded-lg shadow-md space-y-4">
                  <h3 className="text-xl font-semibold text-indigo-800">{plan.title}</h3>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-700">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {plan.title === "TellerGen Talking Image Pro" ? (
                    <Button 
                      className="w-full bg-gray-400 text-white mt-4 cursor-not-allowed"
                      disabled
                    >
                      Only Available in Combo Pack
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleBuyPro(plan.title.toLowerCase().replace(/\s+/g, '_'), plan.price)} 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                    >
                      {plan.title === "TellerGen Combo Pack" ? "Buy Combo" : "Buy Pro"} (Rs {plan.price})
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Why Choose TellerGen Card */}
        <Card className="backdrop-blur-md bg-white/90 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-indigo-800">Why Choose TellerGen?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-gray-700">
              TellerGen offers cutting-edge AI-powered text-to-speech voice cloning and talking image generation services. Here's why you should choose TellerGen:
            </p>
            <ul className="space-y-4">
              {[
                { title: "Realistic Voice Cloning", description: "Advanced AI creates lifelike voice replicas for personalized experiences." },
                { title: "Dynamic Talking Images", description: "Bring your images to life with innovative technology." },
                { title: "User-Friendly Interface", description: "Intuitive platform accessible to users of all skill levels." },
                { title: "Versatile Applications", description: "Enhance projects with engaging multimedia elements." },
                { title: "High-Quality Output", description: "Prioritizing natural-sounding voices and realistic animations." }
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center mr-4 mt-1">
                    <CheckIcon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-indigo-800">{item.title}</h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Privacy Policy and Disclaimer links */}
        <div className="text-center space-y-2 mt-8">
          <p className="text-sm text-gray-600">
            By using our services, you agree to our{' '}
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            ,{' '}
            <Link href="/disclaimer" className="text-blue-600 hover:underline">
              Terms & Conditions
            </Link>
            , and{' '}
            <Link href="/refund-policy" className="text-blue-600 hover:underline">
              Refund Policy
            </Link>
            .
          </p>
        </div>
      </main>

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
  )
}