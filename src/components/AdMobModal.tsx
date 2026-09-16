import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  Zap,
  Gift,
  Award,
  Clock,
} from 'lucide-react';
import {
  AdMobSettings,
  SAMPLE_ENERGY_ADS,
  trackAdImpression,
  trackAdClick,
} from '../services/admob';

interface AdMobModalProps {
  isOpen: boolean;
  type: 'interstitial' | 'rewarded';
  rewardReason?: string;
  onClose: () => void;
  onRewardEarned?: () => void;
  settings: AdMobSettings;
}

export const AdMobModal: React.FC<AdMobModalProps> = ({
  isOpen,
  type,
  rewardReason = 'Consulter le rapport complet',
  onClose,
  onRewardEarned,
  settings,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [hasRewarded, setHasRewarded] = useState(false);
  const [randomAd] = useState(
    () => SAMPLE_ENERGY_ADS[Math.floor(Math.random() * SAMPLE_ENERGY_ADS.length)]
  );

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(5);
      setCanClose(false);
      setHasRewarded(false);
      return;
    }

    // Track full screen impression with high CPM
    trackAdImpression(type === 'rewarded' ? 12.0 : 8.0);

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          if (type === 'rewarded' && !hasRewarded) {
            setHasRewarded(true);
            if (onRewardEarned) onRewardEarned();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleClickAd = () => {
    trackAdClick(0.75);
    window.open(`https://${randomAd.domain}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        {/* Top Header with AdMob status and countdown */}
        <div className="bg-neutral-900 text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-amber-500 text-neutral-950 font-extrabold text-[10px] rounded uppercase tracking-wider">
              Annonce {type === 'rewarded' ? 'avec Récompense' : 'Interstitielle'}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              Google AdMob ({settings.testMode ? 'Test' : 'Live'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!canClose ? (
              <span className="text-xs text-neutral-400 flex items-center gap-1 font-medium bg-neutral-800 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                Passer dans {secondsRemaining}s
              </span>
            ) : (
              <button
                type="button"
                id="btn-close-admob-modal"
                onClick={onClose}
                className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-full transition-all cursor-pointer shadow-sm"
              >
                <span>Fermer</span>
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Rewarded Notification Badge if applicable */}
        {type === 'rewarded' && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-xs text-amber-900">
            <Gift className="w-4 h-4 text-amber-600 shrink-0" />
            <div className="flex-1 font-medium">
              Regardez cette courte annonce pour débloquer :{' '}
              <strong className="font-bold text-amber-950">{rewardReason}</strong>
            </div>
            {hasRewarded && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px]">
                ✓ Débloqué !
              </span>
            )}
          </div>
        )}

        {/* Main Ad Content (High impact creative) */}
        <div className="p-6 sm:p-8 text-center space-y-5">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
            <Zap className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-widest font-bold text-amber-700">
              {randomAd.advertiser}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight">
              {randomAd.title}
            </h3>
            <p className="text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
              {randomAd.subtitle}
            </p>
          </div>

          {/* Value highlights */}
          <div className="bg-neutral-50 rounded-xl p-3.5 border border-neutral-100 text-xs text-neutral-600 flex justify-around">
            <div>
              <span className="block font-bold text-neutral-900 text-sm">100% Gratuit</span>
              <span>Sans engagement</span>
            </div>
            <div className="border-r border-neutral-200" />
            <div>
              <span className="block font-bold text-neutral-900 text-sm">Artisans RGE</span>
              <span>Certifiés QualiPV</span>
            </div>
            <div className="border-r border-neutral-200" />
            <div>
              <span className="block font-bold text-neutral-900 text-sm">Réponse 24h</span>
              <span>Devis direct</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleClickAd}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-98 cursor-pointer"
          >
            <span>{randomAd.callToAction}</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-neutral-400">
            {randomAd.domain} • Annonce certifiée Google Ad Network
          </p>
        </div>

        {/* Footer info */}
        <div className="bg-neutral-50 border-t border-neutral-200 px-4 py-2.5 text-center text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Identifiant AdMob : {type === 'rewarded' ? '5224354917' : '1033173712'}</span>
          <button
            type="button"
            onClick={onClose}
            disabled={!canClose}
            className={`font-semibold ${
              canClose ? 'text-neutral-700 hover:text-neutral-900 cursor-pointer' : 'text-neutral-400 cursor-not-allowed'
            }`}
          >
            {canClose ? 'Ignorer et continuer' : `Attendre (${secondsRemaining}s)`}
          </button>
        </div>
      </div>
    </div>
  );
};
