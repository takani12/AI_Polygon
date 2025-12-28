import React, { useState } from 'react';
import { ProblemInput } from './components/ProblemInput';
import { SpecViewer } from './components/SpecViewer';
import { TestGenerator } from './components/TestGenerator';
import { BugHunter } from './components/BugHunter';
import { parseProblemStatement, generateSmartTestCase, huntBug } from './services/geminiService';
import { ProblemSpec, TestCase, TestStrategy, BugHuntResult } from './types';
import { Layout, BrainCircuit, Bug as BugIcon, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [spec, setSpec] = useState<ProblemSpec | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [bugResult, setBugResult] = useState<BugHuntResult | null>(null);
  
  // Loading States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isHunting, setIsHunting] = useState(false);

  // Tool Tab State (Right Panel)
  const [toolTab, setToolTab] = useState<'tests' | 'hunter'>('tests');

  const handleAnalyze = async (text: string, imageBase64?: string, mimeType?: string) => {
    setIsAnalyzing(true);
    try {
      const result = await parseProblemStatement(text, imageBase64, mimeType);
      setSpec(result);
      setTestCases([]); 
      setBugResult(null);
    } catch (error) {
      console.error(error);
      alert("Phân tích thất bại: " + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateTest = async (strategy: TestStrategy, count: number) => {
    if (!spec) return;
    setIsGenerating(true);
    try {
      const newTestCases = await generateSmartTestCase(spec, strategy, count);
      setTestCases(prev => [...newTestCases, ...prev]);
    } catch (error) {
      console.error(error);
      alert("Tạo test thất bại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBugHunt = async (code: string) => {
    if (!spec) return;
    setIsHunting(true);
    try {
      const result = await huntBug(spec, code);
      setBugResult(result);
    } catch (error) {
      console.error(error);
      alert("Săn bug thất bại.");
    } finally {
      setIsHunting(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 font-sans text-slate-900 flex flex-col overflow-hidden">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 flex-shrink-0">
        <div className="max-w-[1920px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-1.5 rounded-lg shadow-sm">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-800">CP-AI Polygon</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
              Gemini 3 Pro + Vision
            </span>
          </div>
        </div>
      </header>

      {/* Main Layout - 3 Panes */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4 max-w-[1920px] mx-auto w-full">
        
        {/* LEFT PANE: Input (20%) */}
        <aside className="w-[300px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <ProblemInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </aside>

        {/* CENTER PANE: Spec Viewer (55%) - The Workspace */}
        <section className="flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 z-10"></div>
          <SpecViewer spec={spec} />
        </section>

        {/* RIGHT PANE: Tools (25%) */}
        <aside className="w-[380px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tool Switcher */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setToolTab('tests')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${toolTab === 'tests' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Layout className="w-4 h-4" /> Sinh Test
            </button>
            <button 
              onClick={() => setToolTab('hunter')}
              className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${toolTab === 'hunter' ? 'text-red-600 bg-red-50/50 border-b-2 border-red-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <BugIcon className="w-4 h-4" /> Stress Test
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative bg-slate-50/30">
            {toolTab === 'tests' ? (
              <TestGenerator 
                spec={spec} 
                onGenerate={handleGenerateTest} 
                testCases={testCases} 
                isGenerating={isGenerating} 
              />
            ) : (
              <BugHunter 
                spec={spec} 
                onHunt={handleBugHunt} 
                result={bugResult}
                isHunting={isHunting} 
              />
            )}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default App;