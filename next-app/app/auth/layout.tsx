import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="fixed top-8 left-8">
        <Link
          href="/"
          className="font-bold tracking-widest text-primary text-lg"
        >
          PLACEMENTOS
        </Link>
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  )
}
