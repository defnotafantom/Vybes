import { prisma } from './prisma'
import { calculateLevel } from './utils'

function getCoinsReward(questType: string): number {
  switch (questType) {
    case 'first_post':
      return 10
    case 'first_portfolio':
      return 25
    case 'first_event':
      return 20
    case 'join_event':
      return 5
    case 'profile_complete':
      return 15
    case 'collaboration':
      return 50
    default:
      return 0
  }
}

export async function updateQuestProgress(userId: string, questType: string, increment: boolean = true) {
  try {
    const quest = await prisma.quest.findFirst({
      where: { type: questType },
    })

    if (!quest) {
      console.log(`Quest ${questType} not found`)
      return
    }

    let progress = await prisma.questProgress.findUnique({
      where: {
        questId_userId: {
          questId: quest.id,
          userId,
        },
      },
    })

    if (!progress) {
      // Create new progress entry
      progress = await prisma.questProgress.create({
        data: {
          questId: quest.id,
          userId,
          progress: increment ? 1 : 0,
          maxProgress: questType === 'profile_complete' ? 3 : 1, // profile_complete needs 3 fields: name, bio, image
          completed: false,
        },
      })
    } else if (!progress.completed) {
      const newProgress = increment ? progress.progress + 1 : Math.max(0, progress.progress - 1)
      const completed = newProgress >= progress.maxProgress

      await prisma.questProgress.update({
        where: { id: progress.id },
        data: {
          progress: newProgress,
          completed,
          completedAt: completed ? new Date() : null,
        },
      })

      if (completed) {
        // Award experience, reputation, and coins
        const coinsReward = getCoinsReward(questType)
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            experience: { increment: quest.experienceReward },
            reputation: { increment: quest.reputationReward },
            coins: coinsReward > 0 ? { increment: coinsReward } : undefined,
          },
          select: {
            experience: true,
            level: true,
            coins: true,
          },
        })

        // Create transaction record for coins
        if (coinsReward > 0) {
          await prisma.transaction.create({
            data: {
              userId,
              type: 'quest_reward',
              amount: coinsReward,
              description: `Ricompensa quest: ${questType}`,
              metadata: JSON.stringify({ questType, experienceReward: quest.experienceReward }),
            },
          })
        }

        // Calculate and update level if needed
        const newLevel = calculateLevel(updatedUser.experience)
        if (newLevel > updatedUser.level) {
          await prisma.user.update({
            where: { id: userId },
            data: { level: newLevel },
          })
        }
      }
    }
  } catch (error) {
    console.error(`Error updating quest progress for ${questType}:`, error)
  }
}

export async function checkProfileComplete(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        bio: true,
        image: true,
      },
    })

    if (!user) return

    let completedFields = 0
    if (user.name) completedFields++
    if (user.bio) completedFields++
    if (user.image) completedFields++

    const quest = await prisma.quest.findFirst({
      where: { type: 'profile_complete' },
    })

    if (!quest) return

    let progress = await prisma.questProgress.findUnique({
      where: {
        questId_userId: {
          questId: quest.id,
          userId,
        },
      },
    })

    if (!progress) {
      await prisma.questProgress.create({
        data: {
          questId: quest.id,
          userId,
          progress: completedFields,
          maxProgress: 3,
          completed: completedFields >= 3,
          completedAt: completedFields >= 3 ? new Date() : null,
        },
      })

      if (completedFields >= 3) {
        // Award rewards including coins
        const coinsReward = getCoinsReward('profile_complete')
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            experience: { increment: quest.experienceReward },
            reputation: { increment: quest.reputationReward },
            coins: coinsReward > 0 ? { increment: coinsReward } : undefined,
          },
          select: {
            experience: true,
            level: true,
          },
        })

        const newLevel = calculateLevel(updatedUser.experience)
        if (newLevel > updatedUser.level) {
          await prisma.user.update({
            where: { id: userId },
            data: { level: newLevel },
          })
        }
      }
    } else if (!progress.completed) {
      const completed = completedFields >= 3
      await prisma.questProgress.update({
        where: { id: progress.id },
        data: {
          progress: completedFields,
          completed,
          completedAt: completed ? new Date() : null,
        },
      })

      if (completed) {
        // Award rewards including coins
        const coinsReward = getCoinsReward('profile_complete')
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            experience: { increment: quest.experienceReward },
            reputation: { increment: quest.reputationReward },
            coins: coinsReward > 0 ? { increment: coinsReward } : undefined,
          },
          select: {
            experience: true,
            level: true,
          },
        })

        const newLevel = calculateLevel(updatedUser.experience)
        if (newLevel > updatedUser.level) {
          await prisma.user.update({
            where: { id: userId },
            data: { level: newLevel },
          })
        }
      }
    }
  } catch (error) {
    console.error('Error checking profile complete:', error)
  }
}

