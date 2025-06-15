import { render } from "@react-email/components"
import type { SendMailOptions, Transporter } from "nodemailer"
import nodemailer from "nodemailer"
import type React from "react"

import { env } from "./env"

export const sendEmail = async ({
  from,
  to,
  subject,
  replyTo,
  template,
}: {
  from?: string
  to: string
  subject: string
  replyTo?: string
  template: React.JSX.Element
}): Promise<SendMailOptions> => {
  if (env.NODE_ENV !== "production") {
    return {}
  }

  const transporter: Transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: true,
    auth: {
      user: env.EMAIL_USERNAME,
      pass: env.EMAIL_PASSWORD,
    },
  })

  const htmlContent = await render(template)

  const info = (await transporter.sendMail({
    from: from ?? env.EMAIL_FROM,
    to,
    subject,
    replyTo: replyTo ?? env.EMAIL_SUPPORT,
    html: htmlContent,
  })) as SendMailOptions

  return info
}
