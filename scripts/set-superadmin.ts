import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    console.error('Usage: npx ts-node scripts/set-superadmin.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { adminRole: 'SUPERADMIN' },
  })

  console.log(`✅ ${user.email} è ora SUPERADMIN`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
