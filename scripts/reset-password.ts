import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resetPassword() {
  const email = process.env.RESET_EMAIL || 'raffaele.rotella@gmail.com'
  const newPassword = process.env.RESET_PASSWORD || '12345678'

  try {
    console.log('🔍 Looking up user...')
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      console.error('❌ User not found for email:', email)
      process.exit(1)
    }

    console.log('🔐 Hashing new password...')
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    console.log('💾 Updating password...')
    const updated = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
      select: { id: true, email: true, updatedAt: true },
    })

    console.log('✅ Password reset completed')
    console.log('User ID:', updated.id)
    console.log('Email:', updated.email)
    console.log('Updated at:', updated.updatedAt.toISOString())
  } catch (error) {
    console.error('❌ Error resetting password:', error)
    if (error instanceof Error) console.error('Error message:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()






