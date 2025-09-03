import type { Config } from 'jest';

const config: Config = {
    projects: [
        {
            displayName: 'nodejs',
            preset: 'ts-jest',
            testEnvironment: 'node',
            globals: {
                'ts-jest': {
                    tsconfig: 'tsconfig.json', // 👈 force Jest to use your tsconfig
                },
            },
        },
        {
            displayName: 'browser',
            preset: 'ts-jest',
            testEnvironment: 'jsdom',
            globals: {
                'ts-jest': {
                    tsconfig: 'tsconfig.json', // 👈 force Jest to use your tsconfig
                },
            },
        },
    ],
};

export default config;
