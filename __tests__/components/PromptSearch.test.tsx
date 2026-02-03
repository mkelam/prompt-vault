import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PromptSearch } from '@/app/components/features/PromptSearch';
import { Prompt } from '@/lib/types';

const mockPrompts: Prompt[] = [
  {
    id: '1',
    title: 'SWOT Analysis',
    category: 'strategy',
    description: 'Strategic planning framework',
    template: 'Analyze {{company}} strengths, weaknesses, opportunities, threats',
    variables: [{ name: 'company', example: 'Acme Corp', description: 'Company name', required: true }],
    frameworks: ['SWOT'],
    estimatedTimeSaved: '30 min',
    tier: 'free',
    tags: [],
  },
  {
    id: '2',
    title: 'Project Charter',
    category: 'project-management',
    description: 'Project initialization document',
    template: 'Create a project charter for {{project_name}}',
    variables: [{ name: 'project_name', example: 'New Website', description: 'Project name', required: true }],
    frameworks: ['PMI'],
    estimatedTimeSaved: '45 min',
    tier: 'free',
    tags: [],
  },
  {
    id: '3',
    title: 'Balanced Scorecard',
    category: 'strategy',
    description: 'Performance management framework',
    template: 'Build a balanced scorecard for {{department}}',
    variables: [{ name: 'department', example: 'Sales', description: 'Department', required: true }],
    frameworks: ['BSC'],
    estimatedTimeSaved: '1 hour',
    tier: 'premium',
    tags: [],
  },
  {
    id: '4',
    title: 'Process Mapping',
    category: 'operations',
    description: 'Visualize business processes',
    template: 'Map the {{process_name}} process',
    variables: [{ name: 'process_name', example: 'Order fulfillment', description: 'Process name', required: true }],
    frameworks: ['BPMN'],
    estimatedTimeSaved: '2 hours',
    tier: 'free',
    tags: [],
  },
];

describe('PromptSearch', () => {
  const mockOnFilter = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render search input', () => {
      render(<PromptSearch prompts={mockPrompts} onFilter={mockOnFilter} />);

      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search for a prompt/i)).toBeInTheDocument();
    });

    it('should render category filter buttons', () => {
      render(<PromptSearch prompts={mockPrompts} onFilter={mockOnFilter} />);

      expect(screen.getByText('all')).toBeInTheDocument();
      expect(screen.getByText('strategy')).toBeInTheDocument();
      expect(screen.getByText('project management')).toBeInTheDocument();
      expect(screen.getByText('operations')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes for accessibility', () => {
      render(<PromptSearch prompts={mockPrompts} onFilter={mockOnFilter} />);

      expect(screen.getByRole('search')).toHaveAttribute('aria-label', 'Search prompts');
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Filter by category');
    });
  });

  describe('search functionality', () => {
    it('should call onFilter with all prompts initially', () => {
      render(<PromptSearch prompts={mockPrompts} onFilter={mockOnFilter} />);

      expect(mockOnFilter).toHaveBeenCalledWith(mockPrompts);
    });

    it('should filter prompts by search query', async () => {
      render(<PromptSearch prompts={mockPrompts} onFilter={mockOnFilter} />);

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'SWOT' } });

      await waitFor(() => {
        const lastCall = mockOnFilter.mock.calls.slice(-1)[0][0];
        expect(lastCall.some((p: Prompt) => p.title === 'SWOT Analysis')).toBe(true);
      });
    });

    it('should filter prompts by description', async () => {
      render(<PromptSearch prompts={mockPrompts} onFilter={mockOnFilter} />);

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'initialization' } });

      await waitFor(() => {
        const lastCall = mockOnFilter.mock.calls.slice(-1)[0][0];
        expect(lastCall.some((p: Prompt) => p.title === 'Project Charter')).toBe(true);
      });
    });
  });

  describe('category filtering', () => {
    it('should filter by category when category button is clicked', async () => {
      render(<PromptSearch prompts={mockPrompts} onFilter={mockOnFilter} />);

      const strategyButton = screen.getByText('strategy');
      fireEvent.click(strategyButton);

      await waitFor(() => {
        const lastCall = mockOnFilter.mock.calls.slice(-1)[0][0];
        expect(lastCall.every((p: Prompt) => p.category === 'strategy')).toBe(true);
        expect(lastCall.length).toBe(2); // SWOT and Balanced Scorecard
      });
    });

    it('should show all prompts when "all" category is selected', async () => {
      render(<PromptSearch prompts={mockPrompts} onFilter={mockOnFilter} />);

      // First click strategy
      fireEvent.click(screen.getByText('strategy'));

      // Then click all
      fireEvent.click(screen.getByText('all'));

      await waitFor(() => {
        const lastCall = mockOnFilter.mock.calls.slice(-1)[0][0];
        expect(lastCall.length).toBe(4);
      });
    });

    it('should apply aria-pressed attribute to active category', () => {
      render(<PromptSearch prompts={mockPrompts} onFilter={mockOnFilter} />);

      const allButton = screen.getByText('all');
      expect(allButton).toHaveAttribute('aria-pressed', 'true');

      fireEvent.click(screen.getByText('strategy'));

      expect(screen.getByText('strategy')).toHaveAttribute('aria-pressed', 'true');
      expect(allButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('combined search and category filtering', () => {
    it('should combine search query and category filter', async () => {
      render(<PromptSearch prompts={mockPrompts} onFilter={mockOnFilter} />);

      // Select strategy category
      fireEvent.click(screen.getByText('strategy'));

      // Search for "scorecard"
      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'scorecard' } });

      await waitFor(() => {
        const lastCall = mockOnFilter.mock.calls.slice(-1)[0][0];
        expect(lastCall.length).toBe(1);
        expect(lastCall[0].title).toBe('Balanced Scorecard');
      });
    });
  });
});
