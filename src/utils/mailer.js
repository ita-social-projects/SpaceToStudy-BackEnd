const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const logger = require('~/logger/logger')
const {
  gmailCredentials: { user, clientId, clientSecret, refreshToken, redirectUri }
} = require('~/configs/config')
const { createError } = require('~/utils/errorsHelper')
const { API_TOKEN_NOT_RETRIEVED, EMAIL_NOT_SENT } = require('~/consts/errors')

const OAuth2 = google.auth.OAuth2

const getAccessToken = async () => {
  try {
    const oAuth2Client = new OAuth2(clientId, clientSecret, redirectUri)

    oAuth2Client.setCredentials({ refresh_token: refreshToken })
    const accessToken = await oAuth2Client.getAccessToken()

    return accessToken
  } catch (err) {
    logger.error(err)
    throw createError(400, API_TOKEN_NOT_RETRIEVED)
  }
}

const createTransport = async () => {
  try {
    const accessToken = await getAccessToken()
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        type: 'OAuth2',
        user,
        clientId,
        clientSecret,
        refreshToken,
        accessToken
      }
    })

    return transporter
  } catch (err) {
    logger.error(err)
  }
}

const sendMail = async (mailOptions) => {
  try {
    const transporter = await createTransport()
    await transporter.verify()
    const result = await transporter.sendMail(mailOptions)
    transporter.close()

    return result
  } catch (err) {
    logger.error(err)
    throw createError(400, EMAIL_NOT_SENT)
  }
}

module.exports = { getAccessToken, createTransport, sendMail }
