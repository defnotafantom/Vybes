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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-sky-50/50 to-blue-50/30 dark:from-gray-950 dark:via-slate-900 dark:to-gray-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-sky-400/8 via-blue-400/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-400/8 via-indigo-400/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-sky-200/5 to-transparent rounded-full blur-3xl"></div>
      </div>
      
      {/* Sidebar - fixed position */}
      <div className="hidden md:block fixed left-0 top-0 h-full z-30">
        <Sidebar />
      </div>
      
      {/* Main content area - with proper spacing for sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden w-full md:pl-[72px] transition-all duration-300 relative z-10">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto w-full scrollbar-thin">
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


