import { z } from "zod"

export const onboardingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  college: z.string().min(2, "College is required"),
  branch: z.string().min(2, "Branch is required"),
  year: z.string().min(1, "Year is required"),
  cgpa: z.number().min(0).max(10).optional(),
  target_companies: z.array(z.string()).min(1, "Select at least one company"),
  dsa_level: z.enum(["beginner", "intermediate", "advanced"]),
  preferred_role: z.enum(["swe", "data", "ai", "web"]),
})

export const profileSchema = onboardingSchema.partial()

export type OnboardingFormData = z.infer<typeof onboardingSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
