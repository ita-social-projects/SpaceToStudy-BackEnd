const config = {
  MONGODB_URL: process.env.MONGODB_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  SERVER_URL: process.env.SERVER_URL,
  SERVER_PORT: process.env.SERVER_PORT,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  JWT_RESET_SECRET: process.env.JWT_RESET_SECRET,
  JWT_RESET_EXPIRES_IN: process.env.JWT_RESET_EXPIRES_IN,
  JWT_CONFIRM_SECRET: process.env.JWT_CONFIRM_SECRET,
  JWT_CONFIRM_EXPIRES_IN: process.env.JWT_CONFIRM_EXPIRES_IN
}

const gmailCredentials = {
  user: process.env.MAIL_USER,
  clientId: process.env.GMAIL_CLIENT_ID,
  clientSecret: process.env.GMAIL_CLIENT_SECRET,
  refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  redirectUri: process.env.GMAIL_REDIRECT_URI
}

const superAdmin = {
  firstName: process.env.MAIL_FIRSTNAME,
  lastName: process.env.MAIL_LASTNAME,
  email: process.env.MAIL_USER,
  password: process.env.MAIL_PASS
}

const azureAccess = {
  STORAGE_ACCOUNT: process.env.STORAGE_ACCOUNT,
  ACCESS_KEY: process.env.ACCESS_KEY,
  AZURE_HOST: process.env.AZURE_HOST
}

module.exports = { config, gmailCredentials, superAdmin, azureAccess }
