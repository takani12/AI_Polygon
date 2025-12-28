import React, { useState } from 'react';
import { ProblemSpec, TestStrategy, TestCase } from '../types';
import { Play, Copy, Terminal, Hash, FileCode } from 'lucide-react';

interface TestGeneratorProps {
  spec: ProblemSpec | null;
  onGenerate: (strategy: TestStrategy, count: number) => void;
  testCases: TestCase[];
  isGenerating: boolean;
}

export const TestGenerator: React.FC<TestGeneratorProps> = ({ spec, onGenerate, testCases, isGenerating }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<TestStrategy>(TestStrategy.SMALL);
  const [countStr, setCountStr] = useState<string>("5");

  if (!spec) return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
          <Terminal className="w-10 h-10 mb-2 opacity-20" />
          <p className="text-sm">Hãy phân tích đề bài trước khi sinh test.</p>
      </div>
  );

  const handleGenerateClick = () => {
    let val = parseInt(countStr);
    if (isNaN(val) || val < 1) val = 1;
    if (val > 20) val = 20;
    setCountStr(val.toString());
    onGenerate(selectedStrategy, val);
  };

  return (
    <div className="h-full flex flex-col p-4">
      {/* Controls */}
      <div className="mb-4 space-y-3">
        <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Chiến Lược</label>
            <select 
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value as TestStrategy)}
                className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
                {Object.values(TestStrategy).map(s => (
                <option key={s} value={s}>{s}</option>
                ))}
            </select>
        </div>
        
        <div className="flex gap-2">
             <div className="relative w-20 flex-shrink-0">
                <input
                    type="number"
                    min="1" max="20"
                    value={countStr}
                    onChange={(e) => setCountStr(e.target.value)}
                    className="w-full pl-3 pr-2 py-2 border border-slate-200 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="SL"
                />
            </div>
            <button
                onClick={handleGenerateClick}
                disabled={isGenerating}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
                {isGenerating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Play className="w-4 h-4 fill-current" />}
                Sinh Test
            </button>
        </div>
      </div>

      {/* Test List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-2 space-y-3 pb-4">
        {testCases.length === 0 && (
          <div className="text-center text-slate-400 py-8 border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-xs">Chưa có bộ test nào.</p>
          </div>
        )}
        
        {testCases.map((tc, index) => (
          <div key={tc.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-300 transition-colors group">
            <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-slate-100">
                Test #{testCases.length - index}
              </span>
              <button 
                onClick={() => navigator.clipboard.writeText(tc.input)}
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="Copy Input"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="p-3 space-y-2">
                <div>
                    <div className="text-[10px] font-semibold text-slate-400 mb-1">INPUT</div>
                    <div className="bg-slate-50 border border-slate-100 rounded p-2">
                         <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap break-all line-clamp-3 group-hover:line-clamp-none transition-all">{tc.input}</pre>
                    </div>
                </div>
                 <div>
                    <div className="text-[10px] font-semibold text-slate-400 mb-1">OUTPUT CHUẨN</div>
                    <div className="bg-slate-900 border border-slate-800 rounded p-2">
                         <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap break-all">{tc.expectedOutput}</pre>
                    </div>
                </div>
            </div>
            <div className="px-3 py-2 bg-amber-50/50 border-t border-slate-50 text-[11px] text-amber-800 leading-tight">
               {tc.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
