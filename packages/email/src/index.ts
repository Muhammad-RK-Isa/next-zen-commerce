import type { SendMailOptions, Transporter } from "nodemailer";
import type React from "react";
import { render } from "@react-email/components";
import nodemailer from "nodemailer";

import { env } from "@nzc/env";

export const sendEmail = async ({
  from,
  to,
  subject,
  replyTo,
  react,
}: {
  from?: string;
  to: string;
  subject: string;
  replyTo?: string;
  react: React.JSX.Element;
}): Promise<SendMailOptions> => {
  try {
    if (env.NODE_ENV !== "production") {
      console.log(`Email sent to: ${to}`);
      return {};
    }

    const transporter: Transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: true,
      auth: {
        user: env.EMAIL_USERNAME,
        pass: env.EMAIL_PASSWORD,
      },
    });

    const htmlContent = await render(react);

    const info = (await transporter.sendMail({
      from: from ?? env.EMAIL_FROM,
      to,
      subject,
      replyTo: replyTo ?? env.EMAIL_SUPPORT,
      html: htmlContent,
    })) as SendMailOptions;

    return info;
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    env.NODE_ENV !== "production" &&
      console.error("Error sending email:", error);
    throw error;
  }
};
