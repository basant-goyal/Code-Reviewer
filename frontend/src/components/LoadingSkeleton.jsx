/*
 * LoadingSkeleton.jsx — Shimmer Placeholder UI
 * ===============================================
 * WHY THIS FILE EXISTS:
 *   While the AI is thinking (could be 10-30 seconds), the page should not
 *   look frozen or broken. Skeleton loaders maintain layout and give visual
 *   feedback that something is happening.
 *
 * The shimmer animation is defined in index.css as the .shimmer utility class.
 * These placeholder divs mimic the layout of the real result components.
 */

function SkeletonBox({ className = '' }) {
  return (
    <div className={`shimmer rounded-xl ${className}`} />
  )
}

function SkeletonCard({ children }) {
  return (
    <div className="glass-card p-5">
      {children}
    </div>
  )
}

export default function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in">

      {/* Score card skeleton */}
      <SkeletonCard>
        <div className="flex items-center gap-6">
          <SkeletonBox className="w-24 h-24 rounded-full" />
          <div className="flex-1 flex flex-col gap-2">
            <SkeletonBox className="h-4 w-1/3" />
            <SkeletonBox className="h-3 w-full" />
            <SkeletonBox className="h-3 w-4/5" />
            <SkeletonBox className="h-3 w-2/3" />
          </div>
        </div>
        <div className="flex gap-3 mt-5 pt-5 border-t border-slate-200/60 dark:border-slate-700/60">
          <SkeletonBox className="h-12 w-40" />
          <SkeletonBox className="h-12 w-40" />
        </div>
      </SkeletonCard>

      {/* Bugs skeleton */}
      <SkeletonCard>
        <SkeletonBox className="h-4 w-32 mb-4" />
        <div className="flex flex-col gap-2">
          <SkeletonBox className="h-14 w-full" />
          <SkeletonBox className="h-14 w-full" />
        </div>
      </SkeletonCard>

      {/* Code skeleton */}
      <SkeletonCard>
        <SkeletonBox className="h-4 w-40 mb-4" />
        <div className="flex flex-col gap-1.5">
          <SkeletonBox className="h-3 w-3/4" />
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-5/6" />
          <SkeletonBox className="h-3 w-2/3" />
          <SkeletonBox className="h-3 w-4/5" />
          <SkeletonBox className="h-3 w-1/2" />
        </div>
      </SkeletonCard>

      {/* AI status message */}
      <div className="text-center py-2">
        <p className="text-sm text-slate-400 dark:text-slate-500 animate-pulse">
          Gemini is analysing your code. This usually takes 10–30 seconds...
        </p>
      </div>
    </div>
  )
}
