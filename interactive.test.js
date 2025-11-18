const { Command } = require('commander');
const { main, runInteractiveMode } = require('./index');
const prompt = require('prompt');
const { Dropbox } = require('dropbox');

jest.mock('prompt', () => ({
    start: jest.fn(),
    get: jest.fn(),
}));

const mockFilesMoveBatchV2 = jest.fn().mockResolvedValue({ result: { async_job_id: '12345' } });
const mockFilesMoveBatchCheckV2 = jest.fn().mockResolvedValue({
    result: {
        '.tag': 'complete',
        entries: [{ '.tag': 'success', success: { name: 'Test_File_1.txt' } }],
    },
});

jest.mock('dropbox', () => ({
    Dropbox: jest.fn(() => ({
        filesSearchV2: jest.fn().mockResolvedValue({
            result: {
                matches: [
                    {
                        metadata: {
                            metadata: {
                                name: 'Test-File-1.txt',
                                path_display: '/Test-File-1.txt',
                            },
                        },
                    },
                ],
                has_more: false,
            },
        }),
        filesSearchContinueV2: jest.fn(),
        filesMoveBatchV2: mockFilesMoveBatchV2,
        filesMoveBatchCheckV2: mockFilesMoveBatchCheckV2,
    })),
}));

describe('Interactive Rename Command', () => {
    let program;

    beforeEach(() => {
        program = new Command();
        program
            .version('2.1.0')
            .description('A CLI tool to batch rename files in Dropbox.')
            .command('rename')
            .description('Rename files based on rules from config.js or interactive prompts.')
            .option('-i, --interactive', 'Run in interactive mode.')
            .action(async (options) => {
                if (options.interactive) {
                    await runInteractiveMode();
                } else {
                    // In a real scenario, you might call runDefaultMode here
                }
            });

        jest.clearAllMocks();
    });

    it('should perform rename when user confirms', async () => {
        prompt.get
            .mockResolvedValueOnce({ query: 'Test' })
            .mockResolvedValueOnce({ pattern: '-', newString: '_' })
            .mockResolvedValueOnce({ pattern: '', newString: '' })
            .mockResolvedValueOnce({ confirm: 'y' });

        await program.parseAsync(['node', 'index.js', 'rename', '-i']);

        expect(mockFilesMoveBatchV2).toHaveBeenCalledTimes(1);
        expect(mockFilesMoveBatchCheckV2).toHaveBeenCalledTimes(1);
    });

    it('should cancel operation when user denies', async () => {
        prompt.get
            .mockResolvedValueOnce({ query: 'Test' })
            .mockResolvedValueOnce({ pattern: '-', newString: '_' })
            .mockResolvedValueOnce({ pattern: '', newString: '' })
            .mockResolvedValueOnce({ confirm: 'n' });

        await program.parseAsync(['node', 'index.js', 'rename', '-i']);

        expect(mockFilesMoveBatchV2).not.toHaveBeenCalled();
    });
});
