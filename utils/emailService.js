const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const logger = require('~/logger/logger')
const requiredCredentials = require('~/consts/gmailAuth')

const OAuth2 = google.auth.OAuth2

const getAccessToken = async () => {
  try {
    const oAuth2Client = new OAuth2(
      requiredCredentials.clientId,
      requiredCredentials.clientSecret,
      requiredCredentials.redirectUri
    )

    oAuth2Client.setCredentials({ refresh_token: requiredCredentials.refreshToken })
    const accessToken = await oAuth2Client.getAccessToken()

    return accessToken
  } catch (err) {
    logger.error(err)
    throw err
  }
}

const createTransport = async () => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        type: 'OAuth2',
        user: requiredCredentials.user,
        clientId: requiredCredentials.clientId,
        clientSecret: requiredCredentials.clientSecret,
        refreshToken: requiredCredentials.refreshToken,
        accessToken: await getAccessToken()
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
  }
}

module.exports = { getAccessToken, createTransport, sendMail }
