import { Spinner } from "@nzc/ui/components/spinner"
import React from "react"

export const CircularProgressIcon = ({ progress }: { progress: number }) => {
  const [showLoader, setShowLoader] = React.useState(false)
  const isComplete = progress >= 100

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>
    if (isComplete) {
      timeout = setTimeout(() => {
        setShowLoader(true)
      }, 500)
    } else {
      setShowLoader(false)
    }

    return () => clearTimeout(timeout)
  }, [isComplete])

  const radius = 10
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - progress / 100)

  return (
    <div className="relative w-4 h-4">
      {showLoader ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner barClassName="text-primary" />
        </div>
      ) : (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          className="transform -rotate-90"
        >
          <circle
            cx="12"
            cy="12"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity="0.2"
          />

          <circle
            cx="12"
            cy="12"
            r={radius}
            fill="none"
            className="stroke-primary transition-all duration-300 ease-out"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  )
}
