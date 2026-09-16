import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { OptimizerPanel } from './components/OptimizerPanel';
import { GoogleMapsInstallationPicker } from './components/GoogleMapsInstallationPicker';
import { ConfigurationForm } from './components/ConfigurationForm';
import { HourlySimulationChart } from './components/HourlySimulationChart';
import { MonthlyProductionChart } from './components/MonthlyProductionChart';
import { FinancialProjectionChart } from './components/FinancialProjectionChart';
import { DetailedReportModal } from './components/DetailedReportModal';
import { CalculationExplainerModal } from './components/CalculationExplainerModal';
import { AdMobBanner } from './components/AdMobBanner';
import { AdMobModal } from './components/AdMobModal';
import { AdMobConfigModal } from './components/AdMobConfigModal';
import {
  AdMobSettings,
  loadAdMobSettings,
  saveAdMobSettings,
} from './services/admob';
import { SolarConfig, GeoLocation, RegionId } from './types';
import {
  runSolarSimulation,
  calculateOptimizationPresets,
  calculateIrradiationFromCoordinates,
} from './utils/solarCalculator';
import {
  saveSolarConfig,
  loadSolarConfig,
  clearSavedSolarConfig,
  isAutoSaveEnabled,
  setAutoSaveEnabled,
  detectCountryFromTimezone,
  detectCountryFromRegionId,
  createLocationBasedConfig,
  requestBrowserGeolocation,
  SavedConfigMetadata,
} from './utils/storage';
import { getCountryProfile } from './data/countries';
import { getRegionsForCountry } from './data/regions';
import { Check, MapPin, X, RotateCcw } from 'lucide-react';

const COUNTRY_CAPITALS: Record<string, { lat: number; lng: number; city: string }> = {
  FR: { lat: 48.8566, lng: 2.3522, city: 'Paris' },
  BE: { lat: 50.8503, lng: 4.3517, city: 'Bruxelles' },
  CH: { lat: 46.948, lng: 7.4474, city: 'Berne' },
  ES: { lat: 40.4168, lng: -3.7038, city: 'Madrid' },
  DE: { lat: 52.52, lng: 13.405, city: 'Berlin' },
  IT: { lat: 41.9028, lng: 12.4964, city: 'Rome' },
  GB: { lat: 51.5074, lng: -0.1278, city: 'Londres' },
  CA: { lat: 45.4215, lng: -75.6972, city: 'Ottawa' },
  MA: { lat: 33.9716, lng: -6.8498, city: 'Rabat' },
  TN: { lat: 36.8065, lng: 10.1815, city: 'Tunis' },
};

const DEFAULT_CONFIG: SolarConfig = {
  // Localisation & Toiture
  region: 'sud_ouest',
  countryCode: 'FR',
  location: {
    lat: 44.8378,
    lng: -0.5792,
    formattedAddress: 'Bordeaux, Gironde, Nouvelle-Aquitaine, France',
    city: 'Bordeaux',
    postalCode: '33000',
    countryCode: 'FR',
    countryName: 'France',
    annualIrradiationKWhPerKWp: 1360,
    source: 'google_maps_solar',
  },
  roofAreaAvailable: 45,
  orientation: 'SUD',
  tilt: 30,
  shading: 'none',
  useAdvancedShading: false,
  obstacles: [
    {
      id: 'obs_default_1',
      name: 'Arbre côté Ouest (Soleil couchant)',
      type: 'tree',
      azimuth: 'OUEST',
      distanceMeters: 10,
      heightAboveRoofMeters: 5,
      active: false,
    },
    {
      id: 'obs_default_2',
      name: 'Maison voisine côté Est',
      type: 'building',
      azimuth: 'EST',
      distanceMeters: 8,
      heightAboveRoofMeters: 4,
      active: false,
    },
  ],

  // Consommation
  useAdvancedConsumption: false,
  annualConsumptionKWh: 6200,
  annualBillEuros: 1560,
  homeSurfaceM2: 120,
  occupantsCount: 3,
  presenceProfile: 'hybrid',
  equipment: {
    hasHeatPump: true,
    hasElectricHeating: false,
    hasElectricWaterHeater: true,
    isThermodynamicWaterHeater: false,
    hasElectricVehicle: false,
    evAnnualKm: 15000,
    hasPool: false,
    hasAirConditioning: false,
  },

  // Installation & Panneaux
  systemPowerKWp: 4.5,
  panelWattage: 430,
  panelsCount: 11,
  panelTechnology: 'topcon_ntype',
  isBifacial: false,
  bifacialGainPercent: 10,
  exactTiltDegrees: 30,
  exactAzimuthDegrees: 0,
  inverterType: 'micro',
  batteryCapacityKWh: 0,
  hasSolarRouter: true,
  hasSmartEVCharging: false,

  // Économie & Tarifs
  gridElectricityCostPerKWh: 0.2516,
  feedInTariffPerKWh: 0.1276,
  annualInflationRate: 3.0,
  customInstallationCost: null,
  isCustomGridTariff: false,
  isCustomFeedInTariff: false,
  customSubsidiesMode: 'auto',
  customSubsidiesAmount: null,
};

