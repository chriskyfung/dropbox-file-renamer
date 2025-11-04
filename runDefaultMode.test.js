const path = require('path');

// We need to mock these at the top level before they are required by index.js
const mockDbx = {
    filesSearchV2: jest.fn(),
    filesSearchContinueV2: jest.fn(),
    filesMoveBatchV2: jest.fn(),
    filesMoveBatchCheckV2: jest.fn(),
};

jest.mock('dropbox', () => ({
    Dropbox: jest.fn(() => mockDbx),
}));

// Mock prompt
jest.mock('prompt', () => ({
    start: jest.fn(),
    get: jest.fn(),
}));

describe('runDefaultMode', () => {
    let runDefaultMode;

    beforeEach(() => {
        jest.resetModules(); // This is key to allow different mocks for require
        jest.clearAllMocks();
        // Re-require runDefaultMode for each test to get fresh modules
        runDefaultMode = require('./index').runDefaultMode;
    });

    it('should use default config when no options are provided', async () => {
        // Mock default config
        jest.doMock('./config.js', () => ({
            query: 'default-query',
            searchOptions: { 'max_results': 100 },
            renameRules: []
        }), { virtual: true });

        mockDbx.filesSearchV2.mockResolvedValue({ result: { matches: [], has_more: false } });
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        await runDefaultMode();

        expect(consoleLogSpy).toHaveBeenCalledWith('Running in default mode using ./config.js...');
        expect(mockDbx.filesSearchV2).toHaveBeenCalledWith({ query: 'default-query', options: { 'max_results': 100 } });
        
        consoleLogSpy.mockRestore();
    });

    it('should use custom config when provided', async () => {
        const customConfigPath = path.resolve('./custom-config.js');
        const mockCustomConfig = {
            query: 'custom-query',
            searchOptions: { 'max_results': 50 },
            renameRules: []
        };

        jest.doMock(customConfigPath, () => mockCustomConfig, { virtual: true });
        mockDbx.filesSearchV2.mockResolvedValue({ result: { matches: [], has_more: false } });
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

        await runDefaultMode({ config: customConfigPath });

        expect(consoleLogSpy).toHaveBeenCalledWith(`Running in default mode using ${customConfigPath}...`);
        expect(mockDbx.filesSearchV2).toHaveBeenCalledWith({ query: 'custom-query', options: { 'max_results': 50 } });

        consoleLogSpy.mockRestore();
    });

    it('should exit with error when custom config is not found', async () => {
        const nonExistentPath = './non-existent-config.js';
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code) => {
            throw new Error(`process.exit called with ${code}`);
        });

        await expect(runDefaultMode({ config: nonExistentPath })).rejects.toThrow('process.exit called with 1');

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Cannot find module'));
        expect(processExitSpy).toHaveBeenCalledWith(1);

        consoleErrorSpy.mockRestore();
        processExitSpy.mockRestore();
    });
});
