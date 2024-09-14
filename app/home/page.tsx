"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BellIcon, MenuIcon, UploadIcon, Loader2, MicIcon, ImageIcon, UserIcon, PlayIcon, PauseIcon, DownloadIcon } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from 'next/link'

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
            <Link href="/credit">
              <Button variant="default">Buy Pro</Button>
            </Link>
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
                <TabsTrigger value="Clone voice" className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Clone voice
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="TTS">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Select voice</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                      {['Image', 'Mark', 'John', 'Sarah', 'Emma', 'Alex'].map((label, index) => (
                        <Button key={index} variant="outline" className="w-full h-12">
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="Type your text here..."
                    className="min-h-[200px] resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <span className="text-sm text-gray-500">{text.length} / 5000</span>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="Talking Image">
                <div className="flex items-center justify-center h-64 bg-gray-200 rounded-lg">
                  <p className="text-2xl font-bold text-gray-400">Coming Soon</p>
                </div>
              </TabsContent>
              
              <TabsContent value="Clone voice">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Upload your voice</h2>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <Button 
                        variant="outline" 
                        className="flex-grow"
                        onClick={handleFileUpload}
                      >
                        {audioFile ? audioFile.name : "Choose file"}
                      </Button>
                      <Button size="icon" onClick={handleFileUpload}>
                        <UploadIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Textarea
                    placeholder="Type your text here..."
                    className="min-h-[200px] resize-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <span className="text-sm text-gray-500">{text.length} / 5000</span>
                  </div>
                </div>
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
          <Link href="/history">
            <Button variant="ghost">History</Button>
          </Link>
          <Link href="/clone">
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