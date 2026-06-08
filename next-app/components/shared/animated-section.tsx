"use client"

import { useIntersectionObserver } from "@/hooks/use-intersection-observer"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  from?: "bottom" | "left" | "right" | "fade"
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  from = "bottom",
}: AnimatedSectionProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.15 })

  const translateMap = {
    bottom: "translate-y-12",
    left: "-translate-x-12",
    right: "translate-x-12",
    fade: "translate-y-0",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible
          ? "translate-x-0 translate-y-0 opacity-100"
          : `${translateMap[from]} opacity-0`,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
