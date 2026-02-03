export interface PromptVariable {
  name: string;
  description: string;
  example: string;
  required: boolean;
}

export type PromptCategory = 
  | 'strategy'
  | 'project-management' 
  | 'operations' 
  | 'business-analysis' 
  | 'financial' 
  | 'hr-talent' 
  | 'sales';

export interface Prompt {
  id: string;
  title: string;
  description: string;
  template: string;
  variables: PromptVariable[];
  category: PromptCategory;
  frameworks: string[];
  tier: 'free' | 'premium';
  tags: string[];
  estimatedTimeSaved: string;
}
