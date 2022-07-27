module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: [
        '<rootDir>/src',
        '<rootDir>/tests'
    ],
    setupFiles: [
        'jest-plugin-context/setup',
        "<rootDir>/jest-cucumber-config",
        "<rootDir>/jest-process-env.js"
    ],
    moduleFileExtensions: ['js', 'ts'],
    testResultsProcessor: 'jest-sonar-reporter',
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    },
    testMatch: ['**/*.unitTest.ts']
}
