export enum ConfidenceLevel {
  HIGH = 'Cao',
  MEDIUM = 'Trung Bình',
  LOW = 'Thấp'
}

export enum TestStrategy {
  SMALL = 'Test Nhỏ / Cơ Bản',
  MAX_CONSTRAINTS = 'Giới Hạn Lớn Nhất (Max)',
  EDGE_CASE = 'Test Biên (Min/Max)',
  OVERFLOW = 'Test Tràn Số (Overflow)',
  CORNER_CASE = 'Test Đặc Biệt (0, 1, -1)',
  RANDOM_UNIFORM = 'Ngẫu Nhiên (Uniform)',
  ANTI_GREEDY = 'Phá Giải Thuật Tham Lam',
}

export interface VariableSpec {
  name: string;
  type: string;
  description: string;
  constraints: string;
}

export interface ProblemSpec {
  title: string;
  summary: string;
  timeLimit: string;
  memoryLimit: string;
  inputFormat: string;
  outputFormat: string;
  variables: VariableSpec[];
  constraints: string[];
  edgeCasesAnalysis: string[];
  confidence: ConfidenceLevel;
  logicCheck: string; // Internal consistency check
}

export interface TestCase {
  id: string;
  strategy: TestStrategy;
  input: string;
  expectedOutput: string;
  explanation: string; // Why this test?
  generatedAt: number;
}

export interface AnalysisResult {
  isCorrect: boolean;
  message: string;
  diff?: string;
}

export type ProcessingStatus = 'idle' | 'analyzing' | 'generating_tests' | 'solving' | 'hunting';

export interface BugHuntResult {
  input: string;
  expectedOutput: string;
  actualOutput: string; // Simulated or inferred
  analysis: string;
}
