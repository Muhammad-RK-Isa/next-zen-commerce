import { Image as UnImage } from "@unpic/react/base"
import type React from "react"
import { transform } from "unpic/providers/nextjs"

interface WithWidthAndAspectRatio {
  src: string
  alt: string
  className?: string
  layout?: "fixed" | "constrained" | "fullWidth"
  aspectRatio: number
  width: number
  height?: never
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void
  loading?: "eager" | "lazy"
}

interface WithHeightAndAspectRatio {
  src: string
  alt: string
  className?: string
  layout?: "fixed" | "constrained" | "fullWidth"
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void
  loading?: "eager" | "lazy"
  aspectRatio: number
  height: number
  width?: never
}

interface WithHeightWidth {
  src: string
  alt: string
  className?: string
  layout?: "fixed" | "constrained" | "fullWidth"
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void
  loading?: "eager" | "lazy"
  width: number
  height: number
  aspectRatio?: never
}

type ImageProps =
  | WithHeightWidth
  | WithWidthAndAspectRatio
  | WithHeightAndAspectRatio

export const Image = ({ layout = "constrained", ...props }: ImageProps) => (
  <UnImage
    {...props}
    transformer={(url, operations, _) =>
      transform(url, operations, {
        baseUrl: import.meta.env.VITE_IMAGE_OPTIMIZATION_SERVER_URL,
      })
    }
    layout="constrained"
    unselectable="on"
  />
)
