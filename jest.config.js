module.exports = {
  roots: ['<rootDir>/test'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1'
  },
  verbose: true,
  testEnvironment: 'node',
  // collectCoverage: true,
  collectCoverageFrom: [
    '!<rootDir>/node_modules/',
    '!<rootDir>/test/',
    '!<rootDir>/consts/',
    '!<rootDir>/configs/',
    '!<rootDir>/docs/',
    '!<rootDir>/emails/',
    '!<rootDir>/*.js'
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
  testMatch: ['<rootDir>/test/unit/**/*.spec.js'],
  testResultsProcessor: 'jest-sonar-reporter'
}
