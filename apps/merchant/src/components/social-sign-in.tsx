import { Button } from "@nzc/ui/components/button"
import { useMutation } from "@tanstack/react-query"
import { useRouteContext, useSearch } from "@tanstack/react-router"
import React from "react"
import { DiscordIcon, GithubIcon, GoogleIcon } from "~/components/icons"
import { absoluteUrl } from "~/lib/utils"

export function SocialSignIn() {
  const search = useSearch({ from: "/_auth-layout" })
  const { orpc } = useRouteContext({ from: "/_auth-layout" })

  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [isGithubLoading, setIsGithubLoading] = React.useState(false)
  const [isDiscordLoading, setIsDiscordLoading] = React.useState(false)

  const redirectUrl = absoluteUrl(search.redirectPath)

  const { mutate: signInWithGoogle } = useMutation(
    orpc.auth.signInGoogle.mutationOptions({
      onSuccess: ({ authorizationUrl }) => {
        window.location.href = authorizationUrl
      },
    })
  )

  const { mutate: signInWithGithub } = useMutation(
    orpc.auth.signInGithub.mutationOptions({
      onSuccess: ({ authorizationUrl }) => {
        window.location.href = authorizationUrl
      },
    })
  )

  const { mutate: signInWithDiscord } = useMutation(
    orpc.auth.signInDiscord.mutationOptions({
      onSuccess: ({ authorizationUrl }) => {
        window.location.href = authorizationUrl
      },
    })
  )

  return (
    <div className="flex items-center justify-between space-x-2">
      <Button
        size="lg"
        variant="outline"
        onClick={() => {
          setIsGoogleLoading(true)
          signInWithGoogle({ redirectUrl })
        }}
        disabled={isGoogleLoading}
        className="bg-background-subtle px-4 grow"
        iconPosition="left"
        icon={<GoogleIcon />}
        loading={isGoogleLoading}
      >
        <span className="hidden sm:block">Google</span>
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => {
          setIsGithubLoading(true)
          signInWithGithub({ redirectUrl })
        }}
        disabled={isGithubLoading}
        className="bg-background-subtle px-4 grow"
        iconPosition="left"
        icon={<GithubIcon />}
        loading={isGithubLoading}
      >
        <span className="hidden sm:block">Github</span>
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={() => {
          setIsDiscordLoading(true)
          signInWithDiscord({ redirectUrl })
        }}
        disabled={isDiscordLoading}
        className="bg-background-subtle px-4 grow"
        iconPosition="left"
        icon={<DiscordIcon />}
        loading={isDiscordLoading}
      >
        <span className="hidden sm:block">Discord</span>
      </Button>
    </div>
  )
}
