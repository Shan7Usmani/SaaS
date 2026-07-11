"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import {
  BookOpen,
  Users,
  Star,
  GitFork,
  ExternalLink,
  Loader2,
  Code2,
} from "lucide-react"
export default function GitHubPage() {
  const [username, setUsername] = useState("")
  const [connected, setConnected] = useState(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("github-username") ?? ""
  })
  const [userData, setUserData] = useState<{ login: string; avatar_url: string; name: string; public_repos: number; followers: number; following: number; bio: string; html_url: string } | null>(null)
  const [repos, setRepos] = useState<{ name: string; stargazers_count: number; forks_count: number; language: string; html_url: string; description: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchGitHubData = async (user: string) => {
    setLoading(true)
    setError("")
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${user}`),
        fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=6`),
      ])
      if (!userRes.ok) throw new Error("User not found")
      setUserData(await userRes.json())
      setRepos(await reposRes.json())
      setConnected(user)
      localStorage.setItem("github-username", user)
    } catch {
      setError("Could not fetch GitHub profile. Check the username.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!connected) return
    Promise.resolve().then(() => fetchGitHubData(connected))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = () => {
    if (!username.trim()) return
    fetchGitHubData(username.trim())
  }

  const handleDisconnect = () => {
    localStorage.removeItem("github-username")
    setConnected("")
    setUserData(null)
    setRepos([])
    setUsername("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">GitHub</h1>
        <p className="text-muted-foreground text-sm">
          Connect your GitHub account to track your repos and contributions
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {!connected ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="rounded-full bg-muted p-4">
                <Code2 className="h-8 w-8" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">Connect your GitHub</p>
                <p className="text-muted-foreground text-sm">
                  Enter your GitHub username to see your public profile and repos
                </p>
              </div>
              <div className="flex w-full max-w-sm items-center gap-3">
                <Input
                  placeholder="GitHub username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConnect()}
                />
                <Button onClick={handleConnect} disabled={loading || !username.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code2 className="h-4 w-4" />}
                  Connect
                </Button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          ) : (
            <div className="space-y-6">
              {userData && (
                <>
                  <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Image
                      src={userData.avatar_url}
                      alt={userData.login}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-full"
                      unoptimized
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold truncate">{userData.name || userData.login}</p>
                      <p className="text-muted-foreground text-sm truncate">{userData.bio}</p>
                      <a
                        href={userData.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary inline-flex items-center gap-1 text-sm hover:underline mt-0.5"
                      >
                        @{userData.login}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleDisconnect}>
                      Disconnect
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Repos", value: userData.public_repos, icon: BookOpen },
                      { label: "Followers", value: userData.followers, icon: Users },
                      { label: "Following", value: userData.following, icon: Star },
                    ].map((stat) => (
                      <div key={stat.label} className="flex flex-col items-center rounded-lg border p-4">
                        <stat.icon className="text-muted-foreground h-5 w-5" />
                        <span className="mt-1 text-2xl font-bold">{stat.value}</span>
                        <span className="text-muted-foreground text-xs">{stat.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="overflow-hidden rounded-lg border">
                    <div className="flex items-center justify-center p-4 dark:invert">
                      <Image
                        src={`https://ghchart.rshah.org/${connected}`}
                        alt={`${connected}'s GitHub contribution graph`}
                        width={900}
                        height={150}
                        className="w-full max-w-full"
                        unoptimized
                      />
                    </div>
                  </div>

                  {repos.length > 0 && (
                    <div>
                      <p className="mb-3 text-sm font-semibold text-muted-foreground">
                        Recent Repositories
                      </p>
                      <div className="space-y-2">
                        {repos.map((repo) => (
                          <a
                            key={repo.name}
                            href={repo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
                          >
                            <BookOpen className="text-muted-foreground h-4 w-4 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{repo.name}</p>
                              {repo.description && (
                                <p className="text-muted-foreground truncate text-xs">{repo.description}</p>
                              )}
                            </div>
                            {repo.language && (
                              <span className="text-muted-foreground hidden text-xs md:inline">{repo.language}</span>
                            )}
                            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                              <Star className="h-3 w-3" />
                              {repo.stargazers_count}
                            </span>
                            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                              <GitFork className="h-3 w-3" />
                              {repo.forks_count}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
