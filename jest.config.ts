import type { Config } from 'jest';

const config: Config = {
    projects: [
        {
            displayName: 'nodejs',
            preset: 'ts-jest',
            testEnvironment: 'node',
            globals: {
                'ts-jest': {
                    tsconfig: 'tsconfig.json',
                },
            },
        },
        {
            displayName: 'browser',
            preset: 'ts-jest',
            testEnvironment: 'jsdom',
            globals: {
                'ts-jest': {
                    tsconfig: 'tsconfig.json',
                },
            },
        },
    ],
};

export default config;
