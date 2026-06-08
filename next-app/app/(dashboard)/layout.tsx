import { DashboardShell } from "@/components/layout/dashboard-shell"
import { ErrorBoundary } from "@/components/shared/error-boundary"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <DashboardShell>{children}</DashboardShell>
    </ErrorBoundary>
  )
}
