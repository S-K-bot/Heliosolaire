import { SolarConfig, GeoLocation, RegionId } from '../types';
import { getCountryProfile } from '../data/countries';
import { calculateIrradiationFromCoordinates } from './solarCalculator';
import { getRegionsForCountry } from '../data/regions';

export const STORAGE_KEY_CONFIG = 'helios_solar_saved_config_v2';
export const STORAGE_KEY_META = 'helios_solar_saved_meta_v2';
export const STORAGE_KEY_AUTOSAVE = 'helios_solar_autosave_v2';

export interface SavedConfigMetadata {
  savedAt: string; // ISO string
  city?: string;
  countryCode?: string;
  systemPowerKWp?: number;
}

/**
 * Enregistre la configuration complète dans le localStorage du navigateur
 */
export function saveSolarConfig(config: SolarConfig): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    const meta: SavedConfigMetadata = {
      savedAt: new Date().toISOString(),
      city: config.location?.city || '',
      countryCode: config.countryCode || config.location?.countryCode || 'FR',
      systemPowerKWp: config.systemPowerKWp,
    };
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
    return true;
  } catch (err) {
    console.error('Erreur lors de la sauvegarde dans localStorage:', err);
    return false;
  }
}

/**
 * Récupère la configuration sauvegardée si elle existe
 */
export function loadSolarConfig(): { config: SolarConfig; meta: SavedConfigMetadata } | null {
  try {
    const rawConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!rawConfig) return null;

    const parsedConfig = JSON.parse(rawConfig) as SolarConfig;
    if (!parsedConfig || typeof parsedConfig !== 'object') return null;

    let meta: SavedConfigMetadata = {
      savedAt: new Date().toISOString(),
      city: parsedConfig.location?.city,
      countryCode: parsedConfig.countryCode,
      systemPowerKWp: parsedConfig.systemPowerKWp,
    };

    const rawMeta = localStorage.getItem(STORAGE_KEY_META);
    if (rawMeta) {
      try {
        meta = { ...meta, ...JSON.parse(rawMeta) };
      } catch {
        // Ignorer si metadata corrompue
      }
    }

    return { config: parsedConfig, meta };
  } catch (err) {
    console.error('Erreur lors de la lecture du localStorage:', err);
    return null;
  }
}

/**
 * Supprime la configuration enregistrée (pour réinitialiser)
 */
export function clearSavedSolarConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CONFIG);
    localStorage.removeItem(STORAGE_KEY_META);
  } catch (err) {
    console.error('Erreur lors de la suppression de la sauvegarde:', err);
  }
}

/**
 * Vérifie si la sauvegarde automatique est activée (par défaut oui)
 */
export function isAutoSaveEnabled(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY_AUTOSAVE);
    if (val === null) return true; // Actif par défaut
    return val === 'true';
  } catch {
    return true;
  }
}

/**
 * Modifie l'état de la sauvegarde automatique
 */
export function setAutoSaveEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTOSAVE, enabled ? 'true' : 'false');
  } catch (err) {
    console.error('Erreur lors du réglage de la sauvegarde auto:', err);
  }
}

/**
 * Déduit un code pays à partir du fuseau horaire de l'utilisateur (détection instantanée zéro délai)
 */
export function detectCountryFromTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Tunis')) return 'TN';
    if (tz.includes('Brussels')) return 'BE';
    if (tz.includes('Zurich')) return 'CH';
    if (tz.includes('Madrid') || tz.includes('Canary') || tz.includes('Ceuta')) return 'ES';
    if (tz.includes('Berlin')) return 'DE';
    if (tz.includes('London') || tz.includes('Belfast')) return 'GB';
    if (tz.includes('Rome')) return 'IT';
    if (tz.includes('Casablanca')) return 'MA';
    if (tz.includes('Montreal') || tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Halifax')) {
      return 'CA';
    }
    if (tz.includes('Paris')) return 'FR';
  } catch {
    // Erreur silencieuse
  }
  return 'FR';
}

/**
 * Déduit le pays à partir de la région identifiée
 */
export function detectCountryFromRegionId(regionId: string): string {
  if (regionId.startsWith('tn_')) return 'TN';
  if (regionId.startsWith('ma_')) return 'MA';
  if (regionId.startsWith('be_')) return 'BE';
  if (regionId.startsWith('ch_')) return 'CH';
  if (regionId.startsWith('es_')) return 'ES';
  if (regionId.startsWith('de_')) return 'DE';
  if (regionId.startsWith('it_')) return 'IT';
  if (regionId.startsWith('gb_')) return 'GB';
  if (regionId.startsWith('ca_')) return 'CA';
  return 'FR';
}

/**
 * Construit une configuration par défaut adaptée au point de localisation de l'utilisateur
 */
export function createLocationBasedConfig(
  baseConfig: SolarConfig,
  location: GeoLocation,
  regionId: RegionId,
  countryCode: string
): SolarConfig {
  const country = getCountryProfile(countryCode);
  const countryRegions = getRegionsForCountry(countryCode);
  const validRegion = countryRegions[regionId] ? regionId : Object.keys(countryRegions)[0] || 'centre';

  return {
    ...baseConfig,
    countryCode: country.code,
    region: validRegion,
    location: {
      ...location,
      countryCode: country.code,
      countryName: country.name,
    },
    gridElectricityCostPerKWh: country.defaultElectricityPricePerKWh,
    feedInTariffPerKWh: country.defaultFeedInTariffPerKWh,
    isCustomGridTariff: false,
    isCustomFeedInTariff: false,
    customSubsidiesMode: 'auto',
    customSubsidiesAmount: null,
  };
}

/**
 * Tente d'obtenir la position GPS actuelle du navigateur avec gestion des timeouts et erreurs
 */
export function requestBrowserGeolocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.info('Géolocalisation navigateur non accordée ou indisponible:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}
