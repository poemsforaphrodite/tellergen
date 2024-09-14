import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 text-gray-900 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">History</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your voice generation history will appear here.</p>
          {/* Add history items here */}
        </CardContent>
      </Card>
    </div>
  )
}