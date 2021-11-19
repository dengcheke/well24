/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    globals:{
        tsconfig: {
            "target": "es6",
            "lib": ["dom"],
            "module": "es6",
            "moduleResolution": "node",
            "declaration": true,
            "noEmit": true,
            "esModuleInterop": true,
            "strict": true,
            "skipLibCheck": true
        }
    },
    collectCoverage:true,
    coverageDirectory:'coverage',
    coverageProvider:"v8",
    coverageReporters:['html', 'lcov', 'text','json'],
    collectCoverageFrom:[
        '<rootDir>/packages/*/src/**/*.ts',
        "!**/dist/**" ,
    ],
    rootDir:__dirname,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    testMatch:["<rootDir>/packages/**/__tests__/**/*\.(spec|test).[jt]s?(x)"]
};
