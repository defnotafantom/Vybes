import { prisma } from './prisma'

export async function createNotification(
  userId: string,
  type: 'message' | 'follow' | 'comment' | 'event' | 'quest',
  title: string,
  content: string,
  link?: string
) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        content,
        link,
      },
    })

    // In a real app, you'd emit a Socket.io event here
    // For now, clients will poll for notifications

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
      data: {
        read: true,
      },
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    })
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
  }
}

