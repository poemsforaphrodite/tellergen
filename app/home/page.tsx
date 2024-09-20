"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BellIcon, MenuIcon, UploadIcon, Loader2, MicIcon, ImageIcon, UserIcon, PlayIcon, PauseIcon, DownloadIcon, StopCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

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

  const voiceCategories = [
    { category: "Celebrities", voices: [{ name: "Morgan Freeman", free: true }, { name: "Scarlett Johansson", free: false }, { name: "David Attenborough", free: false }, { name: "Tom Hanks", free: false }, { name: "Emma Watson", free: false }] },
    { category: "Characters", voices: [{ name: "Batman", free: true }, { name: "Spongebob", free: false }, { name: "Darth Vader", free: false }, { name: "Homer Simpson", free: false }, { name: "Mario", free: false }] },
    { category: "Streamers", voices: [{ name: "PewDiePie", free: true }, { name: "Pokimane", free: false }, { name: "Ninja", free: false }, { name: "Shroud", free: false }, { name: "Tfue", free: false }] },
    { category: "Politicians", voices: [{ name: "Barack Obama", free: true }, { name: "Donald Trump", free: false }, { name: "Angela Merkel", free: false }, { name: "Justin Trudeau", free: false }, { name: "Emmanuel Macron", free: false }] },
    { category: "Athletes", voices: [{ name: "Serena Williams", free: true }, { name: "Michael Jordan", free: false }, { name: "Lionel Messi", free: false }, { name: "LeBron James", free: false }, { name: "Usain Bolt", free: false }] },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="lg:hidden">
              <MenuIcon className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Mitra</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <BellIcon className="h-6 w-6" />
            </Button>
            {isLoggedIn ? (
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default">Buy Pro</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="backdrop-blur-sm bg-white/80">
          <CardHeader>
            <CardTitle className="text-2xl">Voice Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="TTS" className="flex items-center gap-2">
                  <MicIcon className="w-4 h-4" />
                  TTS
                </TabsTrigger>
                <TabsTrigger value="Talking Image" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Talking Image
                </TabsTrigger>
                <TabsTrigger 
                  value="Clone voice" 
                  className="flex items-center gap-2"
                  disabled={!isLoggedIn}
                >
                  <UserIcon className="w-4 h-4" />
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
                <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg">
                  <p className="text-2xl font-bold text-gray-400">Coming Soon</p>
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
              className="w-full" 
              size="lg" 
              onClick={handleGenerate} 
              disabled={isLoading || (activeTab === "Clone voice" && !audioFile)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          <Card className="mt-6 backdrop-blur-sm bg-white/80">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Generated Audio</CardTitle>
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
                    <h3 className="text-lg font-medium">Your Generated Audio</h3>
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
                    className="h-2 bg-primary rounded-full transition-all duration-300 ease-in-out" 
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
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between">
          <Link href="/home">
            <Button variant="ghost">Clone</Button>
          </Link>
          <Link href="/credit">
            <Button variant="ghost">Credit</Button>
          </Link>
          <Link href="/account">
            <Button variant="ghost">Account</Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}