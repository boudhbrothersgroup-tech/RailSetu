import { useState } from 'react';
import { PhoneSimulator } from './components/PhoneSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { SavedItem } from './types';
import { INITIAL_HISTORY, INITIAL_SAVED_ITEMS } from './data/mockData';
import { Train as TrainIcon, Terminal, Smartphone, Sparkles, BookOpen, Heart } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('splash');
  const [screenParams, setScreenParams] = useState<any>(null);
  const [simulatedState, setSimulatedState] = useState<'success' | 'loading' | 'empty' | 'error'>('success');
  
  // History and saved states
  const [history, setHistory] = useState<SavedItem[]>(INITIAL_HISTORY);
  const [saved, setSaved] = useState<SavedItem[]>(INITIAL_SAVED_ITEMS);

  const handleSetScreen = (screen: string, params: any = null) => {
    setCurrentScreen(screen);
    setScreenParams(params);
    // Automatically reset state previewer to success for seamless navigation flow
    setSimulatedState('success');
  };

  const handleAddHistory = (item: SavedItem) => {
    setHistory((prev) => [item, ...prev].slice(0, 20)); // Limit to 20 logs
  };

  const handleAddSaved = (item: SavedItem) => {
    setSaved((prev) => {
      if (prev.some(s => s.id === item.id || (s.type === item.type && JSON.stringify(s.payload) === JSON.stringify(item.payload)))) {
        return prev;
      }
      return [item, ...prev];
    });
  };

  const handleRemoveSaved = (id: string) => {
    setSaved((prev) => prev.filter(s => s.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div id="sandbox-root" className="min-h-screen bg-[#F5F7FA] text-slate-800 flex flex-col font-sans">
      {/* Top Main Developer Control Header */}
      <header id="sandbox-header" className="bg-[#0D47A1] border-b border-blue-900 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md z-30 select-none text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF9800] text-white rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            <TrainIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">RailSetu</h1>
              <span className="bg-white/10 border border-white/20 text-[#FF9800] text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full uppercase">
                M3 Flutter Sandbox
              </span>
            </div>
            <p className="text-xs text-blue-100 uppercase tracking-widest mt-0.5">
              Indian Railways Information Portal
            </p>
          </div>
        </div>

        {/* Info stats */}
        <div id="header-stats" className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 flex items-center gap-2 text-white">
            <Smartphone className="w-4 h-4 text-[#FF9800]" />
            <span>Screens: <strong className="text-white">15+ Live M3</strong></span>
          </div>
          <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 flex items-center gap-2 text-white">
            <Terminal className="w-4 h-4 text-blue-200" />
            <span>Sources: <strong className="text-white">Dart Modules</strong></span>
          </div>
        </div>
      </header>

      {/* Flag Band */}
      <div id="flag-band" className="h-1.5 w-full bg-gradient-to-r from-[#0D47A1] via-white to-[#FF9800]"></div>

      {/* Core Split Screen Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Center Phone Simulator Pane */}
        <section className="lg:col-span-5 xl:col-span-4 flex flex-col items-center">
          <div id="simulator-card" className="w-full bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#FF9800]" />
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest font-mono">
                Interactive App Simulator
              </p>
            </div>

            <PhoneSimulator
              currentScreen={currentScreen}
              setScreen={handleSetScreen}
              screenParams={screenParams}
              simulatedState={simulatedState}
              setSimulatedState={setSimulatedState}
              history={history}
              saved={saved}
              onAddHistory={handleAddHistory}
              onAddSaved={handleAddSaved}
              onRemoveSaved={handleRemoveSaved}
              onClearHistory={handleClearHistory}
            />
          </div>
        </section>

        {/* Right Flutter Code Explorer Pane */}
        <section className="lg:col-span-7 xl:col-span-8 space-y-6">
          <CodeExplorer />

          {/* Quick instructions panel */}
          <div id="instructions-container" className="bg-white border border-slate-200/60 rounded-3xl p-6 space-y-5 shadow-sm select-none">
            <div className="flex items-center gap-2.5 text-slate-800">
              <BookOpen className="w-5 h-5 text-[#0D47A1]" />
              <h3 className="font-extrabold text-sm uppercase tracking-wide text-slate-700">How to Compile & Run RailSetu</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white border border-slate-200/60 p-4.5 rounded-2xl border-l-4 border-[#FF9800] shadow-sm hover:shadow transition duration-200">
                <span className="font-extrabold text-slate-800 text-xs">1. Setup Flutter Environment</span>
                <p className="text-[11px] mt-1.5 text-slate-500 leading-relaxed">
                  Install the Flutter SDK (3.0+) and Dart plugin. Verify with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">flutter doctor</code>.
                </p>
              </div>
              <div className="bg-white border border-slate-200/60 p-4.5 rounded-2xl border-l-4 border-[#0D47A1] shadow-sm hover:shadow transition duration-200">
                <span className="font-extrabold text-slate-800 text-xs">2. Create & Copy Source</span>
                <p className="text-[11px] mt-1.5 text-slate-500 leading-relaxed">
                  Create a project, then download or copy Dart code tabs in the Workspace Explorer into your <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">lib/</code> directory.
                </p>
              </div>
              <div className="bg-[#0D47A1] rounded-2xl p-4.5 shadow-md text-white hover:bg-blue-800 transition duration-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-12 h-12 bg-white/5 rounded-full"></div>
                <span className="font-extrabold text-white text-xs">3. Get Packages & Build</span>
                <p className="text-[11px] mt-1.5 text-blue-100/90 leading-relaxed">
                  Run <code className="bg-white/15 px-1 py-0.5 rounded font-mono text-[10px]">flutter pub get</code>, then launch on simulator/device with <code className="bg-[#FF9800] text-white px-1 py-0.5 rounded font-mono text-[10px]">flutter run</code>.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer copyright block */}
      <footer className="bg-white border-t border-slate-200/60 text-center py-4 select-none mt-auto">
        <p className="text-xs text-slate-500 font-mono flex items-center justify-center gap-1">
          Developed under Material 3 standard guidelines. Crafted with
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          for boudhbrothersgroup@gmail.com
        </p>
      </footer>
    </div>
  );
}
