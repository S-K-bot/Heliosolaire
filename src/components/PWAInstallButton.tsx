import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, CheckCircle, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'floating' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already installed in standalone mode, don't show the prompt button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        await install();
      } finally {
        setIsInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback for browsers without beforeinstallprompt or desktop Safari/Firefox
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      {/* Install Button */}
      <button
        id="btn-pwa-install"
        type="button"
        onClick={handleInstallClick}
        disabled={isInstalling}
        aria-label="Installer l'application sur votre écran d'accueil"
        className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 ${
          variant === 'floating'
            ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md ring-2 ring-amber-400/50'
            : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 hover:border-amber-400'
        } ${className}`}
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="whitespace-nowrap">Installer l'app</span>
      </button>

      {/* iOS / General Install Modal Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl text-slate-100">
            {/* Close button */}
            <button
              onClick={() => setShowIOSGuide(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                <Smartphone className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Installer Hélios Solaire</h3>
                <p className="text-xs text-slate-400">Ajouter à l'écran d'accueil de votre téléphone</p>
              </div>
            </div>

            {isIOS ? (
              // iOS Safari instructions
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-slate-200 leading-relaxed">
                  Sur iPhone ou iPad (Safari), suivez ces deux étapes rapides :
                </p>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0">
                      1
                    </span>
                    <p className="leading-snug">
                      Touchez l'icône de <strong>Partage</strong>{' '}
                      <Share className="inline w-3.5 h-3.5 text-blue-400 mx-0.5 align-text-bottom" /> dans la barre
                      inférieure de Safari.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0">
                      2
                    </span>
                    <p className="leading-snug">
                      Faites défiler vers le bas et sélectionnez{' '}
                      <strong className="text-white">« Sur l'écran d'accueil »</strong>{' '}
                      <PlusSquare className="inline w-3.5 h-3.5 text-slate-300 mx-0.5 align-text-bottom" /> puis{' '}
                      <strong>Ajouter</strong>.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Android / Chrome fallback instructions
              <div className="space-y-3 text-xs text-slate-300">
                <p className="text-slate-200 leading-relaxed">
                  Pour installer l'application et l'ouvrir en plein écran sans barre d'adresse :
                </p>
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0">
                      1
                    </span>
                    <p className="leading-snug">
                      Touchez les <strong>trois points (⋮)</strong> du menu de votre navigateur en haut à droite.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0">
                      2
                    </span>
                    <p className="leading-snug">
                      Sélectionnez <strong className="text-white">« Installer l'application »</strong> ou{' '}
                      <strong>« Ajouter à l'écran d'accueil »</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Accès direct 1 clic
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Affichage plein écran
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Mode hors-ligne
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
            >
              Compris, fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};
