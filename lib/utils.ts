import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateLevel(experience: number): number {
  return Math.floor(experience / 100) + 1
}

export function calculateExperienceForLevel(level: number): number {
  return (level - 1) * 100
}

export function getExperienceProgress(experience: number): number {
  const level = calculateLevel(experience)
  const expForCurrentLevel = calculateExperienceForLevel(level)
  const expForNextLevel = calculateExperienceForLevel(level + 1)
  const expInCurrentLevel = experience - expForCurrentLevel
  const expNeededForNextLevel = expForNextLevel - expForCurrentLevel
  return (expInCurrentLevel / expNeededForNextLevel) * 100
}

