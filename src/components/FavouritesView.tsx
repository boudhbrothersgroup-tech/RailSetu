import React, { useState, useEffect } from 'react';
import { localDbService } from '../services/LocalDbService';
import { Heart, Train, Map, Navigation, ArrowRight, Trash2, Calendar, FileText, ChevronRight } from 'lucide-react';

interface FavouritesViewProps {
  onNavigate: (route: string, params?: any) => void;
}

export const FavouritesView: React.FC<FavouritesViewProps> = ({ onNavigate }) => {
  const [trains, setTrains] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);

  useEffect(() => {
    setTrains(localDbService.getFavoriteTrains());
    setRoutes(localDbService.getFavoriteRoutes());
  }, []);

  const handleRemoveTrain = (num: string, name: string, cls: string) => {
    localDbService.toggleFavoriteTrain(num, name, cls);
    setTrains(localDbService.getFavoriteTrains());
  };

  const handleRemoveRoute = (from: string, to: string, fromN: string, toN: string) => {
    localDbService.toggleFavoriteRoute(from, to, fromN, toN);
    setRoutes(localDbService.getFavoriteRoutes());
  };

  const handleSearchRoute = (r: any) => {
    onNavigate('search-tab', { from: r.from, to: r.to });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* AppBar */}
      <div className="bg-[#0D47A1] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-white fill-white" />
          <span className="font-bold text-sm font-sans">Favorite Pinned Rails</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Intro text */}
        <p className="text-[10px] text-slate-400 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed shadow-xs">
          ❤️ Pinned items sync directly with your offline Firestore cache container. Tap on any train or route to enquire operational status instantly.
        </p>

        {/* Favorite Trains Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
            <Train className="w-4 h-4 text-[#0D47A1]" />
            <h3>Pinned Trains</h3>
            <span className="bg-blue-100 text-[#0D47A1] text-[9px] px-1.5 py-0.2 rounded-full font-mono">
              {trains.length}
            </span>
          </div>

          <div className="space-y-2">
            {trains.map((t, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex items-center justify-between gap-3 hover:border-blue-200 transition">
                <div className="flex-1 min-w-0" onClick={() => onNavigate('live-status', { trainNumber: t.number })}>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-orange-50 text-[#FF9800] border border-orange-100 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                      {t.number}
                    </span>
                    <h4 className="font-bold text-xs text-slate-800 truncate">{t.name || 'Express Train'}</h4>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">Default Class: {t.class || 'CC'} • Tap to Track Live Status</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onNavigate('seats', { trainNumber: t.number })}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border text-slate-500 rounded-lg hover:text-blue-700"
                    title="Check Seats"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRemoveTrain(t.number, t.name, t.class)}
                    className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-100 hover:border-red-100 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {trains.length === 0 && (
              <div className="text-center py-6 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-xs">No pinned trains yet.</p>
                <p className="text-[9px] text-slate-400">Search a train and press the heart icon to list it here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Routes Section */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
            <Navigation className="w-4 h-4 text-[#FF9800]" />
            <h3>Pinned Routes</h3>
            <span className="bg-orange-100 text-[#FF9800] text-[9px] px-1.5 py-0.2 rounded-full font-mono">
              {routes.length}
            </span>
          </div>

          <div className="space-y-2">
            {routes.map((r, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm flex items-center justify-between gap-3 hover:border-orange-200 transition">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleSearchRoute(r)}>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <span>{r.fromName || r.from}</span>
                    <ArrowRight className="w-3 h-3 text-[#FF9800]" />
                    <span>{r.toName || r.to}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono uppercase">
                    {r.from} ➔ {r.to} • Tap to Search Trains
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => handleRemoveRoute(r.from, r.to, r.fromName, r.toName)}
                    className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-100 hover:border-red-100 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {routes.length === 0 && (
              <div className="text-center py-6 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-xs">No pinned routes yet.</p>
                <p className="text-[9px] text-slate-400">Search station routes and press pin to list them here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
