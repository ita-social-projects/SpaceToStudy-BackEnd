const swagger = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API for TeachMA',
      version: '1.0.0',
      description: 'TeachMA REST API'
    },
    servers: [
      {
        url: 'http://localhost:8080'
      }
    ]
  },
  apis: ['./docs/*.yaml']
}

module.exports = swagger