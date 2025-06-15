import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"
import { StoreIcon } from "lucide-react"

import { env } from "../env"

interface EmailSignInCodeProps {
  code: string
  email: string
  expiryDate: number
  expiryDateUnit: "minute" | "hour" | "day" | "month"
}

export const EmailSignInCode = ({
  code = "XXXXXX",
  email,
  expiryDate,
  expiryDateUnit,
}: EmailSignInCodeProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>{code} is your sign-in code</Preview>
      <Body className="flex min-h-screen items-center justify-center bg-white text-center font-sans">
        <Container className="mx-auto w-full max-w-md rounded-lg border border-black bg-white p-6">
          <Section className="size-max rounded-full border-2 p-1">
            <StoreIcon className="mx-auto size-8" />
          </Section>
          <Heading className="mt-4 text-xl font-semibold text-black">
            Your sign-in code
          </Heading>
          <Text className="mt-2 text-sm text-black">
            Use this code to sign in to your account or press the sign in
            button. This code will expire in {expiryDate}{" "}
            {expiryDate > 1 ? `${expiryDateUnit}s` : expiryDateUnit}.
          </Text>
          <Section className="mx-auto mt-6 max-w-sm rounded-md bg-gray-100">
            <Heading className="text-2xl tracking-widest">{code}</Heading>
          </Section>
          <Section className="mt-4">
            <Button
              href={`${env.MERCHANT_URL}/sign-in/verify-code?identifier=${email}&code=${code}`}
              className="mx-auto inline-block w-full max-w-sm rounded-lg bg-black py-4 text-xl font-medium text-white"
            >
              Sign in
            </Button>
          </Section>
          <Text className="mt-6 text-sm text-gray-700">
            Ignore this email if you did not request this code.
          </Text>
          <Text className="text-sm text-gray-700">
            Contact{" "}
            <Link
              href={`mailto:${env.EMAIL_CONTACT}`}
              className="text-black underline"
            >
              {env.EMAIL_CONTACT}
            </Link>{" "}
          </Text>
        </Container>
      </Body>
    </Html>
  </Tailwind>
)

export default EmailSignInCode
