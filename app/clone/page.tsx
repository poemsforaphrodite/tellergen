import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ClonePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Clone Voice</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Upload an audio sample to clone a voice.</p>
          <Button className="mt-4">Upload Audio</Button>
        </CardContent>
      </Card>
    </div>
  )
}