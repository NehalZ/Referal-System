import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { generateReferralCode } from "@/lib/referral"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user already has a referral code
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { referralCode: true },
    })

    if (existingUser?.referralCode) {
      return NextResponse.json({
        referralCode: existingUser.referralCode,
        message: "Referral code already exists",
      })
    }

    // Generate unique referral code
    let referralCode: string
    let isUnique = false

    while (!isUnique) {
      referralCode = generateReferralCode()
      const existing = await prisma.user.findUnique({
        where: { referralCode },
      })
      if (!existing) {
        isUnique = true
      }
    }

    // Update user with referral code
    await prisma.user.update({
      where: { id: user.id },
      data: { referralCode },
    })

    return NextResponse.json({
      referralCode,
      message: "Referral code generated successfully",
    })
  } catch (error) {
    console.error("Generate referral error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
