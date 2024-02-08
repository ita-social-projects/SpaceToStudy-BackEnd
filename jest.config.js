module.exports = {
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1'
  },
  verbose: true,
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    '!<rootDir>/node_modules/*',
    '!<rootDir>/test/**/*',
    '!<rootDir>/app/consts/*',
    '!<rootDir>/app/configs/*',
    '!<rootDir>/docs/*',
    '!<rootDir>/app/emails/*',
    '!<rootDir>/*.json',
    '!<rootDir>/*.yaml'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['html', 'lcov'],
  coverageDirectory: '<rootDir>/test/coverage',
  testTimeout: 12000,
  testMatch: ['<rootDir>/test/integration/**/*.spec.js', '<rootDir>/test/unit/**/*.spec.js'],
  testResultsProcessor: 'jest-sonar-reporter'
}
