import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Referral System</h1>
          <p className="text-gray-600 mb-8">Join our platform and start earning through referrals!</p>
        </div>

        <div className="space-y-4">
          <Link href="/register" className="block">
            <Button className="w-full">Get Started</Button>
          </Link>

          <Link href="/login" className="block">
            <Button variant="outline" className="w-full bg-transparent">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
