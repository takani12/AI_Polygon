import React, { useState } from 'react';
import { ProblemSpec, BugHuntResult } from '../types';
import { Bug, Play, AlertOctagon } from 'lucide-react';

interface BugHunterProps {
  spec: ProblemSpec | null;
  onHunt: (code: string) => void;
  result: BugHuntResult | null;
  isHunting: boolean;
}

export const BugHunter: React.FC<BugHunterProps> = ({ spec, onHunt, result, isHunting }) => {
  const [code, setCode] = useState('');

  if (!spec) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-cp-border p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Bug className="w-5 h-5 text-cp-danger" />
        Săn Bug (Stress Test)
      </h2>
      <p className="text-xs text-gray-500 mb-4">
        Dán code nghi ngờ sai vào đây. AI sẽ tìm input khiến code này sai (Counter-example).
      </p>

      <div className="flex-1 flex flex-col gap-4">
        <textarea
          className="flex-1 w-full p-4 bg-gray-900 text-gray-100 font-mono text-xs rounded-md resize-none focus:ring-2 focus:ring-cp-primary"
          placeholder="// Dán code C++ / Python / Java vào đây..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        
        <button
          onClick={() => onHunt(code)}
          disabled={isHunting || !code.trim()}
          className="w-full bg-cp-danger text-white py-2 rounded-md font-medium text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isHunting ? 'Đang Săn Bug...' : 'Tìm Test Sai'}
          <AlertOctagon className="w-4 h-4" />
        </button>
      </div>

      {result && (
        <div className="mt-6 border-2 border-red-100 rounded-lg p-4 bg-red-50 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
             <Bug className="w-4 h-4" /> Đã Tìm Thấy Test Sai
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-3">
             <div>
                <label className="text-xs font-semibold text-red-700 uppercase">Input</label>
                <pre className="mt-1 bg-white border border-red-200 p-2 rounded text-xs font-mono whitespace-pre-wrap">{result.input}</pre>
             </div>
             <div>
                <label className="text-xs font-semibold text-red-700 uppercase">Phân Tích</label>
                <div className="mt-1 text-xs text-red-800">{result.analysis}</div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase">Output Của Bạn (Sai)</label>
              <pre className="mt-1 bg-white border border-gray-300 p-2 rounded text-xs font-mono text-red-600">{result.actualOutput}</pre>
            </div>
            <div>
              <label className="text-xs font-semibold text-green-700 uppercase">Output Đúng</label>
              <pre className="mt-1 bg-white border border-green-300 p-2 rounded text-xs font-mono text-green-600">{result.expectedOutput}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
