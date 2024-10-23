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

// Update the type definition
type CustomMediaRecorder = MediaRecorder & { intervalId?: NodeJS.Timeout };

// Update the type definition for voice categories
type VoiceCategory = {
  _id: string;
  category: string;
  voices: Array<{ name: string; file_url: string; is_free: boolean }>;
};

// Add this constant at the top of your component or in a separate constants file
const defaultHindiText = "यह डिफॉल्ट हिंदी पाठ है। वॉइस जेनरेट करने के लिए शब्दों को ज्यादा से ज्यादा पैराग्राफ में रखें। बेहतर परिणाम के लिए एक पैराग्राफ में केवल बीस से पच्चीस शब्द ही रखें अन्यथा वॉइस में खराबी आ सकती है।";

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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
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

  // **Added** separate state variables for audio files
  const [talkingImageAudioFile, setTalkingImageAudioFile] = useState<File | null>(null);
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
    if (activeTab === "Clone voice") {
      setText(""); // Clear text when switching to Clone voice tab
    } else if (selectedCategory.toLowerCase() === "hindi") {
      setText(defaultHindiText);
    } else {
      setText(""); // Clear the text for other categories
    }
  }, [activeTab, selectedCategory]);

  // **Modified** handleGenerate to accommodate separate audio files
  const handleGenerate = async () => {
    // Determine which audio file to use based on the active tab
    let currentAudioFile: File | null = null;
    if (activeTab === "Talking Image") {
      currentAudioFile = talkingImageAudioFile;
    } else if (activeTab === "Clone voice") {
      currentAudioFile = cloneVoiceAudioFile;
    } else {
      currentAudioFile = audioFile; // For TTS
    }

    if (!isLoggedIn) {
      setError("Please log in to use this feature.");
      return;
    }

    console.log("handleGenerate called");
    setIsLoading(true);
    setError(null);

    try {
      const endpoint =
        activeTab === "TTS"
          ? "/api/tts"
          : activeTab === "Talking Image"
          ? "/api/talking-image"
          : "/api/clone-voice";

      const formData = new FormData();
      formData.append("text", text);
      formData.append("voice", selectedVoice);

      // Determine the language based on the selected category
      const language = selectedCategory.toLowerCase() === "hindi" ? "hi" : "en";
      formData.append("language", language);

      if (currentAudioFile) {
        formData.append("audio_file", currentAudioFile);
      }

      let creditsNeeded = 0;

      if (activeTab === "TTS") {
        creditsNeeded = text.length; // 1 credit per character
      } else if (activeTab === "Talking Image") {
        const audioDuration = await getAudioDuration(currentAudioFile);
        creditsNeeded = Math.ceil(audioDuration / 10); // 1 credit per 10 seconds
      } else if (activeTab === "Clone voice") {
        creditsNeeded = text.length; // Assuming similar credit usage
      }

      if (isLoggedIn) {
        console.log(`Credits needed: ${creditsNeeded}`);

        // Fetch current credits
        const creditsResponse = await fetch("/api/user/credits");
        const creditsData = await creditsResponse.json();
        console.log("Current credits data:", creditsData);

        // Check and deduct credits based on the active tab
        if (activeTab === "TTS") {
          const updateCreditsResponse = await fetch("/api/user/update-credits", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              creditsUsed: creditsNeeded,
              creditType: "Text to Speech Pro",
              language: language,
              useDefaultCredits: true
            }),
          });

          if (!updateCreditsResponse.ok) {
            const errorData = await updateCreditsResponse.json();
            throw new Error(errorData.error || "Failed to update credits");
          }
        } else if (activeTab === "Talking Image") {
          const updateCreditsResponse = await fetch("/api/user/update-credits", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              creditsUsed: creditsNeeded,
              creditType: "Talking Image",
              useDefaultCredits: false // Ensure default credits are not used for Talking Image
            }),
          });

          if (!updateCreditsResponse.ok) {
            const errorData = await updateCreditsResponse.json();
            throw new Error(errorData.error || "Failed to update Talking Image credits");
          }
        } else if (activeTab === "Clone voice") {
          // Similar credit check for Clone voice
          const updateCreditsResponse = await fetch("/api/user/update-credits", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              creditsUsed: creditsNeeded,
              creditType: "Voice Cloning Pro",
              language: language
            }),
          });

          if (!updateCreditsResponse.ok) {
            const errorData = await updateCreditsResponse.json();
            throw new Error(errorData.error || "Failed to update credits");
          }
        }
      } else {
        // User is not logged in
        if (activeTab === "TTS") {
          // Optionally, enforce a character limit for non-logged-in users
          if (text.length > 1000) { // Example limit
            throw new Error("Text exceeds the maximum allowed length of 1000 characters.");
          }
          // Proceed without deducting credits
        } else {
          // For other tabs, which require login, display error
          throw new Error("You must be logged in to use this feature.");
        }
      }

      console.log("Sending request to:", endpoint);
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      console.log("Response:", response);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (contentType && contentType.includes("application/json")) {
        const result = await response.json();
        console.log("JSON result:", result);

        if (activeTab === "TTS" || activeTab === "Clone voice") {
          if (result && typeof result === 'object' && 'audioUrl' in result) {
            console.log("Setting generated audio URL:", result.audioUrl);
            setGeneratedAudio(result.audioUrl);
            setAudioSrc(result.audioUrl); // Set the audio source
          } else {
            console.error("Unexpected JSON response format:", result);
            throw new Error("Failed to generate audio: Unexpected JSON response format");
          }
        } else if (activeTab === "Talking Image") {
          if (result.videoData) {
            setGeneratedVideo(result.videoData);
          } else {
            throw new Error(result.error || "Failed to generate video.");
          }
        }
      } else if (contentType && contentType.includes("audio/")) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log("Setting generated audio URL:", audioUrl);
        setGeneratedAudio(audioUrl);
        setAudioSrc(audioUrl); // Set the audio source
      } else {
        console.error("Unexpected content type:", contentType);
        throw new Error("Failed to generate audio: Unexpected content type");
      }
    } catch (error) {
      console.error("Error during generation:", error);
      setError((error as Error).message || "An unexpected error occurred");
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
    const queryParams = `product=${encodeURIComponent(product)}&price=${price}&subscription=true`;
    router.push(`/checkout?${queryParams}`);
  }

  const handleGenerateTalkingImage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (talkingImageAudioFile) {
        formData.append("audio", talkingImageAudioFile);
      }

      // Check if both files are present
      if (!imageFile || !talkingImageAudioFile) {
        throw new Error("Both image and audio files are required.");
      }

      // Get audio duration
      const audioDuration = await getAudioDuration(talkingImageAudioFile);
      
      // Calculate credits needed: 1 credit per 10 seconds, rounded up
      const creditsNeeded = Math.ceil(audioDuration / 10);

      // Check if the user has enough credits
      const creditsResponse = await fetch('/api/user/credits');
      const creditsData = await creditsResponse.json();
      
      if (creditsData.credits['Talking Image'] < creditsNeeded) {
        throw new Error(`Not enough credits. You have ${creditsData.credits['Talking Image']} credits, but need ${creditsNeeded} credits.`);
      }

      const response = await fetch("/api/talking-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate talking image video");
      }

      const result = await response.json();

      if (result.videoData) {
        setGeneratedVideo(result.videoData);
        
        // Deduct credits
        const updateCreditsResponse = await fetch('/api/user/update-credits', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            creditsUsed: creditsNeeded,
            creditType: 'Talking Image'
          }),
        });
        
        if (!updateCreditsResponse.ok) {
          const errorData = await updateCreditsResponse.json();
          console.error("Failed to update credits:", errorData);
          setError(`Failed to update credits: ${errorData.error}. Available: ${errorData.available}, Required: ${errorData.required}`);
        }
      } else {
        throw new Error("Failed to generate talking image video");
      }
    } catch (error) {
      console.error("Error generating talking image video:", error);
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

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
    console.log('Voice categories updated:', voiceCategories);
  }, [voiceCategories]);

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
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-indigo-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="TTS" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 rounded-md transition-all"
                >
                  <MicIcon className="w-4 h-4 mr-2" />
                  TTS
                </TabsTrigger>
                <TabsTrigger 
                  value="Talking Image" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 rounded-md transition-all"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Talking Image
                </TabsTrigger>
                <TabsTrigger 
                  value="Clone voice" 
                  className="data-[state=active]:bg-white data-[state=active]:text-indigo-700 rounded-md transition-all"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Clone voice
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="TTS">
                {isLoggedIn ? (
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
                            {voiceCategories.map((category) => (
                              <option key={category._id} value={category.category}>
                                {category.category}
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
                              {voiceCategories.find(category => category.category === selectedCategory)?.voices.map((voice, index) => (
                                <option 
                                  key={index} 
                                  value={voice.name} 
                                  disabled={userTTSCredits.isLocked && !voice.is_free}
                                >
                                  {voice.name} {userTTSCredits.isLocked && !voice.is_free ? '🔒' : ''}
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
                    
                    {selectedCategory.toLowerCase() === "hindi" && (
                      <div className="bg-yellow-100 p-4 rounded-md">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> Please do not use long paragraphs. Using long paragraphs may degrade the quality of voice. For longer text generation, use multiple paragraphs of 25 to 30 words each.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-md text-center">
                    <p className="text-gray-600 mb-4">Please log in to access the Text-to-Speech feature.</p>
                    <Link href="/login">
                      <Button variant="default">Log In</Button>
                    </Link>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="Talking Image">
                {isLoggedIn ? (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-4">Upload Image and Audio</h2>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImageFile(file);
                              }
                            }}
                          />
                          <label 
                            htmlFor="image-upload"
                            className="flex-1 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md cursor-pointer hover:bg-indigo-50 transition-colors duration-200 text-center"
                          >
                            <UploadIcon className="h-4 w-4 inline-block mr-2" />
                            {imageFile ? "Change image" : "Upload image"}
                          </label>
                          
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            id="talking-image-audio-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setTalkingImageAudioFile(file);
                              }
                            }}
                          />
                          <label 
                            htmlFor="talking-image-audio-upload"
                            className="flex-1 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md cursor-pointer hover:bg-indigo-50 transition-colors duration-200 text-center"
                          >
                            <UploadIcon className="h-4 w-4 inline-block mr-2" />
                            {talkingImageAudioFile ? "Change audio" : "Upload audio"}
                          </label>
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
                        
                        {talkingImageAudioFile && (
                          <div className="bg-gray-100 p-4 rounded-md">
                            <p className="text-sm font-medium mb-2">Selected Audio:</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{talkingImageAudioFile.name}</span>
                              <Button variant="ghost" size="sm" onClick={() => setTalkingImageAudioFile(null)}>
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Add the note about processing time */}
                    <div className="bg-yellow-100 p-4 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> It takes approximately 10 minutes to generate a 60-second video. Please be patient during the processing time.
                      </p>
                    </div>

                    {/* Add the new note about image resolution and headroom space */}
                    <div className="bg-blue-100 p-4 rounded-md">
                      <p className="text-sm text-blue-800">
                        <strong>For better results:</strong> Use 512×512 image resolution. For long portrait images, give at least 1/3rd headroom space.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-md text-center">
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
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            id="clone-voice-upload"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setCloneVoiceAudioFile(file);
                              }
                            }}
                          />
                          <label 
                            htmlFor="clone-voice-upload"
                            className="flex-1 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md cursor-pointer hover:bg-indigo-50 transition-colors duration-200 text-center"
                          >
                            <UploadIcon className="h-4 w-4 inline-block mr-2" />
                            {cloneVoiceAudioFile ? "Change file" : "Upload audio"}
                          </label>
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
                        
                        {cloneVoiceAudioFile && !isRecording && (
                          <div className="bg-gray-100 p-4 rounded-md">
                            <p className="text-sm font-medium mb-2">Selected Audio:</p>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{cloneVoiceAudioFile.name}</span>
                              <Button variant="ghost" size="sm" onClick={() => setCloneVoiceAudioFile(null)}>
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
                    <p className="text-gray-600 mb-4">Please log in to access the Clone Voice feature.</p>
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
              disabled={
                isLoading || 
                (activeTab !== "TTS" && !isLoggedIn) || 
                (activeTab === "Clone voice" && !cloneVoiceAudioFile) || 
                (activeTab === "Talking Image" && (!imageFile || !talkingImageAudioFile))
              }
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

        {generatedAudio && activeTab !== "Talking Image" && (
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
                src={audioSrc || ''}
                className="hidden"
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={() => console.log("Audio metadata loaded")}
                onError={(e) => console.error("Audio error:", e)}
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
                { title: "TellerGen Text to Speech Pro", price: 999, features: [
                  "Unlimited Hindi & English voices",
                  "High quality audio download",
                  "Ultra realistic voices",
                  "Monthly subscription",
                  "Unlimited characters"
                ]},
                { title: "TellerGen Voice Cloning Pro", price: 499, features: [
                  "Clone up to 1 million characters",
                  "High quality audio",
                  "Ultra realistic cloned voice"
                ]},
                { title: "TellerGen Talking Image Pro", price: 999, features: [
                  "Up to 60 minutes of video generation",
                  "High quality image to video",
                  "Realistic head movement",
                  "Perfect lip syncing"
                ]}
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
                  <Button 
                    onClick={() => handleBuyPro(plan.title.toLowerCase().replace(/\s+/g, '_'), plan.price)} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4"
                  >
                    Buy Pro (Rs {plan.price})
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
