import React, { useState } from 'react';
import {
  X,
  Sparkles,
  DollarSign,
  TrendingUp,
  Eye,
  MousePointerClick,
  Smartphone,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Check,
  Tv,
  HelpCircle,
  Copy,
  Zap,
} from 'lucide-react';
import {
  AdMobSettings,
  GOOGLE_TEST_IDS,
  saveAdMobSettings,
} from '../services/admob';

interface AdMobConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdMobSettings;
  onSaveSettings: (newSettings: AdMobSettings) => void;
  onTriggerTestAd: (type: 'interstitial' | 'rewarded') => void;
}

export const AdMobConfigModal: React.FC<AdMobConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTriggerTestAd,
}) => {
  const [form, setForm] = useState<AdMobSettings>({ ...settings });
  const [activeTab, setActiveTab] = useState<'overview' | 'ids' | 'guide'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleToggle = (key: keyof AdMobSettings) => {
    setForm((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (key: keyof AdMobSettings, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResetToTestIds = () => {
    setForm((prev) => ({
      ...prev,
      testMode: true,
      androidAppId: GOOGLE_TEST_IDS.android.appId,
      androidBannerId: GOOGLE_TEST_IDS.android.banner,
      androidInterstitialId: GOOGLE_TEST_IDS.android.interstitial,
      androidRewardedId: GOOGLE_TEST_IDS.android.rewarded,
      iosAppId: GOOGLE_TEST_IDS.ios.appId,
      iosBannerId: GOOGLE_TEST_IDS.ios.banner,
      iosInterstitialId: GOOGLE_TEST_IDS.ios.interstitial,
      iosRewardedId: GOOGLE_TEST_IDS.ios.rewarded,
    }));
  };

  const handleSave = () => {
    onSaveSettings(form);
    saveAdMobSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const simulatedECPM =
    form.impressionsCount > 0
      ? Math.round((form.estimatedEarningsEuros / form.impressionsCount) * 1000 * 100) / 100
      : 4.8;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Monétisation Google AdMob</h3>
                <span className="px-2 py-0.5 bg-neutral-950/40 text-amber-200 text-[11px] font-bold rounded-full">
                  Play Store & App Store
                </span>
              </div>
              <p className="text-xs text-amber-100">
                Générez des revenus automatiques grâce aux annonces Google
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Tableau de bord & Formats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ids')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ids'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Identifiants AdMob (IDs)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Guide de mise en ligne
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-neutral-800 text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div>
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2.5">
                  Revenus & Performance en temps réel (Simulateur)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3">
                    <div className="text-neutral-500 text-[11px] flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-600" />
                      Gains estimés
                    </div>
                    <div className="text-xl font-bold text-amber-900 mt-1">
                      {form.estimatedEarningsEuros.toFixed(2)} €
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">Session actuelle</div>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                    <div className="text-neutral-500 text-[11px] flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-neutral-600" />
                      Affichages
                    </div>
                    <div className="text-xl font-bold text-neutral-900 mt-1">
                      {form.impressionsCount}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Impressions AdMob</div>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                    <div className="text-neutral-500 text-[11px] flex items-center gap-1">
                      <MousePointerClick className="w-3.5 h-3.5 text-blue-600" />
                      Clics
                    </div>
                    <div className="text-xl font-bold text-neutral-900 mt-1">
                      {form.clicksCount}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">Taux CTR ~ 2.8%</div>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                    <div className="text-neutral-500 text-[11px] flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      eCPM Moyen
                    </div>
                    <div className="text-xl font-bold text-neutral-900 mt-1">
                      {simulatedECPM.toFixed(2)} €
                    </div>
                    <div className="text-[10px] text-emerald-700 mt-0.5">Secteur Énergie</div>
                  </div>
                </div>
              </div>

              {/* Activation switches */}
              <div className="space-y-3 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-neutral-900 mb-2">
                  Emplacements & Options publicitaires
                </h4>

                <label className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                  <div>
                    <span className="font-semibold text-neutral-900">Activer Google AdMob</span>
                    <p className="text-[11px] text-neutral-500">Active la diffusion des bannières et annonces</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.enabled}
                    onChange={() => handleToggle('enabled')}
                    className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                  <div>
                    <span className="font-semibold text-neutral-900">Mode Test officiel (Recommandé en dév)</span>
                    <p className="text-[11px] text-neutral-500">
                      Utilise les identifiants de test Google pour éviter tout risque de suspension de compte
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.testMode}
                    onChange={() => handleToggle('testMode')}
                    className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500"
                  />
                </label>

                <div className="border-t border-neutral-200 my-1" />

                <label className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                  <div>
                    <span className="font-semibold text-neutral-900">Bannière fixe en bas d'écran (Mobile)</span>
                    <p className="text-[11px] text-neutral-500">Format adaptatif standard AdMob (320x50 / 728x90)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.showBottomBanner}
                    onChange={() => handleToggle('showBottomBanner')}
                    className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors cursor-pointer">
                  <div>
                    <span className="font-semibold text-neutral-900">Bannière insérée dans le simulateur</span>
                    <p className="text-[11px] text-neutral-500">Encart sponsorisé discret entre les métriques</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.showInlineBanner}
                    onChange={() => handleToggle('showInlineBanner')}
                    className="w-4 h-4 text-amber-600 rounded border-neutral-300 focus:ring-amber-500"
                  />
                </label>
              </div>

              {/* Live Test Triggers */}
              <div>
                <h4 className="text-xs font-bold text-neutral-900 mb-2">
                  Tester les formats plein écran en direct
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => onTriggerTestAd('interstitial')}
                    className="flex-1 min-w-[200px] px-3.5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Tester Annonce Interstitielle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerTestAd('rewarded')}
                    className="flex-1 min-w-[200px] px-3.5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Tv className="w-4 h-4" />
                    <span>Tester Annonce avec Récompense</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ids' && (
            <div className="space-y-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold">Identifiants prêts pour la production</div>
                  <p className="text-[11px] leading-relaxed">
                    Par défaut, les identifiants de test officiels fournis par Google sont renseignés. Lorsque votre compte Google AdMob sera validé, collez vos identifiants réels ci-dessous et désactivez le Mode Test.
                  </p>
                </div>
              </div>

              {/* Android IDs */}
              <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div className="font-bold text-neutral-900 flex items-center justify-between">
                  <span>Android (Google Play Store)</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Format : ca-app-pub-XXX/YYY</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    App ID Android (AndroidManifest.xml)
                  </label>
                  <input
                    type="text"
                    value={form.androidAppId}
                    onChange={(e) => handleInputChange('androidAppId', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-[11px] text-neutral-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Bloc Bannière
                    </label>
                    <input
                      type="text"
                      value={form.androidBannerId}
                      onChange={(e) => handleInputChange('androidBannerId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Bloc Interstitiel
                    </label>
                    <input
                      type="text"
                      value={form.androidInterstitialId}
                      onChange={(e) => handleInputChange('androidInterstitialId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Bloc Récompensé
                    </label>
                    <input
                      type="text"
                      value={form.androidRewardedId}
                      onChange={(e) => handleInputChange('androidRewardedId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* iOS IDs */}
              <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div className="font-bold text-neutral-900 flex items-center justify-between">
                  <span>iOS (Apple App Store)</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Format : ca-app-pub-XXX/YYY</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    App ID iOS (Info.plist - GADApplicationIdentifier)
                  </label>
                  <input
                    type="text"
                    value={form.iosAppId}
                    onChange={(e) => handleInputChange('iosAppId', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-[11px] text-neutral-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Bloc Bannière
                    </label>
                    <input
                      type="text"
                      value={form.iosBannerId}
                      onChange={(e) => handleInputChange('iosBannerId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Bloc Interstitiel
                    </label>
                    <input
                      type="text"
                      value={form.iosInterstitialId}
                      onChange={(e) => handleInputChange('iosInterstitialId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-neutral-600 mb-1">
                      Bloc Récompensé
                    </label>
                    <input
                      type="text"
                      value={form.iosRewardedId}
                      onChange={(e) => handleInputChange('iosRewardedId', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleResetToTestIds}
                  className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Rétablir les identifiants de test officiels Google
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="border border-neutral-200 rounded-xl p-3.5 space-y-2">
                  <div className="font-bold text-neutral-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    Créer son compte Google AdMob
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Connectez-vous sur{' '}
                    <a
                      href="https://admob.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 font-bold underline inline-flex items-center gap-0.5"
                    >
                      admob.google.com <ExternalLink className="w-2.5 h-2.5" />
                    </a>{' '}
                    avec votre compte Google. L'inscription est gratuite.
                  </p>
                </div>

                <div className="border border-neutral-200 rounded-xl p-3.5 space-y-2">
                  <div className="font-bold text-neutral-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    Déclarer l'application et générer les blocs d'annonces
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Dans le menu <strong>Applications &gt; Ajouter une application</strong>, sélectionnez Android ou iOS. Créez ensuite 3 blocs :
                    <br />• <strong>Bannière adaptative</strong> (pour le bas d'écran)
                    <br />• <strong>Interstitiel</strong> (affichage plein écran lors de l'export du rapport)
                    <br />• <strong>Annonce avec récompense</strong> (pour débloquer une analyse avancée)
                  </p>
                </div>

                <div className="border border-neutral-200 rounded-xl p-3.5 space-y-2">
                  <div className="font-bold text-neutral-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    Plugin Capacitor pour l'export natif
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    Lorsque vous compilez avec Capacitor pour Android ou iOS, le plugin officiel s'installe en une commande :
                  </p>
                  <pre className="bg-neutral-900 text-neutral-100 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto">
                    npm install @capacitor-community/admob
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-50 border-t border-neutral-200 px-5 py-3 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            {isSaved ? '✓ Modifications enregistrées avec succès' : 'Les paramètres sont conservés sur votre appareil'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 rounded-xl font-semibold text-xs cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="button"
              id="btn-save-admob-config"
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <span>Appliquer les paramètres</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
