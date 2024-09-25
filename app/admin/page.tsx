"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, UploadIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [repoId, setRepoId] = useState("")
  const [pathInRepo, setPathInRepo] = useState("")
  const [homePageContent, setHomePageContent] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState("")
  const [voiceCategory, setVoiceCategory] = useState("")
  const [voiceName, setVoiceName] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file || !repoId || !pathInRepo) {
      setMessage("Please fill in all fields")
      return
    }

    setIsUploading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("repoId", repoId)
    formData.append("pathInRepo", pathInRepo)

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setMessage("File uploaded successfully")
      } else {
        const error = await response.text()
        setMessage(`Upload failed: ${error}`)
      }
    } catch (error) {
      setMessage(`Upload failed: ${error}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateHomePage = async () => {
    if (!homePageContent) {
      setMessage("Please enter content for the home page")
      return
    }

    setIsUpdating(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/update-home", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: homePageContent }),
      })

      if (response.ok) {
        setMessage("Home page updated successfully")
      } else {
        const error = await response.text()
        setMessage(`Update failed: ${error}`)
      }
    } catch (error) {
      setMessage(`Update failed: ${error}`)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleVoiceUpload = async () => {
    if (!file || !voiceCategory || !voiceName) {
      setMessage("Please fill in all fields for voice upload")
      return
    }

    setIsUploading(true)
    setMessage("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", voiceCategory)
    formData.append("name", voiceName)

    try {
      const response = await fetch("/api/admin/upload-voice", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setMessage("Voice uploaded successfully")
      } else {
        const error = await response.text()
        setMessage(`Voice upload failed: ${error}`)
      }
    } catch (error) {
      setMessage(`Voice upload failed: ${error}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <h1 className="text-3xl font-bold text-indigo-800 mb-8">Admin Dashboard</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload File to Hugging Face</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" onChange={handleFileChange} className="mb-4" />
          <Input 
            placeholder="Repository ID (e.g., username/test-dataset)" 
            value={repoId} 
            onChange={(e) => setRepoId(e.target.value)}
            className="mb-4"
          />
          <Input 
            placeholder="Path in repo (e.g., data/file.txt)" 
            value={pathInRepo} 
            onChange={(e) => setPathInRepo(e.target.value)}
            className="mb-4"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Home Page</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Enter new content for home/page.tsx" 
            value={homePageContent} 
            onChange={(e) => setHomePageContent(e.target.value)}
            className="min-h-[200px]"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdateHomePage} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Home Page"
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload Voice to Hugging Face</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" onChange={handleFileChange} className="mb-4" accept="audio/*" />
          <Select onValueChange={setVoiceCategory} value={voiceCategory}>
            <SelectTrigger className="mb-4">
              <SelectValue placeholder="Select voice category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="celebrities">Celebrities</SelectItem>
              <SelectItem value="characters">Characters</SelectItem>
              <SelectItem value="streamers">Streamers</SelectItem>
              <SelectItem value="politicians">Politicians</SelectItem>
              <SelectItem value="athletes">Athletes</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            placeholder="Voice name" 
            value={voiceName} 
            onChange={(e) => setVoiceName(e.target.value)}
            className="mb-4"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleVoiceUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading Voice...
              </>
            ) : (
              <>
                <UploadIcon className="mr-2 h-4 w-4" />
                Upload Voice
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {message && (
        <div className={`mt-4 p-4 rounded-md ${message.includes("failed") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {message}
        </div>
      )}
    </div>
  )
}