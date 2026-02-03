import { Prompt } from '@/lib/types';

// Mock file-saver
jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}));

// Mock xlsx
jest.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: jest.fn(() => ({})),
    sheet_add_aoa: jest.fn(),
    book_new: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

import { exportToMarkdown, exportToExcel } from '@/lib/export';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const mockPrompt: Prompt = {
  id: 'test-prompt-1',
  title: 'Test SWOT Analysis',
  category: 'strategy',
  description: 'A test SWOT analysis prompt',
  template: 'Analyze {{company_name}} using SWOT framework for {{industry}} industry.',
  variables: [
    { name: 'company_name', example: 'Acme Corp', description: 'Company name', required: true },
    { name: 'industry', example: 'Technology', description: 'Industry sector', required: false },
  ],
  frameworks: ['SWOT', 'Strategic Planning'],
  estimatedTimeSaved: '30 min',
  tier: 'free',
  tags: [],
};

describe('exportToMarkdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export prompt to markdown with filled variables', () => {
    const variables = { company_name: 'Tesla', industry: 'Automotive' };

    exportToMarkdown(mockPrompt, variables);

    expect(saveAs).toHaveBeenCalledTimes(1);
    const [blob, filename] = (saveAs as unknown as jest.Mock).mock.calls[0];

    expect(filename).toBe('Test_SWOT_Analysis.md');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/markdown;charset=utf-8');
  });

  it('should export prompt with unfilled variables preserved', () => {
    const variables = { company_name: 'Tesla' };

    exportToMarkdown(mockPrompt, variables);

    expect(saveAs).toHaveBeenCalledTimes(1);
  });

  it('should handle empty variables', () => {
    exportToMarkdown(mockPrompt, {});

    expect(saveAs).toHaveBeenCalledTimes(1);
  });

  it('should replace spaces in filename with underscores', () => {
    exportToMarkdown(mockPrompt, {});

    const [, filename] = (saveAs as unknown as jest.Mock).mock.calls[0];
    expect(filename).not.toContain(' ');
    expect(filename).toBe('Test_SWOT_Analysis.md');
  });
});

describe('exportToExcel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export prompt to Excel with filled variables', () => {
    const variables = { company_name: 'Tesla', industry: 'Automotive' };

    exportToExcel(mockPrompt, variables);

    expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      'BizPrompt Export'
    );
    expect(XLSX.writeFile).toHaveBeenCalledWith(
      expect.anything(),
      'Test_SWOT_Analysis.xlsx'
    );
  });

  it('should include metadata in the worksheet', () => {
    const variables = { company_name: 'Tesla' };

    exportToExcel(mockPrompt, variables);

    const metadataCall = (XLSX.utils.aoa_to_sheet as jest.Mock).mock.calls[0][0];

    // Check metadata structure
    expect(metadataCall[0]).toEqual(['Prompt Title', 'Test SWOT Analysis']);
    expect(metadataCall[1]).toEqual(['Category', 'strategy']);
    expect(metadataCall[2]).toEqual(['Description', 'A test SWOT analysis prompt']);
    expect(metadataCall[3]).toEqual(['Frameworks', 'SWOT, Strategic Planning']);
  });

  it('should handle empty variables', () => {
    exportToExcel(mockPrompt, {});

    expect(XLSX.writeFile).toHaveBeenCalled();
  });

  it('should add filled prompt content to worksheet', () => {
    const variables = { company_name: 'Tesla', industry: 'Automotive' };

    exportToExcel(mockPrompt, variables);

    expect(XLSX.utils.sheet_add_aoa).toHaveBeenCalled();
    const addedContent = (XLSX.utils.sheet_add_aoa as jest.Mock).mock.calls[0][1];
    expect(addedContent[0][0]).toContain('Tesla');
    expect(addedContent[0][0]).toContain('Automotive');
  });
});
