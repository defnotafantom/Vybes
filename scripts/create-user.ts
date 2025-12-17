import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createUser() {
  try {
    const email = 'raffaele.rotella@gmail.com'
    const password = '12345678'
    const name = 'Raffaele Rotella'

    console.log('🔍 Checking if user already exists...')
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      console.log('⚠️ User already exists with email:', email)
      console.log('User ID:', existingUser.id)
      return
    }

    console.log('🔐 Hashing password...')
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log('👤 Creating user...')
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerified: new Date(), // Mark as verified
        role: 'DEFAULT',
      },
    })

    console.log('✅ User created successfully!')
    console.log('User ID:', user.id)
    console.log('Email:', user.email)
    console.log('Name:', user.name)
    console.log('Role:', user.role)
  } catch (error) {
    console.error('❌ Error creating user:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createUser()
