import type { Config } from '@jest/types'

// Sync object
const config: Config.InitialOptions = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	collectCoverage: true,
	modulePathIgnorePatterns: [ 'dist' ],
	testPathIgnorePatterns: ['dist' ],
	coveragePathIgnorePatterns: [ 'dist' ],
}

export default config
