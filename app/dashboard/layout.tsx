import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Sidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import { MinichatWrapper } from '@/components/chat/minichat-wrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth')
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-sky-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Sidebar - fixed position */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-30">
        <Sidebar />
      </div>
      
      {/* Main content area - with proper spacing for sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden w-full md:pl-[72px] transition-all duration-300 relative z-10">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="w-full max-w-full px-4 md:px-6 py-4 md:py-6">
            <MinichatWrapper>
              {children}
            </MinichatWrapper>
          </div>
        </main>
      </div>
    </div>
  )
}

