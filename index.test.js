const { filterMatches, renameFiles, checkProgress, processResponse, compileRules } = require('./index');
const { renameRules } = require('./config'); // Import renameRules from config

const compiledRenameRules = compileRules(renameRules); // Compile rules once

jest.mock('./config', () => ({
  renameRules: [
    {
      pattern: /\.PNG$/,
      newString: '.png'
    },
    {
      pattern: /\s/g,
      newString: '-'
    }
  ]
}));

const mockDbx = {
  filesSearchV2: jest.fn(),
  filesSearchContinueV2: jest.fn(),
  filesMoveBatchV2: jest.fn(),
  filesMoveBatchCheckV2: jest.fn(),
};

jest.mock('dropbox', () => ({
  Dropbox: jest.fn(() => mockDbx)
}));

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  jest.clearAllMocks();
});

describe('filterMatches', () => {
  it('should return a list of items to be renamed', () => {
    const items = [
      { metadata: { metadata: { name: 'test file.PNG', path_display: '/test file.PNG' } } },
      { metadata: { metadata: { name: 'nochange.png', path_display: '/nochange.png' } } }
    ];
    const result = filterMatches(items, compiledRenameRules);
    expect(result).toEqual([
      { from_path: '/test file.PNG', to_path: '/test-file.png' }
    ]);
  });

  it('should return an empty list if no items need to be renamed', () => {
    const items = [
      { metadata: { metadata: { name: 'nochange.png', path_display: '/nochange.png' } } }
    ];
    const result = filterMatches(items, compiledRenameRules);
    expect(result).toEqual([]);
  });

  it('should handle backreferences in newString using {{1}} syntax', () => {
    const items = [
      { metadata: { metadata: { name: 'file-123.txt', path_display: '/file-123.txt' } } }
    ];
    const rules = compileRules([
      { pattern: 'file-(\\d+)\\.txt', newString: 'document-{{1}}.txt' }
    ]);
    const result = filterMatches(items, rules);
    expect(result).toEqual([
      { from_path: '/file-123.txt', to_path: '/document-123.txt' }
    ]);
  });

  it('should not handle backreferences in newString using $1 syntax', () => {
    const items = [
      { metadata: { metadata: { name: 'file-123.txt', path_display: '/file-123.txt' } } }
    ];
    const rules = compileRules([
      { pattern: 'file-(\\d+)\\.txt', newString: 'document-$1.txt' }
    ]);
    const result = filterMatches(items, rules);
    expect(result).toEqual([
      { from_path: '/file-123.txt', to_path: '/document-$1.txt' }
    ]);
  });

  it('should handle backreferences in newString using {{0}} syntax for full match', () => {
    const items = [
      { metadata: { metadata: { name: 'file-123.txt', path_display: '/file-123.txt' } } }
    ];
    const rules = compileRules([
      { pattern: 'file-123', newString: '{{0}}-copy' }
    ]);
    const result = filterMatches(items, rules);
    expect(result).toEqual([
      { from_path: '/file-123.txt', to_path: '/file-123-copy.txt' }
    ]);
  });
});

describe('renameFiles', () => {
  it('should do nothing if there are no items to rename', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    await renameFiles(mockDbx, []);
    expect(consoleLogSpy).toHaveBeenCalledWith('0 items to rename');
    consoleLogSpy.mockRestore();
  });

  it('should call filesMoveBatchV2 and checkProgress', async () => {
    const itemsToRename = [{ from_path: '/a.PNG', to_path: '/a.png' }];
    mockDbx.filesMoveBatchV2.mockResolvedValue({ result: { async_job_id: '123' } });
    mockDbx.filesMoveBatchCheckV2.mockResolvedValue({ result: { '.tag': 'complete', entries: [] } });

    await renameFiles(mockDbx, itemsToRename);

    expect(mockDbx.filesMoveBatchV2).toHaveBeenCalledWith({ entries: itemsToRename });
    expect(mockDbx.filesMoveBatchCheckV2).toHaveBeenCalled();
  });
});

describe('checkProgress', () => {
  const jobId = '123';
  const items = [{ from_path: '/a.PNG', to_path: '/a.png' }];

  it('should return complete when job is done', async () => {
    mockDbx.filesMoveBatchCheckV2.mockResolvedValue({ result: { '.tag': 'complete', entries: [] } });
    const result = await checkProgress(mockDbx, jobId, items);
    expect(result['.tag']).toBe('complete');
  });

  it('should throw an error if job fails', async () => {
    mockDbx.filesMoveBatchCheckV2.mockResolvedValue({ result: { '.tag': 'failed' } });
    await expect(checkProgress(mockDbx, jobId, items)).rejects.toThrow('Job failed with status: failed');
  });
});

describe('processResponse', () => {
  beforeEach(() => {
    mockDbx.filesMoveBatchV2.mockResolvedValue({ result: { async_job_id: '123' } });
    mockDbx.filesMoveBatchCheckV2.mockResolvedValue({ result: { '.tag': 'complete', entries: [] } });
  });  

  it('should process a single page of results', async () => {
    const response = {
      result: {
        matches: [{ metadata: { metadata: { name: 'a file.PNG', path_display: '/a file.PNG' } } }],
        has_more: false
      }
    };
    
    await processResponse(mockDbx, response, compiledRenameRules, false); // Pass compiledRenameRules and isInteractive
    expect(mockDbx.filesMoveBatchV2).toHaveBeenCalled();
  });

  it('should handle pagination', async () => {
    const response1 = {
      result: {
        matches: [{ metadata: { metadata: { name: 'a file.PNG', path_display: '/a file.PNG' } } }],
        has_more: true,
        cursor: 'abc'
      }
    };
    const response2 = {
      result: {
        matches: [{ metadata: { metadata: { name: 'b file.PNG', path_display: '/b file.PNG' } } }],
        has_more: false
      }
    };
    mockDbx.filesSearchContinueV2.mockResolvedValue(response2);
    
    await processResponse(mockDbx, response1, compiledRenameRules, false); // Pass compiledRenameRules and isInteractive
    expect(mockDbx.filesSearchContinueV2).toHaveBeenCalledWith({ cursor: 'abc' });
    expect(mockDbx.filesMoveBatchV2).toHaveBeenCalledTimes(1); // Changed from 2 to 1
  });
});