export default function App() {
  // 1. Initialisation : vérifier d'abord si une sauvegarde antérieure existe ("sauf enregistrement ultérieur")
  const [config, setConfig] = useState<SolarConfig>(() => {
    const saved = loadSolarConfig();
    if (saved && saved.config) {
      return saved.config;
    }
    // Détection préliminaire du pays selon le fuseau horaire
    const tzCountry = detectCountryFromTimezone();
    const profile = getCountryProfile(tzCountry);
    const regions = getRegionsForCountry(tzCountry);
    const firstRegion = (Object.keys(regions)[0] || 'centre') as RegionId;
    const regInfo = regions[firstRegion];

    const cap = COUNTRY_CAPITALS[profile.code] || COUNTRY_CAPITALS.FR;
    return {
      ...DEFAULT_CONFIG,
      countryCode: profile.code,
      region: firstRegion,
      location: {
        ...DEFAULT_CONFIG.location,
        lat: cap.lat,
        lng: cap.lng,
        city: cap.city || profile.name,
        formattedAddress: `${cap.city || profile.name}, ${profile.name}`,
        postalCode: '',
        countryCode: profile.code,
        countryName: profile.name,
        annualIrradiationKWhPerKWp: regInfo?.annualIrradiationKWhPerKWp || 1350,
        source: 'pvgis_gps',
      },
      gridElectricityCostPerKWh: profile.defaultElectricityPricePerKWh,
      feedInTariffPerKWh: profile.defaultFeedInTariffPerKWh,
    };
  });

  const [savedMeta, setSavedMeta] = useState<SavedConfigMetadata | null>(() => {
    const loaded = loadSolarConfig();
    return loaded ? loaded.meta : null;
  });

  const [isAutoSave, setIsAutoSave] = useState<boolean>(() => isAutoSaveEnabled());
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);
  const [saveNotification, setSaveNotification] = useState<{
    type: 'restored' | 'saved' | 'geolocated' | 'reset';
    message: string;
    timestamp: number;
  } | null>(null);

  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);

  // Gestion Google AdMob & Monétisation
  const [adMobSettings, setAdMobSettings] = useState<AdMobSettings>(() => loadAdMobSettings());
  const [isAdMobConfigOpen, setIsAdMobConfigOpen] = useState<boolean>(false);
  const [adMobModalState, setAdMobModalState] = useState<{
    isOpen: boolean;
    type: 'interstitial' | 'rewarded';
    rewardReason?: string;
    onRewardEarned?: () => void;
  }>({
    isOpen: false,
    type: 'interstitial',
  });

  // Détection de localisation au démarrage si AUCUN enregistrement antérieur
  useEffect(() => {
    const existing = loadSolarConfig();
    if (existing && existing.config) {
      // Configuration enregistrée trouvée : on la respecte et on ne l'écrase pas
      const dateStr = existing.meta?.savedAt
        ? new Date(existing.meta.savedAt).toLocaleDateString()
        : '';
      setSaveNotification({
        type: 'restored',
        message: `Configuration restaurée depuis votre dernière session${dateStr ? ` (${dateStr})` : ''}`,
        timestamp: Date.now(),
      });
      return;
    }

    // Sinon, détection de la position réelle de l'utilisateur par GPS
    requestBrowserGeolocation().then(async (coords) => {
      if (!coords) return;

      const { lat, lng } = coords;
      const { annualIrradiation, region } = calculateIrradiationFromCoordinates(lat, lng);
      const detectedCountry = detectCountryFromRegionId(region);

      let address = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
      let city = '';
      let countryCode = detectedCountry;
      let countryName = '';

      const apiKey =
        (typeof process !== 'undefined' && process.env?.VITE_GOOGLE_MAPS_API_KEY) ||
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
        '';

      if (apiKey) {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=fr`
          );
          const data = await res.json();
          if (data.status === 'OK' && data.results?.[0]) {
            address = data.results[0].formatted_address || address;
            for (const comp of data.results[0].address_components) {
              if (comp.types.includes('locality')) city = comp.long_name;
              else if (comp.types.includes('country')) {
                countryCode = comp.short_name.toUpperCase();
                countryName = comp.long_name;
              }
            }
          }
        } catch {
          // Erreur réseau silencieuse
        }
      }

      const profile = getCountryProfile(countryCode);
      const loc: GeoLocation = {
        lat,
        lng,
        formattedAddress: address,
        city: city || profile.name,
        postalCode: '',
        countryCode: profile.code,
        countryName: countryName || profile.name,
        annualIrradiationKWhPerKWp: annualIrradiation,
        source: 'pvgis_gps',
      };

      setConfig((prev) => createLocationBasedConfig(prev, loc, region, profile.code));

      setSaveNotification({
        type: 'geolocated',
        message: `Position détectée : ${city || profile.name} (${profile.flag} ${profile.name}) — Données PVGIS (${annualIrradiation} kWh/kWc/an) et tarifs réglementés configurés.`,
        timestamp: Date.now(),
      });
    });
  }, []);

  // Sauvegarde automatique des valeurs dès qu'une modification survient
  useEffect(() => {
    if (isAutoSave) {
      saveSolarConfig(config);
      setIsSavedRecently(true);
      const t = setTimeout(() => setIsSavedRecently(false), 2000);
      return () => clearTimeout(t);
    }
  }, [config, isAutoSave]);

  // Simulation en direct
  const results = useMemo(() => {
    return runSolarSimulation(config);
  }, [config]);

  // Scénarios d'optimisation
  const presets = useMemo(() => {
    return calculateOptimizationPresets(config);
  }, [config.annualConsumptionKWh, config.annualBillEuros, config.useAdvancedConsumption, config.equipment]);

  const handleConfigChange = (updated: Partial<SolarConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleManualSave = () => {
    const success = saveSolarConfig(config);
    if (success) {
      const now = new Date().toISOString();
      setSavedMeta({
        savedAt: now,
        city: config.location?.city,
        countryCode: config.countryCode,
        systemPowerKWp: config.systemPowerKWp,
      });
      setIsSavedRecently(true);
      setSaveNotification({
        type: 'saved',
        message: 'Toutes vos valeurs saisies sont enregistrées ! Vous les retrouverez automatiquement à votre prochaine visite.',
        timestamp: Date.now(),
      });
      setTimeout(() => setIsSavedRecently(false), 3000);
    }
  };

  const handleToggleAutoSave = () => {
    const next = !isAutoSave;
    setIsAutoSave(next);
    setAutoSaveEnabled(next);
    if (next) {
      saveSolarConfig(config);
    }
  };

  const handleResetToCurrentLocation = async () => {
    clearSavedSolarConfig();
    setSavedMeta(null);
    setSaveNotification({
      type: 'geolocated',
      message: 'Détection GPS en cours...',
      timestamp: Date.now(),
    });

    const coords = await requestBrowserGeolocation();
    if (coords) {
      const { lat, lng } = coords;
      const { annualIrradiation, region } = calculateIrradiationFromCoordinates(lat, lng);
      const detectedCountry = detectCountryFromRegionId(region);

      let address = `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`;
      let city = '';
      let countryCode = detectedCountry;
      let countryName = '';

      const apiKey =
        (typeof process !== 'undefined' && process.env?.VITE_GOOGLE_MAPS_API_KEY) ||
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
        '';

      if (apiKey) {
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=fr`
          );
          const data = await res.json();
          if (data.status === 'OK' && data.results?.[0]) {
            address = data.results[0].formatted_address || address;
            for (const comp of data.results[0].address_components) {
              if (comp.types.includes('locality')) city = comp.long_name;
              else if (comp.types.includes('country')) {
                countryCode = comp.short_name.toUpperCase();
                countryName = comp.long_name;
              }
            }
          }
        } catch {
          // Ignorer
        }
      }

      const profile = getCountryProfile(countryCode);
      const loc: GeoLocation = {
        lat,
        lng,
        formattedAddress: address,
        city: city || profile.name,
        postalCode: '',
        countryCode: profile.code,
        countryName: countryName || profile.name,
        annualIrradiationKWhPerKWp: annualIrradiation,
        source: 'pvgis_gps',
      };

      const newConf = createLocationBasedConfig(DEFAULT_CONFIG, loc, region, profile.code);
      setConfig(newConf);
      saveSolarConfig(newConf);

      setSaveNotification({
        type: 'geolocated',
        message: `Réinitialisé selon votre position GPS : ${city || profile.name} (${profile.flag} ${profile.name}) — Données PVGIS (${annualIrradiation} kWh/kWc/an) appliquées.`,
        timestamp: Date.now(),
      });
    } else {
      // Si refus de géolocalisation, détection fuseau
      const tzCountry = detectCountryFromTimezone();
      const profile = getCountryProfile(tzCountry);
      const regions = getRegionsForCountry(tzCountry);
      const firstReg = (Object.keys(regions)[0] || 'centre') as RegionId;
      const regInfo = regions[firstReg];

      const cap = COUNTRY_CAPITALS[profile.code] || COUNTRY_CAPITALS.FR;
      const loc: GeoLocation = {
        lat: cap.lat,
        lng: cap.lng,
        formattedAddress: `${cap.city || profile.name}, ${profile.name}`,
        city: cap.city || profile.name,
        postalCode: '',
        annualIrradiationKWhPerKWp: regInfo?.annualIrradiationKWhPerKWp || 1350,
        source: 'pvgis_gps',
        countryCode: profile.code,
        countryName: profile.name,
      };

      const newConf = createLocationBasedConfig(DEFAULT_CONFIG, loc, firstReg, profile.code);
      setConfig(newConf);
      saveSolarConfig(newConf);

      setSaveNotification({
        type: 'geolocated',
        message: `Réinitialisé selon la position par défaut : ${profile.flag} ${profile.name}`,
        timestamp: Date.now(),
      });
    }
  };

  const handleReset = () => {
    clearSavedSolarConfig();
    setSavedMeta(null);
    setConfig(DEFAULT_CONFIG);
    setSaveNotification({
      type: 'reset',
      message: 'Paramètres réinitialisés aux valeurs standard usine (4.5 kWc, France).',
      timestamp: Date.now(),
    });
  };

  const handleApplyPreset = (presetConfig: Partial<SolarConfig>) => {
    setConfig((prev) => ({ ...prev, ...presetConfig }));
  };

  const handleLocationChange = (newLocation: GeoLocation, newRegion: RegionId) => {
    setConfig((prev) => {
      const detectedCountry = newLocation.countryCode || prev.countryCode || 'FR';
      return {
        ...prev,
        location: newLocation,
        region: newRegion,
        countryCode: detectedCountry,
      };
    });
  };

  const handleOpenReport = () => {
    if (adMobSettings.enabled && adMobSettings.enableInterstitials) {
      setAdMobModalState({
        isOpen: true,
        type: 'interstitial',
      });
    }
    setIsReportOpen(true);
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900 pb-16">
      {/* Top Header */}
      <Header
        onReset={handleReset}
        onResetToCurrentLocation={handleResetToCurrentLocation}
        onSave={handleManualSave}
        onOpenReport={handleOpenReport}
        systemPowerKWp={config.systemPowerKWp}
        selfConsumptionRate={results.selfConsumptionRate}
        isSavedRecently={isSavedRecently}
        isAutoSave={isAutoSave}
        onToggleAutoSave={handleToggleAutoSave}
        savedDate={savedMeta?.savedAt}
        currentCountryFlag={results.countryProfile?.flag}
        currentCity={config.location?.city}
        onOpenAdMobConfig={() => setIsAdMobConfigOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Bandeau d'information / Sauvegarde / Géolocalisation */}
        {saveNotification && (
          <div
            className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs transition-all ${
              saveNotification.type === 'saved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : saveNotification.type === 'restored'
                ? 'bg-amber-50/90 border-amber-200 text-amber-950'
                : saveNotification.type === 'geolocated'
                ? 'bg-sky-50 border-sky-200 text-sky-950'
                : 'bg-neutral-50 border-neutral-200 text-neutral-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {saveNotification.type === 'saved' && (
                <div className="p-1 bg-emerald-200/70 rounded-md text-emerald-800">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
              {saveNotification.type === 'restored' && (
                <div className="p-1 bg-amber-200/70 rounded-md text-amber-800 font-bold">
                  💾
                </div>
              )}
              {saveNotification.type === 'geolocated' && (
                <div className="p-1 bg-sky-200/70 rounded-md text-sky-800">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
              )}
              {saveNotification.type === 'reset' && (
                <div className="p-1 bg-neutral-200/70 rounded-md text-neutral-700">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
              )}
              <div>
                <span className="font-semibold">{saveNotification.message}</span>
                {saveNotification.type === 'restored' && (
                  <span className="hidden sm:inline text-neutral-500 ml-1.5">
                    — Vos réglages sont sauvegardés.
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {saveNotification.type === 'restored' && (
                <button
                  type="button"
                  onClick={handleResetToCurrentLocation}
                  className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold transition-colors"
                >
                  Position GPS
                </button>
              )}
              <button
                type="button"
                onClick={() => setSaveNotification(null)}
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* KPI Dashboard Grid */}
        <MetricsOverview
          results={results}
          systemPowerKWp={config.systemPowerKWp}
          onOpenExplainer={() => setIsExplainerOpen(true)}
        />

        {/* Google AdMob Inline Banner (Sponsorisé Transition Énergétique) */}
        <AdMobBanner
          settings={adMobSettings}
          variant="inline"
          onOpenConfig={() => setIsAdMobConfigOpen(true)}
          className="my-3"
        />

        {/* AI & Algorithmic Optimizer Engine */}
        <OptimizerPanel
          config={config}
          results={results}
          presets={presets}
          onApplyPreset={handleApplyPreset}
        />

        {/* Google Maps Satellite Installation & Roof Position Picker */}
        <GoogleMapsInstallationPicker
          location={config.location}
          onLocationChange={handleLocationChange}
          systemPowerKWp={config.systemPowerKWp}
        />

        {/* 2-Column Split: Controls vs Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Interactive Configuration Form */}
          <div className="lg:col-span-5 space-y-6">
            <ConfigurationForm
              config={config}
              shadingDetails={results.shadingDetails}
              costBreakdown={results.costBreakdown}
              countryProfile={results.countryProfile}
              onChange={handleConfigChange}
            />
          </div>

          {/* Right Column: Visual Charts & Technical Analysis */}
          <div className="lg:col-span-7 space-y-6">
            {/* Chart 1: 24h Hourly Profile */}
            <HourlySimulationChart
              hourlyProfiles={results.hourlyProfiles}
              hasBattery={config.batteryCapacityKWh > 0}
              hasRouter={config.hasSolarRouter}
            />

            {/* Chart 2: 12-Month Saisonnier Balance */}
            <MonthlyProductionChart monthlyData={results.monthlyData} />

            {/* Chart 3: 25-Year Cumulative ROI */}
            <FinancialProjectionChart
              projections={results.projections25Years}
              paybackPeriodYears={results.paybackPeriodYears}
              netInvestmentCost={results.netInvestmentCost}
              currency={results.countryProfile?.currency}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Hélios Solaire • Simulateur d'autoconsommation photovoltaïque résidentielle internationale
          </p>
          <p className="text-neutral-400">
            Calculs conformes aux données solaires PVGIS / NREL et réglementations officielles nationales
          </p>
        </div>
      </footer>

      {/* Modal Dossier / Rapport */}
      <DetailedReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        config={config}
        results={results}
      />

      {/* Modal d'explication pédagogique des modules de calcul */}
      <CalculationExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
        config={config}
        results={results}
      />

      {/* Google AdMob : Bannière adaptative mobile (Bas d'écran) */}
      <AdMobBanner
        settings={adMobSettings}
        variant="bottom"
        onOpenConfig={() => setIsAdMobConfigOpen(true)}
      />

      {/* Modal de configuration Google AdMob */}
      <AdMobConfigModal
        isOpen={isAdMobConfigOpen}
        onClose={() => setIsAdMobConfigOpen(false)}
        settings={adMobSettings}
        onSaveSettings={(newSettings) => setAdMobSettings(newSettings)}
        onTriggerTestAd={(type) => {
          setAdMobModalState({
            isOpen: true,
            type,
            rewardReason:
              type === 'rewarded'
                ? "Déblocage de l'expertise financière & export PDF"
                : undefined,
          });
        }}
      />

      {/* Modal plein écran Interstitiel / Annonce avec récompense */}
      <AdMobModal
        isOpen={adMobModalState.isOpen}
        type={adMobModalState.type}
        rewardReason={adMobModalState.rewardReason}
        settings={adMobSettings}
        onClose={() => setAdMobModalState((prev) => ({ ...prev, isOpen: false }))}
        onRewardEarned={adMobModalState.onRewardEarned}
      />
    </div>
  );
}
