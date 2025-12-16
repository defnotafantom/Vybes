"use client"

import { MinichatProvider } from './minichat-provider'

export function MinichatWrapper({ children }: { children: React.ReactNode }) {
  return <MinichatProvider>{children}</MinichatProvider>
}

