import React, { useState } from 'react';
import { FLUTTER_FILES, FlutterFile } from '../data/flutterCodeString';
import { Folder, File, Copy, Check, Terminal, ExternalLink, HelpCircle } from 'lucide-react';

export const CodeExplorer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<FlutterFile>(FLUTTER_FILES[1]); // Default to main.dart
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-slate-100 rounded-2xl shadow-xl border border-slate-800 overflow-hidden h-[680px]">
      {/* Code Header */}
      <div className="bg-slate-950 px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-orange-400" />
          <div>
            <h3 className="font-extrabold text-sm font-sans text-slate-200">Flutter Android Source Workspace</h3>
            <p className="text-[10px] text-slate-400 font-mono">Material 3 • Dart SDK (lib/main.dart)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-tight bg-slate-800 text-orange-400 px-2 py-0.5 rounded-md border border-slate-700">
            Export Ready
          </span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Tree Explorer Bar */}
        <div className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto select-none p-3 space-y-3.5">
          <div>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Workspace Tree</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-bold px-1 py-1">
                <Folder className="w-4 h-4 text-orange-400 fill-orange-400/20" />
                <span>railsetu_flutter/</span>
              </div>
              
              {/* Nested Children */}
              <div className="pl-4 space-y-1">
                {FLUTTER_FILES.map((file) => {
                  const isActive = activeFile.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setActiveFile(file)}
                      className={`w-full flex items-center gap-2 py-1 px-2 rounded-md font-mono text-[11px] text-left transition ${
                        isActive 
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <File className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-500'}`} />
                      <span className="truncate">{file.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">Build Specifications</p>
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-[10px] space-y-1.5 text-slate-400 font-mono">
              <p>• SDK Target: <strong>And. 13+ (33)</strong></p>
              <p>• Language: <strong>Dart / Kotlin</strong></p>
              <p>• Colors: <strong>Blue #0D47A1</strong></p>
              <p>• Theme: <strong>Material 3 M3</strong></p>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800/50 p-2.5 rounded-lg text-[9px] text-slate-500 leading-relaxed">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 mb-1" />
            These source files are saved under the <code className="text-slate-300 font-mono">/flutter_project</code> path in this workspace root. Use the Settings menu to export/download the ZIP of this folder to compile in Android Studio or VS Code.
          </div>
        </div>

        {/* Code View area */}
        <div className="flex-1 flex flex-col bg-slate-900/40 relative">
          {/* File path heading */}
          <div className="bg-slate-950/40 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>{activeFile.path}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Textarea code container */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed select-text bg-slate-950/10 whitespace-pre">
            {activeFile.content}
          </div>
        </div>
      </div>
    </div>
  );
};
