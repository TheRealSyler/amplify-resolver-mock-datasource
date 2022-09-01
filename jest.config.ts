import type { Config } from 'jest';

const c: Config = {
  rootDir: 'src',
  preset: 'ts-jest',
  testEnvironment: 'node',
  transformIgnorePatterns: [],
}

export default c