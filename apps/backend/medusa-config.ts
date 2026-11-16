import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      // customers stay signed in on their phone or laptop for a week
      jwtExpiresIn: "7d",
      // staff and customers can both sign in with email/password or Google
      authMethodsPerActor: { user: ["emailpass", "google"], customer: ["emailpass", "google"] },
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    // Our own modules
    { resolve: './src/modules/style-request' },
    { resolve: './src/modules/review' },
    { resolve: './src/modules/push-token' },

    // Notifications: branded emails through Resend, in-app push through Expo. Without a Resend key, emails are
    // only written to the server log (the local provider) so development works with no setup.
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          process.env.RESEND_API_KEY
            ? {
                resolve: './src/modules/resend-notification',
                id: 'resend',
                options: {
                  channels: ['email'],
                  apiKey: process.env.RESEND_API_KEY,
                  from: process.env.NOTIFICATION_FROM ?? 'Urban Men <onboarding@resend.dev>',
                },
              }
            : { resolve: '@medusajs/medusa/notification-local', id: 'local', options: { name: 'Local email log', channels: ['email'] } },
          { resolve: './src/modules/expo-push', id: 'expo', options: { channels: ['push'], accessToken: process.env.EXPO_ACCESS_TOKEN } },
        ],
      },
    },

    // Sign-in methods. Email + password always; Google ("Continue with Google" for customers) once the keys are set.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          {
            resolve: '@medusajs/medusa/auth',
            dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
            options: {
              providers: [
                { resolve: '@medusajs/medusa/auth-emailpass', id: 'emailpass' },
                {
                  resolve: '@medusajs/medusa/auth-google',
                  id: 'google',
                  options: {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    // where Google sends the customer back to; must be listed in the Google console and AUTH_CORS
                    callbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:3000/auth/google/callback',
                  },
                },
              ],
            },
          },
        ]
      : []),

    // Payments: Paystack (Mobile Money for Ghana). Only registered once the secret key is set,
    // so the backend still starts in development without it.
    ...(process.env.PAYSTACK_SECRET_KEY
      ? [
          {
            resolve: '@medusajs/medusa/payment',
            options: {
              providers: [
                {
                  resolve: './src/modules/paystack-payment',
                  id: 'momo',
                  options: { secretKey: process.env.PAYSTACK_SECRET_KEY },
                },
              ],
            },
          },
        ]
      : []),

    // Redis-backed infrastructure, used whenever REDIS_URL is set (local Redis in development, Upstash in production)
    ...(redisUrl
      ? [
          { resolve: '@medusajs/medusa/event-bus-redis', options: { redisUrl } },
          { resolve: '@medusajs/medusa/workflow-engine-redis', options: { redis: { redisUrl } } },
          { resolve: '@medusajs/medusa/cache-redis', options: { redisUrl } },
        ]
      : []),
  ],
})
