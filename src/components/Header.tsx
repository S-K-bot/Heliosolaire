import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  RotateCcw,
  FileText,
  ShieldCheck,
  Save,
  Check,
  MapPin,
  ChevronDown,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onReset: () => void;
  onResetToCurrentLocation: () => void;
  onSave: () => void;
  onOpenReport: () => void;
  systemPowerKWp: number;
  selfConsumptionRate: number;
  isSavedRecently: boolean;
  isAutoSave: boolean;
  onToggleAutoSave: () => void;
  savedDate?: string | null;
  currentCountryFlag?: string;
  currentCity?: string;
  onOpenAdMobConfig?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onResetToCurrentLocation,
  onSave,
  onOpenReport,
  systemPowerKWp,
  selfConsumptionRate,
  isSavedRecently,
  isAutoSave,
  onToggleAutoSave,
  savedDate,
  currentCountryFlag = '☀️',
  currentCity = '',
  onOpenAdMobConfig,
}) => {
  const [isResetMenuOpen, setIsResetMenuOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const resetMenuRef = useRef<HTMLDivElement>(null);

  // Check if admin mode is activated via URL query param (?admin=true or ?admob=true) or localStorage
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hasAdminParam = params.get('admin') === 'true' || params.get('admob') === 'true' || params.get('monetize') === 'true';
      if (hasAdminParam) {
        localStorage.setItem('helios_admin_mode', 'true');
        setIsAdminMode(true);
      } else if (localStorage.getItem('helios_admin_mode') === 'true') {
        setIsAdminMode(true);
      }
    } catch {
      // ignore in sandboxed environments
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resetMenuRef.current && !resetMenuRef.current.contains(event.target as Node)) {
        setIsResetMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-amber-200/60 bg-gradient-to-r from-amber-50 via-white to-orange-50 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo and title */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-300/40">
            <Sun className="h-6 w-6 text-white animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 font-sans">
                Hélios<span className="text-amber-600">Solaire</span>
              </h1>
              {currentCity && (
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                  <MapPin className="w-3 h-3 mr-1 text-amber-600" />
                  {currentCountryFlag} {currentCity}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-600 hidden sm:block">
              Simulateur & Optimiseur d'Autoconsommation Photovoltaïque Résidentielle
            </p>
          </div>
        </div>

        {/* Quick status & Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* Key metrics badge */}
          <div className="hidden lg:flex items-center bg-white/90 border border-amber-200 px-3 py-1.5 rounded-lg shadow-xs text-xs text-neutral-700">
            <span className="text-neutral-500 mr-1.5">Puissance :</span>
            <strong className="text-amber-700 font-semibold">{systemPowerKWp} kWc</strong>
            <span className="mx-2 text-neutral-300">|</span>
            <span className="text-neutral-500 mr-1.5">Autoconsommation :</span>
            <strong className="text-emerald-700 font-semibold">{selfConsumptionRate}%</strong>
          </div>

          {/* Bouton d'enregistrement / Sauvegarde locale */}
          <button
            id="btn-save-config"
            type="button"
            onClick={onSave}
            className={`inline-flex items-center px-3 py-2 text-xs font-semibold rounded-lg border shadow-xs transition-all ${
              isSavedRecently
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400'
            }`}
            title="Enregistrer toutes les valeurs saisies pour y revenir ultérieurement après fermeture"
          >
            {isSavedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                <span>Enregistré</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                <span>Enregistrer</span>
              </>
            )}
          </button>

          {/* Menu de réinitialisation */}
          <div className="relative" ref={resetMenuRef}>
            <button
              id="btn-reset-options"
              type="button"
              onClick={() => setIsResetMenuOpen(!isResetMenuOpen)}
              className="inline-flex items-center px-2.5 py-2 text-xs font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors shadow-xs"
              title="Options de réinitialisation"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-500 mr-1" />
              <span className="hidden sm:inline">Réinitialiser</span>
              <ChevronDown className="w-3 h-3 ml-1 text-neutral-400" />
            </button>

            {isResetMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMenuOpen(false);
                    onResetToCurrentLocation();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-neutral-800 flex items-start gap-2 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Selon ma position GPS</div>
                    <div className="text-[11px] text-neutral-500">
                      Restaure les données par défaut de votre localisation réelle
                    </div>
                  </div>
                </button>
                <div className="border-t border-neutral-100 my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMenuOpen(false);
                    onReset();
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-neutral-50 text-neutral-800 flex items-start gap-2 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-900">Paramètres usine (Standard)</div>
                    <div className="text-[11px] text-neutral-500">
                      Remet les valeurs initiales par défaut (4.5 kWc, France)
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Bouton Monétisation Google AdMob (réservé à l'administrateur via ?admin=true) */}
          {isAdminMode && onOpenAdMobConfig && (
            <button
              id="btn-open-admob"
              type="button"
              onClick={onOpenAdMobConfig}
              className="inline-flex items-center px-2.5 py-2 text-xs font-semibold text-neutral-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Monétisation Google AdMob (Bannières, Interstitiels, Gains)"
            >
              <span className="flex h-2 w-2 relative mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <DollarSign className="w-3.5 h-3.5 text-amber-600 mr-1" />
              <span className="hidden sm:inline">AdMob (Admin)</span>
            </button>
          )}

          {/* Bouton Installation PWA (Mobile & Desktop) */}
          <PWAInstallButton />

          {/* Bouton Rapport et Bilan */}
          <button
            id="btn-open-report"
            onClick={onOpenReport}
            type="button"
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-lg shadow-sm shadow-amber-600/25 transition-all transform active:scale-95"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            <span>Rapport & Bilan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
