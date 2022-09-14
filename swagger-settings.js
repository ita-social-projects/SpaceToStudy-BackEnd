const swagger = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express API for space2study',
      version: '1.0.0',
      description: 'space2study REST API'
    },
    servers: [
      {
        url: 'http://localhost:8080'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'Enter JWT Bearer Token',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./docs/**/*.yaml']
}

module.exports = swagger
