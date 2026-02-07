import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function LoginLoading() {
  return (
    <div className="container max-w-md py-12 px-4 sm:px-6 lg:px-8">
      <Card className="backdrop-blur-lg bg-card/80 border-muted/30">
        <CardHeader className="space-y-1">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-full" />

          <div className="space-y-4">
            <div className="relative flex justify-center">
              <Skeleton className="h-px w-full absolute top-1/2" />
              <div className="bg-card px-2">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
