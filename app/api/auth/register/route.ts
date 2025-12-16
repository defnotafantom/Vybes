import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: Request) {
  try {
    console.log('📥 Registration request received')
    
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not configured')
      return NextResponse.json(
        { 
          error: 'Database non configurato',
          details: 'Imposta DATABASE_URL nel file .env.local. Vedi .env.example per un esempio.'
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    console.log('📋 Request body:', { ...body, password: '[HIDDEN]' })
    
    const { name, email, password, role } = body

    // Validate input
    if (!email || !password || !name) {
      console.log('❌ Validation failed: missing fields')
      return NextResponse.json(
        { error: 'Email, password e nome sono richiesti' },
        { status: 400 }
      )
    }

    console.log('✅ Input validation passed')

    // Test database connection
    try {
      await prisma.$connect()
      console.log('✅ Database connection successful')
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError)
      return NextResponse.json(
        { 
          error: 'Impossibile connettersi al database',
          details: dbError instanceof Error ? dbError.message : 'Errore di connessione. Assicurati che il database sia avviato e che DATABASE_URL sia corretto.'
        },
        { status: 500 }
      )
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists...')
    let existingUser
    try {
      existingUser = await prisma.user.findUnique({
        where: { email },
      })
    } catch (dbError) {
      console.error('❌ Database query failed:', dbError)
      return NextResponse.json(
        { 
          error: 'Errore nel controllo utente esistente',
          details: dbError instanceof Error ? dbError.message : 'Il database potrebbe non essere inizializzato. Esegui: npm run db:push'
        },
        { status: 500 }
      )
    }

    if (existingUser) {
      console.log('❌ User already exists')
      return NextResponse.json(
        { error: 'Un utente con questa email esiste già' },
        { status: 400 }
      )
    }

    console.log('✅ User does not exist, proceeding...')

    // Hash password
    console.log('🔐 Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 10)
    console.log('✅ Password hashed')

    // Generate verification token
    console.log('🎫 Generating verification token...')
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expires = new Date()
    expires.setHours(expires.getHours() + 24) // 24 hours
    console.log('✅ Verification token generated')

    // Create user
    console.log('👤 Creating user in database...')
    let user
    try {
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || 'DEFAULT',
        },
      })
      console.log('✅ User created:', user.id)
    } catch (dbError: any) {
      console.error('❌ User creation failed:', dbError)
      
      // Check if it's a schema error
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: 'Email già registrata' },
          { status: 400 }
        )
      }
      
      if (dbError.message?.includes('Unknown arg') || dbError.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Schema database non aggiornato',
            details: 'Esegui: npm run db:push && npm run db:generate'
          },
          { status: 500 }
        )
      }
      
      throw dbError
    }

    // Create verification token
    console.log('💾 Saving verification token...')
    try {
      await prisma.verificationToken.create({
        data: {
          identifier: email,
          token: verificationToken,
          expires,
        },
      })
      console.log('✅ Verification token saved')
    } catch (tokenError) {
      console.error('⚠️ Token creation failed (continuing anyway):', tokenError)
      // Continue even if token fails - user can still login if emailVerified is set manually
    }

    // Send verification email
    console.log('📧 Sending verification email...')
    try {
      const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`
      await sendVerificationEmail(email, verificationUrl)
      console.log('✅ Verification email sent')
    } catch (emailError) {
      console.error('⚠️ Email sending failed (continuing anyway):', emailError)
      // Continue even if email fails - user can still login if emailVerified is set manually
    }

    console.log('✅ Registration completed successfully')
    return NextResponse.json(
      { 
        message: 'Utente creato con successo. Controlla la tua email per verificare l\'account.',
        userId: user.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Registration error:', error)
    return NextResponse.json(
      { 
        error: 'Errore durante la registrazione',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

