import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { env } from "@nzc/env";

import { getStoreBaseUrl } from "../lib/utils";

interface EmailVerificationCodeProps {
  readonly code: string;
  readonly email: string;
  readonly expiryDate: number;
  readonly expiryDateUnit: "minute" | "hour" | "day" | "month";
}

export const EmailVerificationCode = ({
  code = "XXXXXX",
  email,
  expiryDate,
  expiryDateUnit,
}: EmailVerificationCodeProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>{code} is your verification code</Preview>
      <Body className="flex min-h-screen items-center justify-center bg-white text-center font-sans">
        <Container className="mx-auto w-full max-w-md rounded-lg border border-black bg-white p-6">
          <Img
            src={`${getStoreBaseUrl()}/static/pixiewear.svg`}
            className="mx-auto mb-12 h-8"
          />
          <Heading className="mt-4 text-xl font-semibold text-black">
            Your verification code
          </Heading>
          <Text className="mt-2 text-sm text-black">
            Use this code to verify your email or press the verify button. This
            code will expire in {expiryDate}{" "}
            {expiryDate > 1 ? expiryDateUnit + "s" : expiryDateUnit}.
          </Text>
          <Section className="mx-auto mt-6 max-w-sm rounded-md bg-gray-100 py-2">
            <Heading className="">{code}</Heading>
          </Section>
          <Section className="mt-6">
            <Button
              href={`${getStoreBaseUrl()}/verify-email?email=${email}?code=${code}`}
              className="mx-auto inline-block w-full max-w-sm rounded-lg bg-black py-4 font-medium text-white"
            >
              Verify
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
);

export default EmailVerificationCode;
