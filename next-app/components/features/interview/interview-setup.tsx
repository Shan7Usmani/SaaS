"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, MessageSquare, ArrowRight, Users } from "lucide-react"

interface InterviewSetupProps {
  onStart: (type: "technical" | "hr") => void
}

export function InterviewSetup({ onStart }: InterviewSetupProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card
        className="hover:border-primary/50 group cursor-pointer transition-all"
        onClick={() => onStart("technical")}
      >
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="bg-blue-100 mb-4 rounded-full p-4 transition-colors group-hover:bg-blue-200 dark:bg-blue-900 dark:group-hover:bg-blue-800">
            <GraduationCap className="h-10 w-10 text-blue-600 dark:text-blue-300" />
          </div>
          <CardTitle className="text-xl">Technical Interview</CardTitle>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            5 DSA & CS fundamentals questions with timed answers
          </p>
           <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" /> AI evaluated
            </Badge>
          </div>
          <Button className="mt-6 w-full" size="lg">
            Start Technical
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card
        className="hover:border-primary/50 group cursor-pointer transition-all"
        onClick={() => onStart("hr")}
      >
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="bg-green-100 mb-4 rounded-full p-4 transition-colors group-hover:bg-green-200 dark:bg-green-900 dark:group-hover:bg-green-800">
            <MessageSquare className="h-10 w-10 text-green-600 dark:text-green-300" />
          </div>
          <CardTitle className="text-xl">HR Interview</CardTitle>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Behavioral questions with confidence and communication scoring
          </p>
           <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" /> AI evaluated
            </Badge>
          </div>
          <Button className="mt-6 w-full" size="lg">
            Start HR
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
