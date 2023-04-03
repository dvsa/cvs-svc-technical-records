module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  setupFiles: ['jest-plugin-context/setup'],
  moduleFileExtensions: ['js', 'ts'],
  testResultsProcessor: 'jest-sonar-reporter',
  testMatch: ['**/*.*Test.ts'],
  coverageDirectory: './coverage'
};
