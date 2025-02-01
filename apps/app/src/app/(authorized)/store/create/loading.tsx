import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@nzc/ui/components/card";
import { Skeleton } from "@nzc/ui/components/skeleton";

export default function Loading() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center bg-background bg-grid-black/[0.2] dark:bg-grid-white/[0.2]">
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <Card className="w-[24rem]">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
