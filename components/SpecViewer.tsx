import React from 'react';
import { ProblemSpec, ConfidenceLevel } from '../types';
import { AlertTriangle, CheckCircle, Brain, Database, ShieldAlert, Clock, HardDrive, FileText, ArrowRight } from 'lucide-react';

interface SpecViewerProps {
  spec: ProblemSpec | null;
}

// Helper to render text with basic Math/LaTeX formatting
const renderMathText = (text: string | undefined) => {
  if (!text) return <span className="text-gray-400 italic">Không có thông tin</span>;

  let processed = text
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\ne/g, '≠')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\approx/g, '≈')
    .replace(/\\in/g, '∈')
    .replace(/\\infty/g, '∞')
    .replace(/\\rightarrow/g, '→')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1/$2)');

  const segments = processed.split('$');

  return segments.map((part, index) => {
    if (index % 2 === 0) {
      return <span key={index}>{part}</span>;
    } else {
      if (part.includes('^')) {
        const supParts = part.split('^');
        return (
          <span key={index} className="font-serif italic text-blue-700 font-medium px-0.5 whitespace-nowrap">
            {supParts.map((sp, i) => (
              i === 0 ? sp : <sup key={i} className="text-[0.7em] ml-0.5">{sp}</sup>
            ))}
          </span>
        );
      }
      return <span key={index} className="font-serif italic text-blue-700 font-medium px-0.5">{part}</span>;
    }
  });
};

export const SpecViewer: React.FC<SpecViewerProps> = ({ spec }) => {
  if (!spec) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50/50">
        <div className="bg-white p-6 rounded-full shadow-sm mb-4">
           <Brain className="w-12 h-12 text-slate-200" />
        </div>
        <p className="font-medium text-slate-400">Chưa có dữ liệu bài toán</p>
        <p className="text-sm text-slate-400 mt-1">Vui lòng nhập đề hoặc tải ảnh để phân tích</p>
      </div>
    );
  }

  const confidenceColor = 
    spec.confidence === ConfidenceLevel.HIGH ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    spec.confidence === ConfidenceLevel.MEDIUM ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-8 bg-white">
      {/* Title Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${confidenceColor}`}>
                 {spec.confidence === ConfidenceLevel.HIGH ? 'Độ tin cậy cao' : 'Cần kiểm tra lại'}
            </span>
            <div className="flex gap-3 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <Clock className="w-3 h-3" /> {spec.timeLimit || "N/A"}
                </span>
                <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                    <HardDrive className="w-3 h-3" /> {spec.memoryLimit || "N/A"}
                </span>
            </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 leading-tight">
          {spec.title || "Bài Toán Chưa Có Tên"}
        </h1>
      </div>

      <div className="space-y-8">
        {/* Logic Summary */}
        <section>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">
             <Brain className="w-4 h-4 text-blue-500" /> Tóm Tắt Logic
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 text-slate-700 text-base leading-relaxed text-justify shadow-sm">
            {renderMathText(spec.summary)}
          </div>
        </section>

        {/* Variables */}
        <section>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wide mb-3">
            <Database className="w-4 h-4 text-blue-500" /> Biến Số & Ràng Buộc
          </div>
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-28">Tên Biến</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Kiểu</th>
                  <th className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mô Tả Chi Tiết</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {(spec.variables || []).map((v, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3 align-top">
                      <span className="font-mono text-base font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100/50">
                         {v.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 align-top">
                      <span className="text-xs font-mono font-medium text-slate-500">
                        {v.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 align-top">
                      <div className="text-sm text-slate-700 mb-1 leading-snug">
                        {renderMathText(v.description)}
                      </div>
                      {v.constraints && (
                        <div className="mt-1.5 inline-block">
                           <span className="text-xs font-mono text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                             {renderMathText(v.constraints)}
                           </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* IO Formats - New Design (Side by Side Cards) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-5 border-l-4 border-l-indigo-500 border-y border-r border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5" /> Input Format
                </h3>
                <div className="text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {spec.inputFormat || "Chưa xác định"}
                </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-5 border-l-4 border-l-emerald-500 border-y border-r border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5" /> Output Format
                </h3>
                <div className="text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {spec.outputFormat || "Chưa xác định"}
                </div>
            </div>
        </div>

        {/* Edge Cases */}
        <section className="bg-orange-50/50 rounded-xl p-5 border border-orange-100/80">
          <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wide mb-3 flex items-center gap-2">
             <ShieldAlert className="w-4 h-4" /> Các Trường Hợp Cần Lưu Ý
          </h3>
          <ul className="space-y-2.5">
            {(spec.edgeCasesAnalysis || []).map((ec, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-slate-800">
                <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{renderMathText(ec)}</span>
              </li>
            ))}
            {(!spec.edgeCasesAnalysis || spec.edgeCasesAnalysis.length === 0) && (
                 <li className="text-sm text-slate-400 italic">Chưa có phân tích.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
};
