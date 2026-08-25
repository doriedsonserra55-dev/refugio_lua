export const ENV = {
  appId: process.env.VITE_APP_ID || process.env.EXPO_PUBLIC_APP_ID || "refugio-da-lua",
  cookieSecret: process.env.JWT_SECRET || "refugio_da_lua_jwt_secret_key_2026_prod_secure_32chars",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
