import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest/presets/default-esm',
    testEnvironment: 'node',

    // OLHA SOMENTE PARA A PASTA TESTS
    roots: ['<rootDir>/tests'],

    testMatch: ['**/*.spec.ts'],

    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
    ],

    extensionsToTreatAsEsm: ['.ts'],

    transform: {
        '^.+\\.ts$': [
        'ts-jest',
        {
            useESM: true,
            isolatedModules: true, // EVITA CARREGAR O PROJETO INTEIRO
        },
        ],
    },

    moduleFileExtensions: ['ts', 'js', 'json'],

    clearMocks: true,

    // REDUZ CONSUMO DE MEMÓRIA
    maxWorkers: 1,
};

export default config;