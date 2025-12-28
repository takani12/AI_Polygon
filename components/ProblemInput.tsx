import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image as ImageIcon, Loader2, Sparkles, X } from 'lucide-react';

interface ProblemInputProps {
  onAnalyze: (text: string, imageBase64?: string, mimeType?: string) => void;
  isAnalyzing: boolean;
}

export const ProblemInput: React.FC<ProblemInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData?.items) return;
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        if (e.clipboardData.items[i].type.indexOf('image') !== -1) {
          const file = e.clipboardData.items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processFile(file);
            return;
          }
        }
      }
    };
    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const handleSubmit = () => {
    if (!text && !imagePreview) return;
    let base64Data: string | undefined;
    let mimeType: string | undefined;
    if (imagePreview) {
      const parts = imagePreview.split(',');
      base64Data = parts[1];
      const mimeMatch = parts[0].match(/:(.*?);/);
      mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
    }
    onAnalyze(text, base64Data, mimeType);
  };

  return (
    <div className="h-full flex flex-col p-4 bg-white">
        <div className="mb-4">
             <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-1">Đề Bài</h2>
             <p className="text-xs text-slate-400">Nhập text hoặc dán ảnh (Ctrl+V)</p>
        </div>
      
        <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex-1 relative border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                <textarea
                    className="w-full h-full p-3 bg-white text-sm font-mono text-slate-800 resize-none outline-none"
                    placeholder="Paste đề bài vào đây..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            </div>

            {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 h-32 group flex-shrink-0 bg-slate-50">
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                    <button 
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 bg-white/90 text-slate-600 hover:text-red-500 rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="h-12 border border-dashed border-slate-300 rounded-lg flex items-center justify-center gap-2 text-slate-400 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all flex-shrink-0"
                >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">Tải ảnh lên</span>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
            )}
        </div>

        <button
            onClick={handleSubmit}
            disabled={isAnalyzing || (!text && !imagePreview)}
            className="mt-4 w-full bg-slate-900 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-600 disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
        >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isAnalyzing ? 'Đang Xử Lý...' : 'Phân Tích'}
        </button>
    </div>
  );
};
