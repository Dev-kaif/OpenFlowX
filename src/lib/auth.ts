import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/db";
import {
  polar,
  checkout,
  portal,
} from "@polar-sh/better-auth";
import polarClient from "./polar";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [`${process.env.NEXT_PUBLIC_APP_URL}`, "http://localhost:3000",],
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "964286dd-fcce-4b1b-b96a-c28d5bc65af7",
              slug: "proMax",
            },
          ],
          successUrl: "/workflows",
          authenticatedUsersOnly: true,
        }),
        portal(),
      ],
    }),
  ],
});
