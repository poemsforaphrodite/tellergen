"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BellIcon, MenuIcon, UploadIcon, Loader2, MicIcon, ImageIcon, UserIcon, PlayIcon, PauseIcon, DownloadIcon, StopCircle, HomeIcon, CreditCardIcon, XIcon, CheckIcon, ShieldIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

  const voiceCategories = [
    { category: "Celebrities", voices: [
      { name: "Morgan Freeman", free: true },
      { name: "Scarlett Johansson", free: false },
      { name: "David Attenborough", free: false },
      { name: "Tom Hanks", free: false },
      { name: "Emma Watson", free: false }
    ]},
    { category: "Characters", voices: [
      { name: "Batman", free: true },
      { name: "Spongebob", free: false },
      { name: "Darth Vader", free: false },
      { name: "Homer Simpson", free: false },
      { name: "Mario", free: false }
    ]},
    { category: "Streamers", voices: [
      { name: "PewDiePie", free: true },
      { name: "Pokimane", free: false },
      { name: "Ninja", free: false },
      { name: "Shroud", free: false },
      { name: "Tfue", free: false }
    ]},
    { category: "Politicians", voices: [
      { name: "Barack Obama", free: true },
      { name: "Donald Trump", free: false },
      { name: "Angela Merkel", free: false },
      { name: "Justin Trudeau", free: false },
      { name: "Emmanuel Macron", free: false }
    ]},
    { category: "Athletes", voices: [
      { name: "Serena Williams", free: true },
      { name: "Michael Jordan", free: false },
      { name: "Lionel Messi", free: false },
      { name: "LeBron James", free: false },
      { name: "Usain Bolt", free: false }
    ]},
  ]

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
      console.error('Failed to check login status:', error)
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
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Error during logout:', error)
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
    setIsLoading(true)
    setError(null)
    try {
      const endpoint = activeTab === "TTS" ? "/api/tts" : "/api/clone-voice"
      const formData = new FormData()
      formData.append("text", text)
      formData.append("voice", selectedVoice)
      if (audioFile) {
        formData.append("audio_file", audioFile)
      }

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.audioData) {
        setGeneratedAudio(result.audioData)
      } else {
        throw new Error(result.error || "Failed to generate audio")
      }
    } catch (error) {
      console.error("Error generating audio:", error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

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
    router.push(`/checkout?product=${product}&price=${price}`)
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

      const response = await fetch("/api/talking-image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok && result.videoData) {
        setGeneratedVideo(result.videoData)
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
              <Button variant="ghost" size="icon" className="relative">
                <BellIcon className="h-5 w-5 text-gray-600" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </Button>
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
              <Link href="/admin">
                <Button variant="ghost" size="icon">
                  <ShieldIcon className="h-5 w-5 text-gray-600" />
                </Button>
              </Link>
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
                <TabsTrigger value="Talking Image" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 rounded-md transition-all">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Talking Image
                </TabsTrigger>
                <TabsTrigger 
                  value="Clone voice" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 rounded-md transition-all"
                  disabled={!isLoggedIn}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Clone voice {!isLoggedIn && '(Pro)'}
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
                          {voiceCategories.map((group, index) => (
                            <option key={index} value={group.category}>
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
                </div>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "TellerGen Text to Speech Pro", price: 499, features: ["100+ Premium and Celebrity voices", "High quality audio download", "Ultra realistic voices", "1 million characters"] },
                { title: "TellerGen Voice Cloning Pro", price: 999, features: ["Clone up to 1 million characters", "High quality audio", "Ultra realistic cloned voice", "Fast processing"] },
                { title: "TellerGen Talking Image Pro", price: 799, features: ["Up to 1000 minutes of video generation", "High quality image to video", "Realistic head movement", "Perfect lip syncing"] }
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
                  <Button onClick={() => handleBuyPro(plan.title.toLowerCase().replace(/\s+/g, '_'), plan.price)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
                    Buy Pro (rs {plan.price})
                  </Button>
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