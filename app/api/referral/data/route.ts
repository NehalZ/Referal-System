import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user data with referral information
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        referralCode: true,
        redeemedCode: true,
        referrals: {
          select: {
            claimer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Format the response
    const response = {
      user: {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
      referralCode: userData.referralCode,
      redeemedCode: userData.redeemedCode,
      referrals: userData.referrals.map((ref) => ref.claimer),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get referral data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
