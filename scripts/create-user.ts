import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('👤 Creating user account...')
  
  const hashedPassword = await bcrypt.hash('password123', 10)

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'buccadany@gmail.com' },
    })

    if (existingUser) {
      console.log('✅ User already exists!')
      console.log('📧 Email:', existingUser.email)
      console.log('👤 Name:', existingUser.name)
      console.log('🔐 Password: password123')
      return
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'buccadany@gmail.com',
        password: hashedPassword,
        name: 'Dany',
        username: 'dany',
        role: UserRole.ARTIST,
        bio: 'Artista e creatore di Vybes 🎨',
        location: 'Italia',
        level: 10,
        experience: 5000,
        reputation: 200,
        emailVerified: new Date(),
      },
    })

    console.log('✅ User created successfully!')
    console.log('📧 Email: buccadany@gmail.com')
    console.log('🔐 Password: password123')
    console.log('👤 User ID:', user.id)
  } catch (error) {
    console.error('❌ Error creating user:', error)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

