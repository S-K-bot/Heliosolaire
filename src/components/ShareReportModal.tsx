import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Mail,
  Send,
  ExternalLink,
  Smartphone,
  Globe,
  FileText,
  Sparkles,
} from 'lucide-react';
import { SolarConfig, SimulationResults } from '../types';
import { formatMoney } from '../data/countries';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SolarConfig;
  results: SimulationResults;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({
  isOpen,
  onClose,
  config,
  results,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const countryProfile = results.countryProfile;
  const currency = countryProfile?.currency || { symbol: '€', code: 'EUR', name: 'Euro' };
  const locationLabel = config.location?.city
    ? `${config.location.city} (${countryProfile?.flag || ''} ${countryProfile?.name || ''})`
    : `${countryProfile?.flag || ''} ${countryProfile?.name || 'France'}`;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://helios-solaire.app';

  // Texte synthétique optimisé pour le partage
  const shareTitle = `☀️ Mon Étude Solaire Hélios (${config.systemPowerKWp} kWc)`;
  const annualSavingsFormatted = formatMoney(results.totalAnnualBenefitYear1 ?? results.annualBillSavingsEuros ?? 0, currency);
  const shareSummary = `☀️ Étude de Rentabilité Solaire Hélios
📍 Localisation : ${locationLabel}
⚡ Puissance : ${config.systemPowerKWp} kWc (${results.panelsCount} panneaux)
🔋 Production annuelle estimée : ${(results.annualProductionKWh ?? 0).toLocaleString()} kWh/an
📈 Taux d'autoconsommation : ${results.selfConsumptionRate}% (Autoproduction : ${results.selfSufficiencyRate}%)
💰 Économies annuelles : ${annualSavingsFormatted} / an
⏳ Amortissement : ${results.paybackPeriodYears} ans
🚀 Gain net sur 25 ans : +${formatMoney(results.cumulativeSavings25Years ?? 0, currency)}
Consultez la simulation complète : ${currentUrl}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareSummary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareSummary,
          url: currentUrl,
        });
      } catch (err) {
        // Ignorer si l'utilisateur annule le dialogue système
      }
    } else {
      handleCopy();
    }
  };

  // Liens pour les applications tierces
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareSummary)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(
    `☀️ Mon Étude Photovoltaïque Hélios : ${config.systemPowerKWp} kWc, ${results.selfConsumptionRate}% d'autoconsommation et ${annualSavingsFormatted}/an d'économies !`
  )}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(
    `Mon projet photovoltaïque : Étude Hélios ${config.systemPowerKWp} kWc`
  )}&body=${encodeURIComponent(
    `Bonjour,\n\nVoici la synthèse de mon étude d'installation solaire réalisée sur le simulateur Hélios :\n\n` +
      `• Localisation : ${locationLabel}\n` +
      `• Puissance installée : ${config.systemPowerKWp} kWc (${results.panelsCount} panneaux)\n` +
      `• Production annuelle estimée : ${(results.annualProductionKWh ?? 0).toLocaleString()} kWh/an\n` +
      `• Taux d'autoconsommation : ${results.selfConsumptionRate}%\n` +
      `• Taux d'autoproduction : ${results.selfSufficiencyRate}%\n` +
      `• Économies sur facture : ${annualSavingsFormatted} dès la première année\n` +
      `• Temps de retour sur investissement : ${results.paybackPeriodYears} ans\n` +
      `• Gain net cumulé sur 25 ans : +${formatMoney(results.cumulativeSavings25Years ?? 0, currency)}\n\n` +
      `Accédez aux détails de la simulation en cliquant ici :\n${currentUrl}\n\nÀ bientôt !`
  )}`;
  const smsUrl = `sms:?&body=${encodeURIComponent(
    `Mon étude solaire : ${config.systemPowerKWp} kWc, ${(results.annualProductionKWh ?? 0).toLocaleString()} kWh/an, ${results.selfConsumptionRate}% autoconsommation. Voir ici : ${currentUrl}`
  )}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `☀️ Mon étude photovoltaïque avec Hélios : ${config.systemPowerKWp} kWc, ${results.annualProductionKWh} kWh/an et ${results.selfConsumptionRate}% d'autoconsommation !`
  )}&url=${encodeURIComponent(currentUrl)}`;

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Partager mon Rapport & Bilan
              </h2>
              <p className="text-xs text-neutral-500">
                Transmettez votre étude à votre installateur, vos proches ou sur vos réseaux
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Bouton Partage Système / Applications installées (si supporté par le mobile/OS) */}
          {hasNativeShare && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-sm text-sm transition-all transform active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>Partager via mes applications (WhatsApp, Messages, Mail...)</span>
            </button>
          )}

          {/* Grille d'applications disponibles */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
              Choisir une application :
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-900 transition-colors text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span>WhatsApp</span>
              </a>

              {/* Email / Messagerie */}
              <a
                href={emailUrl}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900 transition-colors text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span>Email</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/60 text-sky-900 transition-colors text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <span>Telegram</span>
              </a>

              {/* SMS mobile */}
              <a
                href={smsUrl}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 text-purple-900 transition-colors text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span>SMS / Texte</span>
              </a>

              {/* LinkedIn */}
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 text-indigo-900 transition-colors text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <span>LinkedIn</span>
              </a>

              {/* Twitter / X */}
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-300 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 transition-colors text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  𝕏
                </div>
                <span>X (Twitter)</span>
              </a>
            </div>
          </div>

          {/* Aperçu de la fiche récapitulative partagée */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                Aperçu du texte partagé :
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le texte</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 text-[11px] font-mono text-neutral-700 whitespace-pre-line leading-relaxed max-h-40 overflow-y-auto select-all">
              {shareSummary}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            Partage direct sans inscription requise
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
