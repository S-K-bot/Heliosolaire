/**
 * Service de gestion et d'intégration Google AdMob
 * Supporte le mode Web (simulation haute fidélité conforme aux standards AdMob)
 * et le mode natif mobile (Capacitor / Android / iOS).
 */

export interface AdMobSettings {
  enabled: boolean;
  testMode: boolean;
  showBottomBanner: boolean;
  showInlineBanner: boolean;
  enableInterstitials: boolean;
  enableRewardedAds: boolean;
  
  // Identifiants AdMob Android (par défaut : identifiants de test officiels Google)
  androidAppId: string;
  androidBannerId: string;
  androidInterstitialId: string;
  androidRewardedId: string;

  // Identifiants AdMob iOS (par défaut : identifiants de test officiels Google)
  iosAppId: string;
  iosBannerId: string;
  iosInterstitialId: string;
  iosRewardedId: string;

  // Statistiques de simulation
  impressionsCount: number;
  clicksCount: number;
  estimatedEarningsEuros: number;
}

export const GOOGLE_TEST_IDS = {
  android: {
    appId: 'ca-app-pub-3940256099942544~3347511713',
    banner: 'ca-app-pub-3940256099942544/6300978111',
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
  ios: {
    appId: 'ca-app-pub-3940256099942544~1458602516',
    banner: 'ca-app-pub-3940256099942544/2934735716',
    interstitial: 'ca-app-pub-3940256099942544/4411468910',
    rewarded: 'ca-app-pub-3940256099942544/1712485313',
  },
};

const STORAGE_KEY = 'helios_admob_settings_v1';

export const DEFAULT_ADMOB_SETTINGS: AdMobSettings = {
  enabled: true,
  testMode: true,
  showBottomBanner: true,
  showInlineBanner: true,
  enableInterstitials: true,
  enableRewardedAds: true,
  androidAppId: GOOGLE_TEST_IDS.android.appId,
  androidBannerId: GOOGLE_TEST_IDS.android.banner,
  androidInterstitialId: GOOGLE_TEST_IDS.android.interstitial,
  androidRewardedId: GOOGLE_TEST_IDS.android.rewarded,
  iosAppId: GOOGLE_TEST_IDS.ios.appId,
  iosBannerId: GOOGLE_TEST_IDS.ios.banner,
  iosInterstitialId: GOOGLE_TEST_IDS.ios.interstitial,
  iosRewardedId: GOOGLE_TEST_IDS.ios.rewarded,
  impressionsCount: 0,
  clicksCount: 0,
  estimatedEarningsEuros: 0,
};

export function loadAdMobSettings(): AdMobSettings {
  if (typeof window === 'undefined') return DEFAULT_ADMOB_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ADMOB_SETTINGS;
    return { ...DEFAULT_ADMOB_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Erreur chargement paramètres AdMob:', e);
    return DEFAULT_ADMOB_SETTINGS;
  }
}

export function saveAdMobSettings(settings: AdMobSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Erreur sauvegarde paramètres AdMob:', e);
  }
}

export function trackAdImpression(cpmEuro: number = 4.50): { impressions: number; earnings: number } {
  const current = loadAdMobSettings();
  const nextImpressions = current.impressionsCount + 1;
  // Calcul approximatif : (CPM / 1000) par affichage
  const nextEarnings = Math.round((current.estimatedEarningsEuros + (cpmEuro / 1000)) * 10000) / 10000;
  
  saveAdMobSettings({
    ...current,
    impressionsCount: nextImpressions,
    estimatedEarningsEuros: nextEarnings,
  });

  return { impressions: nextImpressions, earnings: nextEarnings };
}

export function trackAdClick(cpcEuro: number = 0.35): { clicks: number; earnings: number } {
  const current = loadAdMobSettings();
  const nextClicks = current.clicksCount + 1;
  const nextEarnings = Math.round((current.estimatedEarningsEuros + cpcEuro) * 10000) / 10000;
  
  saveAdMobSettings({
    ...current,
    clicksCount: nextClicks,
    estimatedEarningsEuros: nextEarnings,
  });

  return { clicks: nextClicks, earnings: nextEarnings };
}

export interface SampleAdContent {
  title: string;
  subtitle: string;
  callToAction: string;
  advertiser: string;
  domain: string;
  accentColor: string;
}

export const SAMPLE_ENERGY_ADS: SampleAdContent[] = [
  {
    title: "Prime Solaire 2026 : Jusqu'à 5 000 € d'aides de l'État",
    subtitle: "Calculez votre montant d'aide sans engagement en 30 secondes selon votre code postal.",
    callToAction: "Vérifier mon éligibilité",
    advertiser: "France Rénov' Solaire Partenaire",
    domain: "aides-energie-solaire.fr",
    accentColor: "from-amber-500 to-orange-600",
  },
  {
    title: "Batteries Solaires Résidentielles Lithium-Fer : -20%",
    subtitle: "Stockez votre production de jour pour annuler vos factures du soir. Garantie 15 ans.",
    callToAction: "Découvrir les offres",
    advertiser: "Stockage Énergie Pro",
    domain: "batteries-solaires-direct.com",
    accentColor: "from-emerald-500 to-teal-700",
  },
  {
    title: "Rachat du surplus à 0,13 €/kWh garanti 20 ans",
    subtitle: "Souscrivez au contrat d'obligation d'achat officiel EDF OA pour votre surplus solaire.",
    callToAction: "Simuler mes gains",
    advertiser: "Fournisseur Vert Énergie",
    domain: "rachat-electricite-verte.org",
    accentColor: "from-blue-600 to-indigo-700",
  },
];
