import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import { resendClient } from "./resendClient";


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: true,
  },
  cookies: {
    secure: true,
    sameSite: "lax",
  },
  trustedOrigins: [`${process.env.NEXT_PUBLIC_APP_URL}`, "http://localhost:3000",],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resendClient.emails.send({
        from: "OpenFlowX <noreply@verify.openflowx.run>",
        to: user.email,
        subject: "Verify your email for OpenFlowX",
        text: `Verify your email:\n${url}\nIf you didn’t request this, ignore this message.`,
        html: `
<!doctype html>
<html lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Verify your email</title>
    <style>
      a { color: #10b981; text-decoration: none; }
      .container {
        max-width: 560px;
        margin: 0 auto;
        padding: 24px;
        font: 14px/1.6 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
        color:#0f172a;
      }
      .card {
        border:1px solid #e5e7eb;
        border-radius:14px;
        padding:28px;
        background:#ffffff;
      }
      .muted {
        color:#6b7280;
        font-size:12px;
      }
    </style>
  </head>
  <body style="background:#f9fafb;margin:0;">
    <div class="container">
      <div class="card">
        <h2 style="margin:0 0 8px;font-size:20px;">
          Verify your email
        </h2>

        <p style="margin:0 0 16px;">
          Hi ${user.name ?? ""},  
          confirm your email to activate your <strong>OpenFlowX</strong> account.
        </p>

        <p style="margin:0 0 22px;">
          <a
            href="${url}"
            target="_blank"
            rel="noopener"
            style="
              display:inline-block;
              padding:12px 22px;
              border-radius:10px;
              background: linear-gradient(
                135deg,
                hsl(168 76% 42%),
                hsl(160 82% 35%),
                hsl(156 68% 28%)
              );
              color:#ffffff;
              font-weight:600;
              text-decoration:none;
            "
          >
            Verify email →
          </a>
        </p>

        <p class="muted" style="margin:0 0 8px;">
          Button not working? Copy and paste this link into your browser:
        </p>

        <p style="word-break:break-all;margin:0 0 16px;">
          <a href="${url}" target="_blank" rel="noopener">
            ${url}
          </a>
        </p>

        <p class="muted" style="margin:0;">
          If you didn’t request this, you can safely ignore this email.
        </p>
      </div>

      <p class="muted" style="text-align:center;margin:16px 0 0;">
        © ${new Date().getFullYear()} OpenFlowX · openflowx.run
      </p>
    </div>
  </body>
</html>
    `,
      });
    }
  }
});
