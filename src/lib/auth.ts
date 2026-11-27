import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { isAdminEmail } from "@/lib/admin-identity";
import { prisma } from "@/lib/prisma";

type AuthConfig = {
  secret: string;
  baseURL: string;
  adminEmail: string;
  clientId: string;
  clientSecret: string;
};

function createConfiguredAuth({
  secret,
  baseURL,
  adminEmail,
  clientId,
  clientSecret,
}: AuthConfig) {
  return betterAuth({
    appName: "Habita Querétaro Admin",
    baseURL,
    secret,
    trustedOrigins: [baseURL],
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    user: { modelName: "AuthUser" },
    session: { modelName: "AuthSession" },
    account: { modelName: "AuthAccount" },
    verification: { modelName: "AuthVerification" },
    socialProviders: {
      google: {
        clientId,
        clientSecret,
        prompt: "select_account",
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!isAdminEmail(user.email, adminEmail) || !user.emailVerified) {
              throw new APIError("FORBIDDEN", {
                message: "Esta cuenta no está autorizada para administrar el inventario.",
              });
            }
            return { data: user };
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

let authInstance: ReturnType<typeof createConfiguredAuth> | undefined;

export function getAuth() {
  if (authInstance) return authInstance;

  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL || process.env.SITE_URL;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.");
  }
  if (!baseURL) throw new Error("BETTER_AUTH_URL or SITE_URL must be configured.");
  if (!adminEmail || !clientId || !clientSecret) {
    throw new Error("Admin email and Google OAuth credentials are not configured.");
  }

  const configuredAuth = createConfiguredAuth({
    secret,
    baseURL,
    adminEmail,
    clientId,
    clientSecret,
  });
  authInstance = configuredAuth;
  return configuredAuth;
}
