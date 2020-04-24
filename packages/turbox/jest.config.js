module.exports = {
  roots: ['src/'],
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest'
  },
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.(spec|test).(js|ts)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'text-summary'],
  globals: {
    window: {}
  }
}
