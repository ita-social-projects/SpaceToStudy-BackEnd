const { execSync } = require('child_process')
const os = require('os')
const fs = require('fs')
const path = require('path')

const isWindows = os.platform() === 'win32'
const mkcertCmd = isWindows ? 'mkcert.exe' : 'mkcert'
const sslPath = path.join(__dirname, 'src', 'initialization', 'ssl')

const execSafe = (cmd) => {
  try {
    execSync(cmd, { stdio: 'inherit' })
  } catch (err) {
    console.error(err.message)
    process.exit(1)
  }
}

const ensureMkcert = () => {
  try {
    execSync(`${mkcertCmd} --version`, { stdio: 'ignore' })
  } catch {
    if (isWindows) {
      console.warn('Please install mkcert manually from https://github.com/FiloSottile/mkcert/releases')
      process.exit(1)
    } else if (os.platform() === 'darwin') {
      execSafe('brew install mkcert nss')
    } else if (os.platform() === 'linux') {
      execSafe('sudo apt install -y libnss3-tools')
      execSafe(
        'sudo curl -L -o /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/latest/download/mkcert-linux-amd64'
      )
      execSafe('sudo chmod +x /usr/local/bin/mkcert')
    }
  }
}

const generateCerts = () => {
  if (!fs.existsSync(sslPath)) {
    fs.mkdirSync(sslPath)
  }

  execSafe(`${mkcertCmd} -install`)
  execSafe(
    `${mkcertCmd} -key-file ${path.join(sslPath, 'key.pem')} -cert-file ${path.join(
      sslPath,
      'cert.pem'
    )} localhost 127.0.0.1 ::1`
  )
}

ensureMkcert()
generateCerts()
