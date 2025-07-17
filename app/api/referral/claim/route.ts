import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { referralCode } = await request.json()

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
    }

    // Check if user has already redeemed a code
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { redeemedCode: true, referralCode: true },
    })

    if (currentUser?.redeemedCode) {
      return NextResponse.json({ error: "You have already redeemed a referral code" }, { status: 400 })
    }

    // Check if trying to use own referral code
    if (currentUser?.referralCode === referralCode) {
      return NextResponse.json({ error: "You cannot use your own referral code" }, { status: 400 })
    }

    // Find the referrer
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
    })

    if (!referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 400 })
    }

    // Check if already claimed this specific code
    const existingClaim = await prisma.referralClaim.findUnique({
      where: {
        referrerId_claimerId: {
          referrerId: referrer.id,
          claimerId: user.id,
        },
      },
    })

    if (existingClaim) {
      return NextResponse.json({ error: "You have already used this referral code" }, { status: 400 })
    }

    // Create referral claim and update user
    await prisma.$transaction([
      prisma.referralClaim.create({
        data: {
          referrerId: referrer.id,
          claimerId: user.id,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { redeemedCode: referralCode },
      }),
    ])

    return NextResponse.json({
      message: "Referral code redeemed successfully",
    })
  } catch (error) {
    console.error("Claim referral error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
