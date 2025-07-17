"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

interface ReferralData {
  user: User
  referralCode: string | null
  redeemedCode: string | null
  referrals: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
  }>
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [redeemCode, setRedeemCode] = useState("")
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/referral/data")

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setReferralData(data)
      } else {
        setError("Failed to load user data")
      }
    } catch (err) {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const generateReferralCode = async () => {
    setGenerating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/referral/generate", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setReferralData((prev) => (prev ? { ...prev, referralCode: data.referralCode } : null))
        setSuccess("Referral code generated successfully!")
      } else {
        setError(data.error || "Failed to generate referral code")
      }
    } catch (err) {
      setError("Something went wrong")
    } finally {
      setGenerating(false)
    }
  }

  const redeemReferralCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setRedeeming(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/referral/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: redeemCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setReferralData((prev) => (prev ? { ...prev, redeemedCode: redeemCode } : null))
        setSuccess("Referral code redeemed successfully!")
        setRedeemCode("")
      } else {
        setError(data.error || "Failed to redeem referral code")
      }
    } catch (err) {
      setError("Something went wrong")
    } finally {
      setRedeeming(false)
    }
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user || !referralData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load user data</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.firstName}!</p>
          </div>
          <Button onClick={logout} variant="outline">
            Logout
          </Button>
        </div>

        {/* Messages */}
        {error && <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">{error}</div>}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">{success}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Generate Referral Code */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Code</CardTitle>
              <CardDescription>Generate a unique code to share with friends</CardDescription>
            </CardHeader>
            <CardContent>
              {referralData.referralCode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-100 rounded-lg text-center">
                    <div className="text-2xl font-mono font-bold text-blue-600">{referralData.referralCode}</div>
                  </div>
                  <p className="text-sm text-gray-600">Share this code with friends to earn referrals!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600">You haven't generated a referral code yet.</p>
                  <Button onClick={generateReferralCode} disabled={generating} className="w-full">
                    {generating ? "Generating..." : "Generate Referral Code"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Redeem Referral Code */}
          <Card>
            <CardHeader>
              <CardTitle>Redeem Referral Code</CardTitle>
              <CardDescription>Enter someone else's referral code</CardDescription>
            </CardHeader>
            <CardContent>
              {referralData.redeemedCode ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-sm text-green-600 mb-1">You redeemed:</div>
                    <div className="text-xl font-mono font-bold text-green-700">{referralData.redeemedCode}</div>
                  </div>
                  <p className="text-sm text-gray-600">You have already redeemed a referral code.</p>
                </div>
              ) : (
                <form onSubmit={redeemReferralCode} className="space-y-4">
                  <div>
                    <Label htmlFor="redeemCode">Referral Code</Label>
                    <Input
                      id="redeemCode"
                      type="text"
                      placeholder="Enter referral code"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={redeeming} className="w-full">
                    {redeeming ? "Redeeming..." : "Redeem Code"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Referrals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
            <CardDescription>
              Users who have used your referral code ({referralData.referrals.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referralData.referrals.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralData.referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        {referral.firstName} {referral.lastName}
                      </TableCell>
                      <TableCell>{referral.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No referrals yet. Share your referral code to get started!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
