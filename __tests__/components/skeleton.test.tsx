import { render, screen } from '@testing-library/react'
import { 
  Skeleton, 
  PostCardSkeleton, 
  FeedSkeleton, 
  EventCardSkeleton,
  UserCardSkeleton,
  ProfileSkeleton,
} from '@/components/ui/skeleton'

describe('Skeleton Components', () => {
  describe('Skeleton', () => {
    it('renders with default classes', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('animate-pulse')
      expect(skeleton).toHaveClass('rounded-md')
    })

    it('accepts custom className', () => {
      const { container } = render(<Skeleton className="h-10 w-20" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton).toHaveClass('h-10')
      expect(skeleton).toHaveClass('w-20')
    })
  })

  describe('PostCardSkeleton', () => {
    it('renders skeleton structure', () => {
      const { container } = render(<PostCardSkeleton />)
      // Should have multiple skeleton elements for header, content, image, actions
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(5)
    })
  })

  describe('FeedSkeleton', () => {
    it('renders default 3 post skeletons', () => {
      const { container } = render(<FeedSkeleton />)
      // Count the direct children of the feed container (PostCardSkeletons)
      const feedContainer = container.querySelector('.space-y-4')
      const postCards = feedContainer?.children || []
      expect(postCards.length).toBe(3)
    })

    it('renders custom count of post skeletons', () => {
      const { container } = render(<FeedSkeleton count={5} />)
      const feedContainer = container.querySelector('.space-y-4')
      const postCards = feedContainer?.children || []
      expect(postCards.length).toBe(5)
    })
  })

  describe('EventCardSkeleton', () => {
    it('renders event card structure', () => {
      const { container } = render(<EventCardSkeleton />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(5)
    })
  })

  describe('UserCardSkeleton', () => {
    it('renders user card structure', () => {
      const { container } = render(<UserCardSkeleton />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBe(4) // avatar, name, subtitle, button
    })
  })

  describe('ProfileSkeleton', () => {
    it('renders profile structure with stats', () => {
      const { container } = render(<ProfileSkeleton />)
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(10)
    })
  })
})


