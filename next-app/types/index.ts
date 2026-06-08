export interface UserProfile {
  id: string
  email: string
  name: string | null
  college: string | null
  branch: string | null
  year: string | null
  cgpa: number | null
  target_companies: string[]
  dsa_level: "beginner" | "intermediate" | "advanced" | null
  preferred_role: "swe" | "data" | "ai" | "web" | null
  avatar_url: string | null
  onboarding_completed: boolean
  created_at: string
}

export interface PlacementScore {
  total: number | null
  dsa: number | null
  resume: number | null
  interview: number | null
  aptitude: number | null
  communication: number | null
}

export interface Roadmap {
  id: string
  user_id: string
  target_company: string
  target_role: string
  months: RoadmapMonth[]
  created_at: string
}

export interface RoadmapMonth {
  month: number
  title: string
  topics: RoadmapTopic[]
}

export interface RoadmapTopic {
  id: string
  name: string
  is_completed: boolean
  completed_at: string | null
}

export interface Resume {
  id: string
  user_id: string
  score: ResumeScore
  suggestions: string[]
  pdf_url: string
  created_at: string
}

export interface ResumeScore {
  overall: number
  ats: number
  keywords: number
  projects: number
  skills: number
}

export interface Interview {
  id: string
  user_id: string
  type: "technical" | "hr"
  questions: InterviewQuestion[]
  scores: number[]
  total_score: number
  feedback: string
  created_at: string
}

export interface InterviewQuestion {
  question: string
  answer: string
  score: number
  feedback: string
}

export interface Application {
  id: string
  user_id: string
  company: string
  role: string
  stage: "applied" | "oa" | "interview" | "offer" | "rejected"
  notes: string | null
  applied_date: string
  updated_at: string
}

export interface ScoreBreakdown {
  score: number | null
  status: "assessed" | "not_assessed"
}

export interface DashboardData {
  placement_score: {
    total: number | null
    breakdown: {
      dsa: ScoreBreakdown
      resume: ScoreBreakdown
      interview: ScoreBreakdown
      aptitude: ScoreBreakdown
      communication: ScoreBreakdown
    }
  }
  target: {
    score: number
    gap: number
    estimated_weeks: number
  }
  roadmap: {
    completion_pct: number
  }
  applications: {
    total: number
    stages: {
      applied: number
      oa: number
      interview: number
      offer: number
      rejected: number
    }
  }
  interviews: {
    total: number
    average_score: number | null
  }
}
