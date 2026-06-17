import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { Loader2, AlertCircle, FileText } from 'lucide-react';

interface WordViewerProps {
  filePath: string;
  zoom?: number;
}

export function WordViewer({ filePath, zoom = 100 }: WordViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const renderDocx = async () => {
      if (!containerRef.current) return;
      setLoading(true);
      setError(null);
      containerRef.current.innerHTML = '';

      try {
        let arrayBuffer: ArrayBuffer;

        if (filePath.startsWith('data:')) {
          // Convert base64 data URI to ArrayBuffer
          const base64Content = filePath.split(',')[1];
          if (!base64Content) {
            throw new Error('Format Data URI tidak valid.');
          }
          const binaryString = window.atob(base64Content);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          arrayBuffer = bytes.buffer;
        } else {
          // Fetch the file as arraybuffer
          const response = await fetch(filePath);
          if (!response.ok) {
            throw new Error('Gagal mengunduh berkas Word dari server.');
          }
          arrayBuffer = await response.arrayBuffer();
        }

        if (!active) return;

        // Render documents using docx-preview
        await renderAsync(arrayBuffer, containerRef.current, undefined, {
          className: 'docx-preview-output',
          inWrapper: false,
          ignoreWidth: true,
          ignoreHeight: true,
          ignoreFonts: false,
        });

        if (active) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Docx render error:', err);
        if (active) {
          setError(err.message || 'Gagal merender dokumen Word (.docx) secara visual.');
          setLoading(false);
        }
      }
    };

    renderDocx();

    return () => {
      active = false;
    };
  }, [filePath]);

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 rounded-2xl overflow-hidden relative" style={{ minHeight: '500px' }}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 z-20 space-y-3">
          <Loader2 className="h-8 w-8 text-indigo-550 animate-spin" />
          <p className="text-xs text-slate-350 font-medium font-sans">Membaca & Merender Dokumen Word Asli (.docx)...</p>
        </div>
      )}

      {error ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-6 space-y-3 z-10 my-auto">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-full">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h4 className="text-sm font-bold text-white">Pratinjau Word Terbatas</h4>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">{error}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-6 md:p-8 bg-slate-950 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div 
            style={{ fontSize: `${zoom}%` }}
            className="max-w-[850px] mx-auto bg-white text-slate-900 rounded-xl overflow-hidden shadow-2xl p-6 sm:p-12 md:p-16 border border-slate-250 select-text leading-relaxed font-sans scrollable-docx-container transition-all duration-150"
          >
            <div 
              ref={containerRef} 
              className="docx-preview-rendered-html text-xs sm:text-sm text-left" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
