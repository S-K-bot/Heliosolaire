import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ExternalLink,
  Info,
  X,
  ChevronUp,
  ChevronDown,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  AdMobSettings,
  SAMPLE_ENERGY_ADS,
  trackAdImpression,
  trackAdClick,
} from '../services/admob';

interface AdMobBannerProps {
  settings: AdMobSettings;
  variant?: 'bottom' | 'inline';
  onOpenConfig?: () => void;
  className?: string;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  settings,
  variant = 'bottom',
  onOpenConfig,
  className = '',
}) => {
  const [adIndex, setAdIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [clickedFeedback, setClickedFeedback] = useState(false);

  const ad = SAMPLE_ENERGY_ADS[adIndex % SAMPLE_ENERGY_ADS.length];

  // Rotate ads gently every 25 seconds
  useEffect(() => {
    if (!settings.enabled || isDismissed) return;

    // Track initial impression
    trackAdImpression(variant === 'bottom' ? 3.5 : 5.0);

    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % SAMPLE_ENERGY_ADS.length);
      trackAdImpression(variant === 'bottom' ? 3.5 : 5.0);
    }, 25000);

    return () => clearInterval(interval);
  }, [settings.enabled, isDismissed, variant]);

  if (!settings.enabled || isDismissed) {
    return null;
  }

  // Check display toggles
  if (variant === 'bottom' && !settings.showBottomBanner) return null;
  if (variant === 'inline' && !settings.showInlineBanner) return null;

  const handleClickAd = () => {
    trackAdClick(0.42);
    setClickedFeedback(true);
    setTimeout(() => setClickedFeedback(false), 2000);
  };

  // Sticky Bottom Banner (Standard AdMob Mobile Format: 320x50 / 728x90 Adaptive)
  if (variant === 'bottom') {
    if (isMinimized) {
      return (
        <div className="fixed bottom-2 right-4 z-40">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 text-white rounded-full text-[11px] font-semibold shadow-lg hover:bg-neutral-800 transition-all border border-neutral-700"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Annonce Google ({settings.testMode ? 'Test' : 'Live'})</span>
            <ChevronUp className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      );
    }

    return (
      <div
        id="admob-bottom-banner"
        className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 text-white border-t border-neutral-800 shadow-2xl backdrop-blur-md px-3 py-2 transition-all"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Ad Label & Advertiser Info */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <span className="px-1.5 py-0.5 bg-amber-500 text-neutral-950 font-extrabold text-[10px] rounded tracking-wider uppercase">
              Annonce
            </span>
            <span className="text-[11px] text-neutral-400 font-mono hidden md:inline">
              Google AdMob {settings.testMode ? '(ID Test 6300978111)' : ''}
            </span>
          </div>

          {/* Ad Copy */}
          <div
            onClick={handleClickAd}
            className="flex-1 text-center sm:text-left cursor-pointer group flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
          >
            <div className="font-bold text-xs sm:text-sm text-neutral-100 group-hover:text-amber-400 transition-colors">
              {ad.title}
            </div>
            <div className="text-[11px] text-neutral-400 line-clamp-1">
              {ad.subtitle}
            </div>
          </div>

          {/* CTA & Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-admob-cta-bottom"
              onClick={handleClickAd}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-neutral-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{clickedFeedback ? '✓ Clic comptabilisé' : ad.callToAction}</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>

            {onOpenConfig && (
              <button
                type="button"
                onClick={onOpenConfig}
                className="p-1 text-neutral-400 hover:text-amber-400 transition-colors"
                title="Paramètres de monétisation Google AdMob"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
              title="Réduire l'annonce"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 text-neutral-500 hover:text-neutral-300 transition-colors"
              title="Masquer l'annonce pour cette session"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline Feed Banner (Card Format)
  return (
    <div
      id="admob-inline-card"
      className={`bg-gradient-to-r from-neutral-50 via-amber-50/40 to-neutral-50 border border-neutral-200 hover:border-amber-300/80 rounded-xl p-3.5 sm:p-4 shadow-2xs relative overflow-hidden transition-all ${className}`}
    >
      {/* Decorative subtle stripe */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-neutral-200 text-neutral-800 font-bold text-[10px] rounded tracking-wide uppercase">
              Annonce
            </span>
            <span className="text-[11px] text-neutral-500">
              Sponsorisé par <strong className="font-semibold text-neutral-700">{ad.advertiser}</strong>
            </span>
            {settings.testMode && (
              <span className="hidden sm:inline text-[10px] font-mono text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded">
                Test AdMob
              </span>
            )}
          </div>

          <div
            onClick={handleClickAd}
            className="cursor-pointer group"
          >
            <h4 className="text-sm font-bold text-neutral-900 group-hover:text-amber-700 transition-colors">
              {ad.title}
            </h4>
            <p className="text-xs text-neutral-600 line-clamp-2 mt-0.5">
              {ad.subtitle}
            </p>
          </div>

          <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 pt-0.5">
            <span>{ad.domain}</span>
            <span>•</span>
            <span>Partenaire certifié transition énergétique</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-2 sm:self-center shrink-0">
          <button
            type="button"
            id="btn-admob-cta-inline"
            onClick={handleClickAd}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{clickedFeedback ? '✓ Merci de votre intérêt' : ad.callToAction}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {onOpenConfig && (
            <button
              type="button"
              onClick={onOpenConfig}
              className="p-1.5 text-neutral-400 hover:text-amber-700 rounded-lg hover:bg-neutral-100 transition-colors"
              title="Gérer les paramètres AdMob"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
