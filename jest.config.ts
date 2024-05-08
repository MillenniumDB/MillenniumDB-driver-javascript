module.exports = {
    projects: [
        {
            displayName: 'nodejs',
            preset: 'ts-jest',
            testEnvironment: 'node',
        },
        {
            displayName: 'browser',
            preset: 'ts-jest',
            testEnvironment: 'jsdom',
        },
    ],
};
