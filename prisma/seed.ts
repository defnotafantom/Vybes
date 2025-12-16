import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

type UserRole = 'DEFAULT' | 'ARTIST' | 'RECRUITER' | 'ARTIST_RECRUITER'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create default quests
  console.log('📜 Creating quests...')
  const quests = [
    {
      title: 'Profilo Completo',
      description: 'Completa il tuo profilo aggiungendo nome, bio e immagine',
      type: 'profile_complete',
      role: ['DEFAULT', 'ARTIST', 'RECRUITER'],
      experienceReward: 50,
      reputationReward: 5,
    },
    {
      title: 'Primo Post',
      description: 'Crea il tuo primo post sulla piattaforma',
      type: 'first_post',
      role: ['DEFAULT', 'ARTIST', 'RECRUITER'],
      experienceReward: 100,
      reputationReward: 10,
    },
    {
      title: 'Primo Portfolio',
      description: 'Aggiungi la tua prima opera al portfolio (solo per artisti)',
      type: 'first_portfolio',
      role: ['ARTIST'],
      experienceReward: 150,
      reputationReward: 15,
    },
    {
      title: 'Primo Evento',
      description: 'Crea il tuo primo evento (solo per recruiter)',
      type: 'first_event',
      role: ['RECRUITER'],
      experienceReward: 150,
      reputationReward: 15,
    },
    {
      title: 'Collaborazione Artistica',
      description: 'Partecipa a una collaborazione con un altro artista',
      type: 'collaboration',
      role: ['ARTIST'],
      experienceReward: 200,
      reputationReward: 20,
    },
    {
      title: 'Partecipa a un Evento',
      description: 'Partecipa al tuo primo evento come artista',
      type: 'join_event',
      role: ['ARTIST'],
      experienceReward: 150,
      reputationReward: 15,
    },
  ]

  for (const quest of quests) {
    await prisma.quest.upsert({
      where: { type: quest.type },
      update: quest,
      create: quest,
    })
  }

  // Create mock users
  console.log('👥 Creating mock users...')
  const hashedPassword = await bcrypt.hash('password123', 10)

  const users = [
    {
      email: 'artista1@vybes.com',
      password: hashedPassword,
      name: 'Marco Rossi',
      username: 'marco_artista',
      role: 'ARTIST' as const,
      bio: 'Pittore contemporaneo specializzato in arte digitale 🎨',
      location: 'Milano, Italia',
      level: 5,
      experience: 1250,
      reputation: 85,
      emailVerified: new Date(),
    },
    {
      email: 'artista2@vybes.com',
      password: hashedPassword,
      name: 'Sofia Bianchi',
      username: 'sofia_music',
      role: 'ARTIST' as const,
      bio: 'Musicista e compositrice | Creo musica per anime e film 🎵',
      location: 'Roma, Italia',
      level: 7,
      experience: 2100,
      reputation: 120,
      emailVerified: new Date(),
    },
    {
      email: 'artista3@vybes.com',
      password: hashedPassword,
      name: 'Luca Verdi',
      username: 'luca_photo',
      role: 'ARTIST' as const,
      bio: 'Fotografo di strada | Catturo momenti autentici 📸',
      location: 'Torino, Italia',
      level: 3,
      experience: 450,
      reputation: 35,
      emailVerified: new Date(),
    },
    {
      email: 'recruiter1@vybes.com',
      password: hashedPassword,
      name: 'Giulia Neri',
      username: 'giulia_events',
      role: 'RECRUITER' as const,
      bio: 'Organizzatrice di eventi culturali e mostre d\'arte 🎭',
      location: 'Firenze, Italia',
      level: 6,
      experience: 1800,
      reputation: 95,
      emailVerified: new Date(),
    },
    {
      email: 'recruiter2@vybes.com',
      password: hashedPassword,
      name: 'Alessandro Blu',
      username: 'alex_studio',
      role: 'RECRUITER' as const,
      bio: 'Studio di produzione musicale | Cerchiamo talenti 🎤',
      location: 'Napoli, Italia',
      level: 8,
      experience: 2800,
      reputation: 150,
      emailVerified: new Date(),
    },
    {
      email: 'viewer1@vybes.com',
      password: hashedPassword,
      name: 'Emma Gialli',
      username: 'emma_viewer',
      role: 'DEFAULT' as const,
      bio: 'Appassionata d\'arte e cultura | Amo scoprire nuovi talenti ✨',
      location: 'Bologna, Italia',
      level: 2,
      experience: 180,
      reputation: 15,
      emailVerified: new Date(),
    },
    // Your account
    {
      email: 'buccadany@gmail.com',
      password: hashedPassword,
      name: 'Dany',
      username: 'dany',
      role: 'ARTIST' as const,
      bio: 'Artista e creatore di Vybes 🎨',
      location: 'Italia',
      level: 10,
      experience: 5000,
      reputation: 200,
      emailVerified: new Date(),
    },
  ]

  const createdUsers: Array<{ id: string; email: string }> = []
  for (const userData of users) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    })

    if (existingUser) {
      console.log(`⏭️  User ${userData.email} already exists, skipping...`)
      createdUsers.push(existingUser)
    } else {
      const user = await prisma.user.create({
        data: userData,
      })
      createdUsers.push(user)
      console.log(`✅ Created user: ${userData.email}`)
    }
  }

  console.log(`✅ Processed ${createdUsers.length} users`)

  console.log('🎉 Seeding completed!')
  console.log('\n📝 Account disponibili:')
  console.log('  - buccadany@gmail.com / password123 (Il tuo account)')
  console.log('  - artista1@vybes.com / password123')
  console.log('  - artista2@vybes.com / password123')
  console.log('  - artista3@vybes.com / password123')
  console.log('  - recruiter1@vybes.com / password123')
  console.log('  - recruiter2@vybes.com / password123')
  console.log('  - viewer1@vybes.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

