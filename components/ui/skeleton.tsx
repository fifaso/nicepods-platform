/** ARCHIVE: components/ui/skeleton.tsx VERSION: 1.0 PROTOCOLO: MADRID RESONANCE V4.9 MISSION: UI Component INTEGRITY LEVEL: 100% */
import { classNamesUtility } from "@/lib/utils"

function Skeleton({
  className,
  ...componentProperties
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={classNamesUtility("animate-pulse rounded-md bg-muted", className)}
      {...componentProperties}
    />
  )
}

export { Skeleton }
