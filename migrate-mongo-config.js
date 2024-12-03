require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test.local' : '.env.local'
})
require('dotenv').config()

const config = {
  mongodb: {
    url: process.env.MONGODB_URL,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false,
  moduleSystem: 'commonjs'
}

module.exports = config
