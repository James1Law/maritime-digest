"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Ship, Calendar, Clock, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Skeleton } from "@/components/ui/skeleton"

// Define the article type
type Article = {
  title: string
  link: string
  summary: string
  source: string
  publishedAt?: string
  category?: string
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050'
// TODO: Update this to your production API URL when deploying
// const API_BASE_URL = 'https://api.maritimedigest.xyz'

const categoryColors = {
  Automation: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  "Green Tech": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "AI & Analytics": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Blockchain: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  "Digital Innovation": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="ml-auto"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

function NewsCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-16 w-full mb-4" />
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/news`, {
          headers: {
            'Accept': 'application/json',
          },
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.statusText}`)
        }
        
        const data = await response.json()
        setArticles(data)
      } catch (err) {
        console.error('Error fetching news:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching news')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Flatten all categories from all articles, deduplicate, and sort
  const categories = Array.from(
    new Set(
      articles.flatMap(article => Array.isArray(article.category) ? article.category : [article.category])
    )
  ).filter(Boolean)

  // Filter articles by selected category
  const filteredNews = selectedCategory
    ? articles.filter(article =>
        Array.isArray(article.category)
          ? article.category.includes(selectedCategory)
          : article.category === selectedCategory
      )
    : articles

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Ship className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Maritime Digest</h1>
                <p className="text-sm text-muted-foreground">Latest Maritime Tech News</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats and Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Today's Headlines</h2>
              <p className="text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{filteredNews.length}</p>
              <p className="text-sm text-muted-foreground">Articles</p>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            // Show skeleton loaders while loading
            Array.from({ length: 6 }).map((_, index) => (
              <NewsCardSkeleton key={index} />
            ))
          ) : error ? (
            // Show error message if fetch failed
            <div className="col-span-full text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : (
            // Show actual news articles
            filteredNews.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    {article.category && (
                      <Badge
                        variant="secondary"
                        className={categoryColors[article.category as keyof typeof categoryColors]}
                      >
                        {article.category}
                      </Badge>
                    )}
                    {article.publishedAt && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(article.publishedAt)}
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-2">{article.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">{article.source}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{article.summary}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(article.link, "_blank")}
                  >
                    Read Full Article
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>Maritime Digest Bot • Powered by Next.js & Vercel</p>
          <p className="mt-2">Last updated: {new Date().toLocaleTimeString()}</p>
        </footer>
      </main>
    </div>
  )
}
