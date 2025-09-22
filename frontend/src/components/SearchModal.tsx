"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setResults([
        { id: "1", title: "The Dark Knight", genre: "Action", year: 2008, match: "95%" },
        { id: "2", title: "Inception", genre: "Sci-Fi", year: 2010, match: "92%" },
        { id: "3", title: "Interstellar", genre: "Drama", year: 2014, match: "88%" },
      ])
      setIsLoading(false)
    }, 1500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] border-4 border-black shadow-[12px_12px_0_0_#000] bg-white">
        <DialogHeader className="border-b-4 border-black pb-4">
          <DialogTitle className="text-2xl font-extrabold flex items-center gap-2">
            <Search className="w-6 h-6" />
            Find Your Perfect Movie
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Search Input */}
          <div className="flex gap-3">
            <Input
              placeholder="Search by genre, actor, director, or mood..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 border-black shadow-[4px_4px_0_0_#000] text-lg"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              onClick={handleSearch}
              className="bg-purple-600 hover:bg-purple-700 border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"
                  style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                ></div>
              </div>
              <p className="text-lg font-bold">Finding your perfect matches...</p>
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          )}

          {/* Results */}
          {!isLoading && results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-extrabold">Match Results</h3>
              <div className="grid gap-4">
                {results.map((movie) => (
                  <div
                    key={movie.id}
                    className="border-2 border-black bg-gradient-to-r from-purple-50 to-white p-4 shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-lg">{movie.title}</h4>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-purple-600 text-white">{movie.genre}</Badge>
                          <Badge variant="outline" className="border-black">
                            {movie.year}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-purple-600">{movie.match}</div>
                        <div className="text-sm text-gray-600">Match</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
