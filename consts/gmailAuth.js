const requiredCredentials = {
  user: process.env.MAIL_USER,
  clientId: process.env.GMAIL_CLIENT_ID,
  clientSecret: process.env.GMAIL_CLIENT_SECRET,
  refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  redirectUri: process.env.GMAIL_REDIRECT_URI
}

module.exports = requiredCredentials
