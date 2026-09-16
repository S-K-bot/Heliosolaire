import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Compass,
  Sliders,
  Zap,
  Battery,
  Home,
  Users,
  Car,
  Flame,
  Droplets,
  Waves,
  SunMedium,
  CircleGauge,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Trees,
  Receipt,
  Globe,
  Building2,
  ShieldCheck,
  Scale,
  Layers,
  Sparkles,
  RotateCcw,
  Check,
  Settings2,
  FileText,
  SlidersHorizontal,
  AlertCircle,
  Info,
  Percent,
  CheckCircle2,
  Calculator,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  SolarConfig,
  RegionId,
  Orientation,
  InclinasonType,
  ShadingLevel,
  InverterType,
  PresenceProfile,
  ShadingImpactDetails,
  InstallationCostBreakdown as CostBreakdownType,
  CountryProfile,
} from '../types';
import {
  REGIONS,
  ORIENTATION_FACTORS,
  TILT_FACTORS,
  SHADING_FACTORS,
  getRegionsForCountry,
  getRegionInfo,
} from '../data/regions';
import {
  COUNTRIES,
  getCountryProfile,
  generateInstallationCostBreakdown,
  calculateCountrySubsidies,
  formatMoney,
} from '../data/countries';
import { PANEL_TECHNOLOGIES, PanelTechnologyType } from '../data/solarTechnologies';
import { ShadingAnalysisCard } from './ShadingAnalysisCard';
import { InstallationCostBreakdown } from './InstallationCostBreakdown';
import { BillScannerCard } from './BillScannerCard';

interface ConfigurationFormProps {
  config: SolarConfig;
  shadingDetails: ShadingImpactDetails;
  costBreakdown?: CostBreakdownType;
  countryProfile?: CountryProfile;
  onChange: (updated: Partial<SolarConfig>) => void;
}

export const ConfigurationForm: React.FC<ConfigurationFormProps> = ({
  config,
  shadingDetails,
  costBreakdown,
  countryProfile,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<
    'solar' | 'costs' | 'consumption' | 'house' | 'shading' | 'tariffs'
  >('solar');
  const [showBillHelp, setShowBillHelp] = useState<boolean>(false);
  const [isEditingGridTariff, setIsEditingGridTariff] = useState<boolean>(false);
  const [isEditingFeedInTariff, setIsEditingFeedInTariff] = useState<boolean>(false);
  const [isCustomWattage, setIsCustomWattage] = useState<boolean>(
    ![375, 400, 425, 435, 500, 600, 700].includes(config.panelWattage)
  );
  const [customWattageInput, setCustomWattageInput] = useState<string>(
    String(config.panelWattage || 430)
  );
  const [isWattageFocused, setIsWattageFocused] = useState<boolean>(false);
  const wattageInputRef = useRef<HTMLInputElement>(null);

  // Synchroniser l'input quand config.panelWattage change de l'extérieur
  useEffect(() => {
    if (!isWattageFocused) {
      setCustomWattageInput(String(config.panelWattage || 430));
      setIsCustomWattage(![375, 400, 425, 435, 500, 600, 700].includes(config.panelWattage));
    }
  }, [config.panelWattage, isWattageFocused]);

  const currentCountry =
    countryProfile || getCountryProfile(config.countryCode || config.location?.countryCode);

  const effectiveCostBreakdown =
    costBreakdown || generateInstallationCostBreakdown(config, currentCountry);

  const panelsCount =
    config.panelsCount && config.panelsCount > 0
      ? config.panelsCount
      : Math.max(1, Math.round((config.systemPowerKWp * 1000) / (config.panelWattage || 430)));
  const estimatedSurfaceM2 = Math.round(panelsCount * 1.95 * 10) / 10;
  const currentPanelTech =
    PANEL_TECHNOLOGIES[config.panelTechnology || 'topcon_ntype'] || PANEL_TECHNOLOGIES.topcon_ntype;

  const handleCountryChange = (newCountryCode: string) => {
    const profile = getCountryProfile(newCountryCode);
    const countryRegions = getRegionsForCountry(newCountryCode);
    const regionKeys = Object.keys(countryRegions);
    const newRegion = regionKeys.includes(config.region) ? config.region : (regionKeys[0] || 'centre');
    onChange({
      countryCode: newCountryCode,
      region: newRegion,
      gridElectricityCostPerKWh: profile.defaultElectricityPricePerKWh,
      feedInTariffPerKWh: profile.defaultFeedInTariffPerKWh,
      isCustomGridTariff: false,
      isCustomFeedInTariff: false,
      customVatRate: null,
      customSubsidiesMode: 'auto',
      customSubsidiesAmount: null,
    });
  };

  const handlePanelCountChange = (count: number) => {
    const safeCount = Math.max(1, Math.min(120, count));
    const wattage = config.panelWattage || 430;
    const newKWp = Math.round(((safeCount * wattage) / 1000) * 100) / 100;
    onChange({
      panelsCount: safeCount,
      systemPowerKWp: newKWp,
    });
  };

  const handlePanelWattageChange = (wattage: number) => {
    const safeWattage = Math.max(100, Math.min(2000, wattage));
    const count = panelsCount;
    const newKWp = Math.round(((count * safeWattage) / 1000) * 100) / 100;
    setCustomWattageInput(String(safeWattage));
    onChange({
      panelWattage: safeWattage,
      systemPowerKWp: newKWp,
    });
  };

  const handleCustomWattageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Permettre l'effacement complet (raw === '') sans écraser ni bloquer l'utilisateur !
    setCustomWattageInput(raw);
    setIsCustomWattage(true);

    if (raw.trim() === '') {
      return;
    }

    const clean = raw.replace(',', '.');
    let parsed = parseFloat(clean);
    if (!isNaN(parsed) && parsed > 0) {
      // Détecte si l'utilisateur saisit en kWc (ex: 0.6 ou 0.7 ou 0.65 kWc)
      if (parsed > 0 && parsed <= 2.5) {
        parsed = Math.round(parsed * 1000);
      }
      if (parsed >= 50 && parsed <= 2500) {
        const safe = Math.round(parsed);
        const count = panelsCount;
        const newKWp = Math.round(((count * safe) / 1000) * 100) / 100;
        onChange({
          panelWattage: safe,
          systemPowerKWp: newKWp,
        });
      }
    }
  };

  const handleCustomWattageBlur = () => {
    setIsWattageFocused(false);
    const raw = customWattageInput.trim();
    if (raw === '') {
      const fallback = config.panelWattage || 430;
      setCustomWattageInput(String(fallback));
      return;
    }

    let parsed = parseFloat(raw.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) {
      setCustomWattageInput(String(config.panelWattage || 430));
    } else {
      if (parsed > 0 && parsed <= 2.5) {
        parsed = Math.round(parsed * 1000);
      }
      const safe = Math.max(100, Math.min(2000, Math.round(parsed)));
      setCustomWattageInput(String(safe));
      handlePanelWattageChange(safe);
    }
  };

  const handleStepWattage = (delta: number) => {
    const current = config.panelWattage || 430;
    const next = Math.max(100, Math.min(2000, current + delta));
    setIsCustomWattage(true);
    handlePanelWattageChange(next);
  };

  const handleSystemPowerChange = (kwp: number) => {
    const safeKWp = Math.max(1.0, Math.min(36.0, kwp));
    const wattage = config.panelWattage || 430;
    const newCount = Math.max(1, Math.round((safeKWp * 1000) / wattage));
    onChange({
      systemPowerKWp: safeKWp,
      panelsCount: newCount,
    });
  };

  const handleExactTiltChange = (deg: number) => {
    const closestTilt: InclinasonType =
      deg < 8 ? 0 : deg < 22 ? 15 : deg < 38 ? 30 : deg < 52 ? 45 : 60;
    onChange({
      exactTiltDegrees: deg,
      tilt: closestTilt,
    });
  };

  const handleResetToCountryDefaults = () => {
    onChange({
      gridElectricityCostPerKWh: currentCountry.defaultElectricityPricePerKWh,
      feedInTariffPerKWh: currentCountry.defaultFeedInTariffPerKWh,
      customVatRate: null,
      customSubsidiesMode: 'auto',
      customSubsidiesAmount: null,
      customInstallationCost: null,
      annualInflationRate: 3.0,
      isCustomGridTariff: false,
      isCustomFeedInTariff: false,
    });
    setIsEditingGridTariff(false);
    setIsEditingFeedInTariff(false);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Quick Country Switcher & Localized Specs Banner */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-amber-500/10 via-amber-50 to-white border-b border-neutral-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-neutral-600 font-medium">Pays d'implantation :</span>
          <div className="flex items-center gap-1.5 font-bold text-neutral-900 bg-white px-2 py-0.5 rounded-md border border-amber-200/80 shadow-2xs">
            <span className="text-base leading-none">{currentCountry.flag}</span>
            <span>{currentCountry.name}</span>
            <span className="text-[10px] text-amber-800 font-mono">({currentCountry.currency.code} {currentCountry.currency.symbol})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="select-country-top" className="text-[11px] text-neutral-500 hidden sm:inline">
            Sélectionner :
          </label>
          <select
            id="select-country-top"
            value={currentCountry.code}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="text-xs font-semibold bg-white border border-neutral-300 rounded-lg px-2.5 py-1 text-neutral-800 hover:border-amber-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden shadow-2xs cursor-pointer"
          >
            {Object.values(COUNTRIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.currency.symbol})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold text-neutral-600">
        <button
          type="button"
          id="tab-solar"
          onClick={() => setActiveTab('solar')}
          className={`py-3 px-1.5 sm:px-2 flex items-center justify-center gap-1 border-b-2 transition-all ${
            activeTab === 'solar'
              ? 'border-amber-600 text-amber-700 bg-white font-bold shadow-2xs'
              : 'border-transparent hover:text-neutral-900 hover:bg-neutral-100/60'
          }`}
        >
          <SunMedium className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Installation</span>
        </button>

        <button
          type="button"
          id="tab-costs"
          onClick={() => setActiveTab('costs')}
          className={`py-3 px-1.5 sm:px-2 flex items-center justify-center gap-1 border-b-2 transition-all ${
            activeTab === 'costs'
              ? 'border-amber-600 text-amber-700 bg-white font-bold shadow-2xs'
              : 'border-transparent hover:text-neutral-900 hover:bg-neutral-100/60'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate font-bold">Volet Coûts</span>
        </button>

        <button
          type="button"
          id="tab-consumption"
          onClick={() => setActiveTab('consumption')}
          className={`py-3 px-1.5 sm:px-2 flex items-center justify-center gap-1 border-b-2 transition-all ${
            activeTab === 'consumption'
              ? 'border-amber-600 text-amber-700 bg-white font-bold shadow-2xs'
              : 'border-transparent hover:text-neutral-900 hover:bg-neutral-100/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Conso</span>
        </button>

        <button
          type="button"
          id="tab-house"
          onClick={() => setActiveTab('house')}
          className={`py-3 px-1.5 sm:px-2 flex items-center justify-center gap-1 border-b-2 transition-all ${
            activeTab === 'house'
              ? 'border-amber-600 text-amber-700 bg-white font-bold shadow-2xs'
              : 'border-transparent hover:text-neutral-900 hover:bg-neutral-100/60'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Toiture & Pays</span>
        </button>

        <button
          type="button"
          id="tab-shading"
          onClick={() => setActiveTab('shading')}
          className={`py-3 px-1.5 sm:px-2 flex items-center justify-center gap-1 border-b-2 transition-all relative ${
            activeTab === 'shading'
              ? 'border-amber-600 text-amber-700 bg-white font-bold shadow-2xs'
              : 'border-transparent hover:text-neutral-900 hover:bg-neutral-100/60'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Ombrage</span>
          {shadingDetails.lossPercentage > 0 && (
            <span className="ml-0.5 px-1 py-0.2 rounded text-[9px] font-extrabold bg-amber-200 text-amber-900">
              -{shadingDetails.lossPercentage}%
            </span>
          )}
        </button>

        <button
          type="button"
          id="tab-tariffs"
          onClick={() => setActiveTab('tariffs')}
          className={`py-3 px-1.5 sm:px-2 flex items-center justify-center gap-1 border-b-2 transition-all ${
            activeTab === 'tariffs'
              ? 'border-amber-600 text-amber-700 bg-white font-bold shadow-2xs'
              : 'border-transparent hover:text-neutral-900 hover:bg-neutral-100/60'
          }`}
        >
          <CircleGauge className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="truncate">Réglementation</span>
          <span className="ml-0.5 px-1 py-0.2 rounded text-[9px] font-extrabold bg-amber-200 text-amber-900">
            Scan IA
          </span>
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {/* TAB 1: INSTALLATION SOLAIRE */}
        {activeTab === 'solar' && (
          <div className="space-y-6">
            {/* 1. Puissance installée et Dimensionnement des Panneaux */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                  <SunMedium className="w-4 h-4 text-amber-500" />
                  Puissance crête installée :
                  <span className="text-amber-700 font-bold text-base ml-1">
                    {config.systemPowerKWp} kWc
                  </span>
                </label>
                <span className="text-xs text-neutral-600 font-medium bg-neutral-100 px-2 py-0.5 rounded-md">
                  {panelsCount} modules × {config.panelWattage} Wc (~{estimatedSurfaceM2} m²)
                </span>
              </div>

              {/* Quick power presets */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
                {[2.5, 3.0, 4.5, 6.0, 7.5, 9.0].map((kwp) => (
                  <button
                    key={kwp}
                    type="button"
                    onClick={() => handleSystemPowerChange(kwp)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      config.systemPowerKWp === kwp
                        ? 'border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-500'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {kwp} kWc
                  </button>
                ))}
              </div>

              <input
                id="range-power-kwp"
                type="range"
                min="1.5"
                max="12.0"
                step="0.1"
                value={config.systemPowerKWp}
                onChange={(e) => handleSystemPowerChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
              <div className="flex justify-between text-[11px] text-neutral-600 mt-1">
                <span>1.5 kWc (petit toit)</span>
                <span className="font-semibold text-amber-800">3 kWc (palier fiscal standard)</span>
                <span>6 kWc</span>
                <span>9 kWc</span>
                <span>12 kWc</span>
              </div>
            </div>

            {/* 2. Paramétrage Fin des Panneaux (Nombre & Puissance unitaire) */}
            <div className="p-4 bg-neutral-50/80 rounded-xl border border-neutral-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                  Dimensionnement précis des modules
                </span>
                <span className="text-[11px] text-neutral-500">
                  Surface toiture estimée : <strong>{estimatedSurfaceM2} m²</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre de panneaux avec incrément */}
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">
                    Nombre de panneaux photovoltaïques :
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePanelCountChange(panelsCount - 1)}
                      disabled={panelsCount <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 font-bold disabled:opacity-40"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={panelsCount}
                      onChange={(e) => handlePanelCountChange(parseInt(e.target.value) || 1)}
                      className="w-20 text-center py-1 px-2 border border-neutral-300 rounded-lg text-sm font-bold text-neutral-900 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => handlePanelCountChange(panelsCount + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 font-bold"
                    >
                      +
                    </button>
                    <span className="text-xs text-neutral-600 font-medium">panneaux</span>
                  </div>
                </div>

                {/* Puissance unitaire du panneau (Wc) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-neutral-800 block">
                      Puissance unitaire du module (Wc) :
                    </label>
                    <span className="text-[11px] font-bold text-amber-700">
                      {(config.panelWattage / 1000).toFixed(3).replace(/\.?0+$/, '')} kWc / panneau
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[375, 400, 425, 435, 500, 600, 700].map((watt) => (
                      <button
                        key={watt}
                        type="button"
                        onClick={() => {
                          setIsCustomWattage(false);
                          handlePanelWattageChange(watt);
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                          config.panelWattage === watt && !isCustomWattage
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-bold'
                            : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                        }`}
                      >
                        {watt >= 600 ? `${watt} Wc (${watt / 1000} kWc)` : `${watt} Wc`}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsCustomWattage(true)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-all flex items-center gap-1 ${
                        isCustomWattage || ![375, 400, 425, 435, 500, 600, 700].includes(config.panelWattage)
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs font-bold'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                      }`}
                    >
                      Autre (saisie libre)
                    </button>
                  </div>

                  {/* Saisie personnalisée / libre optimisée */}
                  <div className="mt-2.5 p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs text-neutral-700">
                        <span className="font-semibold text-neutral-900">Saisie libre & personnalisée : </span>
                        Entrez la valeur exacte (ex: 585 Wc, 600 Wc, 650 Wc, 700 Wc...)
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-neutral-700 mr-1">Raccourcis :</span>
                        {[585, 600, 650, 660, 700].map((quickWatt) => (
                          <button
                            key={quickWatt}
                            type="button"
                            onClick={() => {
                              setIsCustomWattage(true);
                              handlePanelWattageChange(quickWatt);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                              config.panelWattage === quickWatt
                                ? 'bg-amber-600 text-white border-amber-600 font-bold'
                                : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                            }`}
                          >
                            {quickWatt} Wc
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Steppers +/- 10 Wc */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStepWattage(-10)}
                          className="px-2 py-1 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                          title="Diminuer de 10 Wc"
                        >
                          -10 Wc
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStepWattage(+10)}
                          className="px-2 py-1 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-bold transition-colors shadow-2xs"
                          title="Augmenter de 10 Wc"
                        >
                          +10 Wc
                        </button>
                      </div>

                      {/* Champ de saisie libre avec bouton d'effacement */}
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="relative flex items-center">
                          <input
                            ref={wattageInputRef}
                            type="text"
                            inputMode="numeric"
                            value={customWattageInput}
                            onFocus={() => setIsWattageFocused(true)}
                            onChange={handleCustomWattageInputChange}
                            onBlur={handleCustomWattageBlur}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            placeholder="Ex: 600"
                            className="w-28 py-1.5 pl-3 pr-7 text-center text-sm font-bold border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-2xs"
                          />
                          {customWattageInput && (
                            <button
                              type="button"
                              onClick={() => {
                                setCustomWattageInput('');
                                setIsCustomWattage(true);
                                wattageInputRef.current?.focus();
                              }}
                              className="absolute right-1.5 p-0.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/80 rounded transition-colors"
                              title="Effacer le champ"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <span className="text-xs font-bold text-neutral-700">Wc</span>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                          {((config.panelWattage || 0) / 1000).toFixed(3).replace(/\.?0+$/, '')} kWc / panneau
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Technologie des Panneaux (N-Type TOPCon, HJT, PERC, Poly) */}
            <div className="pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  Technologie de cellules photovoltaïques
                </label>
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Rendement : {currentPanelTech.efficiencyPercent}% • Garantie : {currentPanelTech.warrantyYears} ans
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(PANEL_TECHNOLOGIES) as PanelTechnologyType[]).map((techKey) => {
                  const tech = PANEL_TECHNOLOGIES[techKey];
                  const isSelected = (config.panelTechnology || 'topcon_ntype') === techKey;
                  return (
                    <button
                      key={techKey}
                      type="button"
                      onClick={() => onChange({ panelTechnology: techKey })}
                      className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500 shadow-2xs'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                            {tech.shortName}
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                          </div>
                          <div className="text-[10px] text-neutral-500 font-medium mt-0.5">
                            {tech.badge}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                            {tech.efficiencyPercent}%
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-600">
                        <span>Coeff. temp : <strong>{tech.tempCoeffPercentPerC} %/°C</strong></span>
                        <span>Dégradation : <strong>{(tech.degradationPerYear * 100).toFixed(2)} %/an</strong></span>
                        <span>Garantie : <strong>{tech.warrantyYears} ans</strong></span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-[11px] text-neutral-500 mt-2">
                💡 <em>{currentPanelTech.description}</em>
              </p>
            </div>

            {/* 4. Option Modules Bifaciaux (Bi-verre captation arrière) */}
            <div className="pt-4 border-t border-neutral-200">
              <div
                className={`p-3.5 rounded-xl border transition-all ${
                  config.isBifacial
                    ? 'border-amber-500 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-white ring-1 ring-amber-500'
                    : 'border-neutral-200 bg-neutral-50/40 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 text-amber-800 rounded-lg mt-0.5 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                        Technologie Bi-verre Bifaciale (Face arrière active)
                        <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-2 py-0.2 rounded-full">
                          +5% à +20% d'albédo
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-600 mt-0.5">
                        Capte le rayonnement réfléchi sur la toiture ou le sol par la face inférieure du panneau (verre trempé double face).
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={Boolean(config.isBifacial)}
                      onChange={(e) => onChange({ isBifacial: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {config.isBifacial && (
                  <div className="mt-3 pt-3 border-t border-amber-200/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-800">
                        Gain d'albédo arrière estimé :
                      </span>
                      <span className="font-bold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-300">
                        +{config.bifacialGainPercent ?? 10}% de production supplémentaire
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { label: 'Toiture sombre (+5%)', val: 5 },
                        { label: 'Tuiles claires (+10%)', val: 10 },
                        { label: 'Membrane blanche (+15%)', val: 15 },
                        { label: 'Sol clair / Gravier (+20%)', val: 20 },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => onChange({ bifacialGainPercent: item.val })}
                          className={`py-1 px-2 rounded text-[11px] font-medium border transition-all ${
                            (config.bifacialGainPercent ?? 10) === item.val
                              ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-amber-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 5. Inclinaison et Orientation des Panneaux */}
            <div className="pt-4 border-t border-neutral-200 space-y-4">
              <label className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-600" />
                Inclinaison et Orientation des Panneaux
              </label>

              {/* Inclinaison précise (0° à 90°) */}
              <div className="p-3 bg-neutral-50/70 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-800">
                    Pente / Inclinaison du toit :
                  </span>
                  <span className="text-sm font-bold text-amber-800 bg-white px-2.5 py-0.5 rounded border border-amber-200 shadow-2xs">
                    {config.exactTiltDegrees ?? config.tilt ?? 30}°
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                  {[
                    { label: 'Toit plat (0°)', deg: 0 },
                    { label: 'Douce (15°)', deg: 15 },
                    { label: 'Optimale (30°)', deg: 30 },
                    { label: 'Forte (45°)', deg: 45 },
                    { label: 'Façade (60°)', deg: 60 },
                  ].map((preset) => (
                    <button
                      key={preset.deg}
                      type="button"
                      onClick={() => handleExactTiltChange(preset.deg)}
                      className={`py-1 px-1.5 rounded text-[10px] sm:text-xs font-semibold border transition-all text-center ${
                        (config.exactTiltDegrees ?? config.tilt) === preset.deg
                          ? 'border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-500'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="0"
                  max="90"
                  step="1"
                  value={config.exactTiltDegrees ?? config.tilt ?? 30}
                  onChange={(e) => handleExactTiltChange(parseInt(e.target.value) || 0)}
                  className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <span>0° (Horizontal)</span>
                  <span className="text-amber-700 font-semibold">30° - 35° (Optimum PVGIS)</span>
                  <span>45°</span>
                  <span>90° (Façade verticale)</span>
                </div>
              </div>

              {/* Orientation / Azimut */}
              <div className="p-3 bg-neutral-50/70 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-800">
                    Orientation des modules :
                  </span>
                  <span className="text-xs font-bold text-neutral-800 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {ORIENTATION_FACTORS[config.orientation]?.label} ({ORIENTATION_FACTORS[config.orientation]?.factor * 100}%)
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {(Object.keys(ORIENTATION_FACTORS) as Orientation[]).map((ori) => {
                    const info = ORIENTATION_FACTORS[ori];
                    const isSelected = config.orientation === ori;
                    return (
                      <button
                        key={ori}
                        type="button"
                        onClick={() => onChange({ orientation: ori })}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-500'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                        }`}
                      >
                        <div>{info.label.split(' ')[0]}</div>
                        <div className="text-[10px] opacity-75">{Math.round(info.factor * 100)}%</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 6. Type d'onduleur */}
            <div className="pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-neutral-900 block">
                  Technologie d'onduleur
                </label>
                <span className="text-[11px] text-neutral-500 font-medium">
                  {config.inverterType === 'string_central'
                    ? '1 onduleur central pour tous les panneaux'
                    : config.inverterType === 'micro'
                    ? '1 micro-onduleur sous chaque panneau'
                    : '1 onduleur central + optimiseurs'}
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Option A : Onduleur unique pour tous les panneaux */}
                <label
                  className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all ${
                    config.inverterType === 'string_central'
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500 shadow-2xs'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="inverterType"
                    checked={config.inverterType === 'string_central'}
                    onChange={() => onChange({ inverterType: 'string_central' })}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-xs font-bold text-neutral-900">
                        Onduleur unique pour tous les panneaux (Centralisé / Chaîne)
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Le plus économique à l'achat
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                      Un seul boîtier mural central pour l'ensemble des panneaux câblés en série (string) (ex: Fronius Primo/Symo, SMA Sunny Boy, Huawei SUN2000, Sungrow).
                      Solution très robuste et éprouvée, idéale pour toiture homogène sans ombrages complexes. Remplacement de l'onduleur prévu vers 10-15 ans.
                    </div>
                  </div>
                </label>

                {/* Option B : Micro-onduleurs individuels */}
                <label
                  className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all ${
                    config.inverterType === 'micro'
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500 shadow-2xs'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="inverterType"
                    checked={config.inverterType === 'micro'}
                    onChange={() => onChange({ inverterType: 'micro' })}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-xs font-bold text-neutral-900">
                        Micro-onduleurs individuels (1 par panneau)
                      </span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Recommandé en cas d'ombres
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                      1 micro-onduleur sous chaque panneau (ex: Enphase IQ8, Hoymiles, APSystems). Chaque panneau produit à son point de puissance maximum (MPPT indépendant) : si un panneau subit une ombre, les autres continuent à plein régime. Garantie constructeur 25 ans.
                    </div>
                  </div>
                </label>

                {/* Option C : Onduleur central avec optimiseurs */}
                <label
                  className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all ${
                    config.inverterType === 'string_opt'
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500 shadow-2xs'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="inverterType"
                    checked={config.inverterType === 'string_opt'}
                    onChange={() => onChange({ inverterType: 'string_opt' })}
                    className="mt-1 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-xs font-bold text-neutral-900">
                        Onduleur central avec optimiseurs de puissance
                      </span>
                      <span className="text-[10px] font-semibold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                        Monitoring panneau par panneau
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                      1 onduleur central mural hybride couplé à 1 boîte d'optimisation DC/DC sous chaque panneau (ex: SolarEdge). Permet d'atténuer les ombres et de suivre la production exacte de chaque panneau sur application mobile.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* 7. Batterie de stockage */}
            <div className="pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                  <Battery className="w-4 h-4 text-emerald-600" />
                  Batterie de stockage physique (Lithium LFP) :
                  <span className="text-emerald-700 font-bold text-base ml-1">
                    {config.batteryCapacityKWh > 0 ? `${config.batteryCapacityKWh} kWh` : 'Sans batterie'}
                  </span>
                </label>
                {config.batteryCapacityKWh > 0 && (
                  <span className="text-xs text-neutral-500">
                    +{formatMoney(config.batteryCapacityKWh * (effectiveCostBreakdown?.items.find((i) => i.id === 'post_opt_battery')?.unitPriceHT || 590), currentCountry.currency)} estimés
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {[0, 5, 10, 15].map((kwh) => (
                  <button
                    key={kwh}
                    type="button"
                    onClick={() => onChange({ batteryCapacityKWh: kwh })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      config.batteryCapacityKWh === kwh
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {kwh === 0 ? 'Sans batterie' : `${kwh} kWh`}
                  </button>
                ))}
              </div>

              <input
                id="range-battery"
                type="range"
                min="0"
                max="15"
                step="2.5"
                value={config.batteryCapacityKWh}
                onChange={(e) => onChange({ batteryCapacityKWh: parseFloat(e.target.value) })}
                className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-neutral-600 mt-1">
                <span>0 kWh (Autoconsommation directe)</span>
                <span>5 kWh (Maison standard)</span>
                <span>10 kWh</span>
                <span>15 kWh (Forte autonomie)</span>
              </div>
            </div>

            {/* 8. Optimiseurs intelligents (Routeur ECS & VE) */}
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <label className="text-sm font-semibold text-neutral-900 block">
                Dispositifs d'optimisation intelligente de surplus
              </label>

              {/* Routeur Solaire Chauffe-eau */}
              <div className="border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 text-blue-700 rounded-lg mt-0.5">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      Routeur Solaire Chauffe-eau
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded-full">
                        Fortement recommandé
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Dérive l'excédent de production en temps réel vers la résistance du chauffe-eau (+15% à 20% d'autoconsommation pour ~{formatMoney(effectiveCostBreakdown?.items.find((i) => i.id === 'post_opt_router')?.totalHT || 410, currentCountry.currency)}).
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={config.hasSolarRouter}
                    onChange={(e) => onChange({ hasSolarRouter: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              {/* Smart EV Charging */}
              <div className="border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between hover:bg-neutral-50/70 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg mt-0.5">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900">
                      Pilotage solaire Borne VE
                    </div>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Recharge le véhicule électrique automatiquement dès qu'un excédent solaire est détecté en journée.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={config.hasSmartEVCharging}
                    onChange={(e) => onChange({ hasSmartEVCharging: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VOLET COÛTS DE L'INSTALLATION & DEVIS DÉTAILLÉ */}
        {activeTab === 'costs' && (
          <InstallationCostBreakdown
            config={config}
            costBreakdown={effectiveCostBreakdown}
            countryProfile={currentCountry}
            onChange={onChange}
          />
        )}

        {/* TAB 3: CONSOMMATION DU FOYER */}
        {activeTab === 'consumption' && (
          <div className="space-y-6">
            {/* Mode direct vs détaillé */}
            <div className="flex items-center justify-between bg-neutral-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => onChange({ useAdvancedConsumption: false })}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  !config.useAdvancedConsumption
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Saisie directe (Facture annuelle)
              </button>
              <button
                type="button"
                onClick={() => onChange({ useAdvancedConsumption: true })}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  config.useAdvancedConsumption
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Estimation détaillée par équipements
              </button>
            </div>

            {!config.useAdvancedConsumption ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-neutral-900 block mb-1">
                    Montant de votre facture annuelle d'électricité ({currentCountry.currency.symbol} TTC / an)
                  </label>
                  <div className="relative">
                    <input
                      id="input-annual-bill"
                      type="number"
                      step="50"
                      min="300"
                      max="15000"
                      value={config.annualBillEuros}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        onChange({
                           annualBillEuros: val,
                          annualConsumptionKWh: Math.round(val / (config.gridElectricityCostPerKWh || currentCountry.defaultElectricityPricePerKWh)),
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-neutral-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400 text-xs font-bold">
                      {currentCountry.currency.symbol} / an
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Correspond à environ{' '}
                    <strong className="text-neutral-800">
                      {Math.round(config.annualBillEuros / (config.gridElectricityCostPerKWh || currentCountry.defaultElectricityPricePerKWh)).toLocaleString('fr-FR')} kWh / an
                    </strong>{' '}
                    au tarif moyen de {config.gridElectricityCostPerKWh || currentCountry.defaultElectricityPricePerKWh} {currentCountry.currency.symbol}/kWh.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-neutral-900 block mb-1">
                    Ou consommation annuelle directe (kWh / an)
                  </label>
                  <div className="relative">
                    <input
                      id="input-annual-kwh"
                      type="number"
                      step="100"
                      min="1000"
                      max="40000"
                      value={config.annualConsumptionKWh}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        onChange({
                          annualConsumptionKWh: val,
                          annualBillEuros: Math.round(val * config.gridElectricityCostPerKWh),
                        });
                      }}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-300 text-neutral-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400 text-xs font-bold">
                      kWh / an
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Surface habitable (m²)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="500"
                      value={config.homeSurfaceM2}
                      onChange={(e) => onChange({ homeSurfaceM2: parseInt(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Nombre d'occupants
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={config.occupantsCount}
                      onChange={(e) => onChange({ occupantsCount: parseInt(e.target.value) || 3 })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Équipements cochables */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-neutral-800 block">
                    Équipements énergivores du logement :
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Pompe à chaleur */}
                    <label className="border rounded-lg p-2.5 flex items-center gap-2 cursor-pointer hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={config.equipment.hasHeatPump}
                        onChange={(e) =>
                          onChange({
                            equipment: {
                              ...config.equipment,
                              hasHeatPump: e.target.checked,
                              hasElectricHeating: e.target.checked ? false : config.equipment.hasElectricHeating,
                            },
                          })
                        }
                        className="rounded text-amber-600"
                      />
                      <span>Pompe à chaleur (PAC)</span>
                    </label>

                    {/* Convecteurs électriques */}
                    <label className="border rounded-lg p-2.5 flex items-center gap-2 cursor-pointer hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={config.equipment.hasElectricHeating}
                        onChange={(e) =>
                          onChange({
                            equipment: {
                              ...config.equipment,
                              hasElectricHeating: e.target.checked,
                              hasHeatPump: e.target.checked ? false : config.equipment.hasHeatPump,
                            },
                          })
                        }
                        className="rounded text-amber-600"
                      />
                      <span>Chauffage électrique (radiateurs)</span>
                    </label>

                    {/* Ballon d'eau chaude électrique */}
                    <label className="border rounded-lg p-2.5 flex items-center gap-2 cursor-pointer hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={config.equipment.hasElectricWaterHeater}
                        onChange={(e) =>
                          onChange({
                            equipment: {
                              ...config.equipment,
                              hasElectricWaterHeater: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-amber-600"
                      />
                      <span>Chauffe-eau électrique / Cumulus</span>
                    </label>

                    {/* Climatisation */}
                    <label className="border rounded-lg p-2.5 flex items-center gap-2 cursor-pointer hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={config.equipment.hasAirConditioning}
                        onChange={(e) =>
                          onChange({
                            equipment: {
                              ...config.equipment,
                              hasAirConditioning: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-amber-600"
                      />
                      <span>Climatisation</span>
                    </label>

                    {/* Piscine */}
                    <label className="border rounded-lg p-2.5 flex items-center gap-2 cursor-pointer hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={config.equipment.hasPool}
                        onChange={(e) =>
                          onChange({
                            equipment: {
                              ...config.equipment,
                              hasPool: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-amber-600"
                      />
                      <span>Piscine (pompe de filtration)</span>
                    </label>

                    {/* Véhicule électrique */}
                    <label className="border rounded-lg p-2.5 flex items-center gap-2 cursor-pointer hover:bg-neutral-50">
                      <input
                        type="checkbox"
                        checked={config.equipment.hasElectricVehicle}
                        onChange={(e) =>
                          onChange({
                            equipment: {
                              ...config.equipment,
                              hasElectricVehicle: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-amber-600"
                      />
                      <span>Véhicule électrique (VE)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Profil de présence */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="text-sm font-semibold text-neutral-900 block mb-2">
                Profil de présence en journée
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  {
                    id: 'present_day' as PresenceProfile,
                    title: 'Présent en journée',
                    desc: 'Télétravail / Retraité (autoconsommation naturelle élevée)',
                  },
                  {
                    id: 'hybrid' as PresenceProfile,
                    title: 'Mixte / Hybride',
                    desc: '2 à 3 jours de présence en semaine',
                  },
                  {
                    id: 'absent_day' as PresenceProfile,
                    title: 'Absent la journée',
                    desc: 'Activité en soirée et week-end',
                  },
                ].map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => onChange({ presenceProfile: prof.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      config.presenceProfile === prof.id
                        ? 'border-amber-500 bg-amber-50 text-neutral-900 font-semibold ring-1 ring-amber-500'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="font-bold text-xs mb-0.5">{prof.title}</div>
                    <div className="text-[11px] text-neutral-500 leading-tight">{prof.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TOITURE & PAYS */}
        {activeTab === 'house' && (
          <div className="space-y-6">
            {/* Fiche Réglementaire & Spécificités du Pays */}
            <div className="p-4 bg-gradient-to-br from-amber-50 to-neutral-50 rounded-xl border border-amber-200 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{currentCountry.flag}</span>
                  <div>
                    <h4 className="font-bold text-neutral-900">
                      Cadre Réglementaire Solaire en {currentCountry.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500">
                      Devise : {currentCountry.currency.name} ({currentCountry.currency.symbol}) • TVA : {currentCountry.vatRuleLabel}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">
                  {currentCountry.code}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                <div className="bg-white/80 p-2.5 rounded-lg border border-neutral-200/70">
                  <span className="text-neutral-500 block">Organisme de sécurité / Visa :</span>
                  <strong className="text-neutral-800 font-semibold">{currentCountry.complianceCertificateName}</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-neutral-200/70">
                  <span className="text-neutral-500 block">Gestionnaire de Réseau :</span>
                  <strong className="text-neutral-800 font-semibold">{currentCountry.gridOperatorName}</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-neutral-200/70">
                  <span className="text-neutral-500 block">Certification Installateur Requise :</span>
                  <strong className="text-neutral-800 font-semibold">{currentCountry.installerCertificationName}</strong>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-neutral-200/70">
                  <span className="text-neutral-500 block">Régime de Valorisation du Surplus :</span>
                  <strong className="text-neutral-800 font-semibold">{currentCountry.contractTypeName}</strong>
                </div>
              </div>
            </div>

            {/* Position Google Maps active */}
            {config.location && (
              <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    Position fixée par Google Maps
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    {config.location.city || 'Position active'}
                  </span>
                </div>
                <div className="text-neutral-700 font-medium">
                  {config.location.formattedAddress}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-amber-200/60 text-[11px]">
                  <span className="text-neutral-500 font-mono">
                    GPS : {config.location.lat.toFixed(4)}°N, {config.location.lng.toFixed(4)}°E
                  </span>
                  <span className="text-amber-800 font-bold">
                    Gisement : {config.location.annualIrradiationKWhPerKWp} kWh/kWc/an
                  </span>
                </div>
              </div>
            )}

            {/* Région */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Région géographique (Ensoleillement PVGIS) :
                </label>
                <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-0.5 rounded-md border border-neutral-200">
                  {currentCountry.flag} {currentCountry.name}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.values(getRegionsForCountry(currentCountry.code)).map((reg) => {
                  const isSelected = config.region === reg.id;
                  return (
                    <button
                      key={reg.id}
                      type="button"
                      onClick={() => onChange({ region: reg.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-neutral-900 ring-1 ring-amber-500'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-bold">{reg.name}</span>
                        <span className="text-amber-700 font-semibold">
                          {reg.annualIrradiationKWhPerKWp} kWh/kWc
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {reg.departmentExamples}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Orientation */}
            <div className="pt-4 border-t border-neutral-100">
              <label className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5 mb-2">
                <Compass className="w-4 h-4 text-amber-600" />
                Orientation de la toiture
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {(Object.keys(ORIENTATION_FACTORS) as Orientation[]).map((ori) => {
                  const data = ORIENTATION_FACTORS[ori];
                  const isSelected = config.orientation === ori;
                  return (
                    <button
                      key={ori}
                      type="button"
                      onClick={() => onChange({ orientation: ori })}
                      className={`py-2 px-3 rounded-lg border text-center transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 font-bold text-amber-800 ring-1 ring-amber-500'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div>{data.label}</div>
                      <div className="text-[10px] text-neutral-400">
                        Rendement : {Math.round(data.factor * 100)}%
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inclinaison & Ombrage */}
            <div className="pt-4 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1">
                  Inclinaison du toit
                </label>
                <select
                  value={config.tilt}
                  onChange={(e) => onChange({ tilt: parseInt(e.target.value) as InclinasonType })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium"
                >
                  <option value={0}>0° - Toit plat / Sol</option>
                  <option value={15}>15° - Pente douce</option>
                  <option value={30}>30° à 35° - Pente standard (Optimal)</option>
                  <option value={45}>45° - Pente forte</option>
                  <option value={60}>60° - Façade / Très forte</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-neutral-800">
                    Niveau d'ombrage
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('shading')}
                    className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 underline"
                  >
                    Simulateur 3D d'obstacles →
                  </button>
                </div>
                {config.useAdvancedShading ? (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">
                        Simulation d'obstacles active
                      </span>
                      <span className="text-[11px] text-amber-700">
                        {shadingDetails.obstaclesCount} obstacle(s) • Perte : -{shadingDetails.lossPercentage}%
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('shading')}
                      className="px-2 py-1 bg-amber-600 text-white rounded text-[11px] font-bold hover:bg-amber-700"
                    >
                      Modifier
                    </button>
                  </div>
                ) : (
                  <select
                    value={config.shading}
                    onChange={(e) => onChange({ shading: e.target.value as ShadingLevel })}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-medium"
                  >
                    <option value="none">Aucun ombrage (Dégagé 100%)</option>
                    <option value="low">Faible (Arbre éloigné 95%)</option>
                    <option value="moderate">Modéré (Masque matin/soir 86%)</option>
                    <option value="high">Élevé (Obstacle proche 72%)</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ANALYSE D'OMBRAGE & OBSTACLES */}
        {activeTab === 'shading' && (
          <div className="space-y-4">
            <ShadingAnalysisCard
              config={config}
              shadingDetails={shadingDetails}
              onChange={onChange}
            />
          </div>
        )}

        {/* TAB 6: RÉGLEMENTATION, TARIFS & FACTURE ÉLECTRIQUE */}
        {activeTab === 'tariffs' && (
          <div className="space-y-6">
            {/* Module IA : Scan et importation de facture d'électricité avant installation */}
            <BillScannerCard
              config={config}
              countryProfile={currentCountry}
              onChange={onChange}
            />

            {/* Bannière Cadre Réglementaire & Réinitialisation Globale */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-white p-4 rounded-xl border border-amber-200/80 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-white rounded-lg border border-amber-300 shadow-2xs text-lg">
                    {currentCountry.flag}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                      Cadre Réglementaire Officiel — {currentCountry.name}
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.2 rounded-full">
                        {currentCountry.currency.name} ({currentCountry.currency.symbol})
                      </span>
                    </h4>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      Gestionnaire : <strong>{currentCountry.gridOperatorName}</strong> • Contrat type : <strong>{currentCountry.contractTypeName}</strong> • Organisme : <strong>{currentCountry.subsidyAuthority}</strong>
                    </p>
                  </div>
                </div>

                {/* Bouton de réinitialisation générale aux barèmes du pays */}
                <button
                  type="button"
                  onClick={handleResetToCountryDefaults}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:border-amber-400 hover:bg-amber-50/50 rounded-lg text-xs font-semibold text-neutral-700 transition-all shadow-2xs cursor-pointer"
                  title="Effacer toutes les modifications personnalisées et restaurer les barèmes officiels par défaut du pays sélectionné"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                  Rétablir tous les barèmes par défaut ({currentCountry.name})
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-200/60 text-[10px] text-neutral-600">
                <div>
                  <span className="text-neutral-500 block">Agrément installateur :</span>
                  <span className="font-semibold text-neutral-800">{currentCountry.installerCertificationName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Attestation conformité :</span>
                  <span className="font-semibold text-neutral-800">{currentCountry.complianceCertificateName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Raccordement réseau :</span>
                  <span className="font-semibold text-neutral-800">{currentCountry.gridOperatorName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Dispositif d'aide :</span>
                  <span className="font-semibold text-neutral-800">{currentCountry.subsidyName}</span>
                </div>
              </div>
            </div>

            {/* 1. Prix d'achat de l'électricité réseau (TTC / kWh) */}
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-600" />
                    Prix d'achat de l'électricité réseau ({currentCountry.currency.symbol}/kWh TTC)
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    Tarif du kWh consommé depuis le réseau électrique (utilisé pour calculer vos économies annuelles).
                  </span>
                </div>

                {config.isCustomGridTariff ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Modifié selon votre facture
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    Valeur par défaut ({currentCountry.defaultElectricityPricePerKWh} {currentCountry.currency.symbol}/kWh)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px]">
                  <input
                    type="number"
                    step="0.001"
                    min="0.01"
                    max="2.00"
                    value={config.gridElectricityCostPerKWh || ''}
                    placeholder={`Ex: ${currentCountry.defaultElectricityPricePerKWh}`}
                    onChange={(e) =>
                      onChange({
                        gridElectricityCostPerKWh: parseFloat(e.target.value) || 0,
                        isCustomGridTariff: true,
                      })
                    }
                    className="w-full pl-3 pr-14 py-2 border border-neutral-300 rounded-lg text-base font-bold text-neutral-900 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-500">
                    {currentCountry.currency.symbol}/kWh
                  </span>
                </div>

                {/* Bouton Effacer / Vider le champ */}
                <button
                  type="button"
                  onClick={() => onChange({ gridElectricityCostPerKWh: 0, isCustomGridTariff: true })}
                  className="px-2.5 py-2 border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-semibold transition-colors"
                  title="Effacer la valeur pour saisir le tarif exact de votre facture"
                >
                  Effacer
                </button>

                {/* Bouton Rétablir la valeur par défaut du pays */}
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      gridElectricityCostPerKWh: currentCountry.defaultElectricityPricePerKWh,
                      isCustomGridTariff: false,
                    })
                  }
                  className="px-3 py-2 border border-amber-200 bg-amber-50 hover:bg-amber-100/70 text-amber-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  title="Rétablir la valeur par défaut officielle"
                >
                  <RotateCcw className="w-3 h-3 text-amber-600" />
                  Rétablir défaut ({currentCountry.defaultElectricityPricePerKWh} {currentCountry.currency.symbol})
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                <span>
                  Référence moyenne {currentCountry.name} : ~<strong>{currentCountry.defaultElectricityPricePerKWh} {currentCountry.currency.symbol}/kWh TTC</strong>
                </span>
                <span className="text-amber-700 font-medium">
                  Chaque kWh autoconsommé vous évite d'acheter {config.gridElectricityCostPerKWh} {currentCountry.currency.symbol}
                </span>
              </div>
            </div>

            {/* 2. Tarif de rachat / injection du surplus */}
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-600" />
                    Tarif d'achat du surplus ({currentCountry.contractTypeName}) ({currentCountry.currency.symbol}/kWh)
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    Rémunération du surplus solaire non consommé injecté sur le réseau de distribution.
                  </span>
                </div>

                {config.isCustomFeedInTariff ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Contrat personnalisé
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    Tarif réglementé ({currentCountry.defaultFeedInTariffPerKWh} {currentCountry.currency.symbol}/kWh)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[180px]">
                  <input
                    type="number"
                    step="0.001"
                    min="0.00"
                    max="1.00"
                    value={config.feedInTariffPerKWh ?? ''}
                    placeholder={`Ex: ${currentCountry.defaultFeedInTariffPerKWh}`}
                    onChange={(e) =>
                      onChange({
                        feedInTariffPerKWh: parseFloat(e.target.value) || 0,
                        isCustomFeedInTariff: true,
                      })
                    }
                    className="w-full pl-3 pr-14 py-2 border border-neutral-300 rounded-lg text-base font-bold text-neutral-900 focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-500">
                    {currentCountry.currency.symbol}/kWh
                  </span>
                </div>

                {/* Bouton Sans rachat / 0 */}
                <button
                  type="button"
                  onClick={() => onChange({ feedInTariffPerKWh: 0, isCustomFeedInTariff: true })}
                  className="px-2.5 py-2 border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  0.00 (Sans rachat)
                </button>

                {/* Bouton Rétablir la valeur officielle */}
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      feedInTariffPerKWh: currentCountry.defaultFeedInTariffPerKWh,
                      isCustomFeedInTariff: false,
                    })
                  }
                  className="px-3 py-2 border border-amber-200 bg-amber-50 hover:bg-amber-100/70 text-amber-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3 text-amber-600" />
                  Rétablir tarif officiel ({currentCountry.defaultFeedInTariffPerKWh} {currentCountry.currency.symbol})
                </button>
              </div>

              <div className="text-[11px] text-neutral-500">
                Organisme acheteur : <strong>{currentCountry.gridOperatorName} / {currentCountry.subsidyAuthority}</strong> ({currentCountry.contractTypeName}).
              </div>
            </div>

            {/* 3. Taux de TVA Légal sur l'Installation */}
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-amber-600" />
                    Taux de TVA applicable sur le matériel et la pose
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    TVA légale en vigueur selon la puissance installée et la législation fiscale de {currentCountry.name}.
                  </span>
                </div>

                {config.customVatRate !== null && config.customVatRate !== undefined ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    TVA personnalisée ({(config.customVatRate * 100).toFixed(1)}%)
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                    Taux légal officiel ({Math.round(currentCountry.defaultVatRate * 100)}%)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: `Légal (${Math.round(currentCountry.defaultVatRate * 100)}%)`, val: null },
                  { label: '0% (Exonération / Pro / Allemagne)', val: 0.0 },
                  { label: '5.5% (Rénovation éco)', val: 0.055 },
                  { label: '7.0% (Tunisie)', val: 0.07 },
                  { label: '8.1% (Suisse)', val: 0.081 },
                  { label: '10.0% (France ≤3kWc)', val: 0.10 },
                  { label: '20.0% (France >3kWc / Standard)', val: 0.20 },
                ].map((item) => {
                  const isSelected =
                    item.val === null
                      ? config.customVatRate === null || config.customVatRate === undefined
                      : Math.abs((config.customVatRate ?? -1) - item.val) < 0.001;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onChange({ customVatRate: item.val })}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-amber-800 ring-1 ring-amber-500 font-bold'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Aides et Subventions d'État */}
            <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Subventions d'État et Primes à l'investissement
                  </label>
                  <span className="text-[11px] text-neutral-500">
                    Aide officielle nationale ({currentCountry.subsidyName}) ou montant personnalisé selon votre devis / facture / mairie.
                  </span>
                </div>

                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Total aide déduite : {formatMoney(effectiveCostBreakdown.totalSubsidies, currentCountry.currency)}
                </span>
              </div>

              {/* Mode de subventions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ customSubsidiesMode: 'auto', customSubsidiesAmount: null })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    !config.customSubsidiesMode || config.customSubsidiesMode === 'auto'
                      ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500 shadow-2xs'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-900">
                    1. Barème officiel automatique
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {currentCountry.subsidyName} ({currentCountry.subsidyAuthority})
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      customSubsidiesMode: 'custom',
                      customSubsidiesAmount: config.customSubsidiesAmount ?? 1000,
                    })
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.customSubsidiesMode === 'custom'
                      ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500 shadow-2xs'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-900">
                    2. Montant personnalisé
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Selon facture, devis ou prime locale
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onChange({ customSubsidiesMode: 'none', customSubsidiesAmount: 0 })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.customSubsidiesMode === 'none'
                      ? 'border-amber-500 bg-amber-50/60 ring-1 ring-amber-500 shadow-2xs'
                      : 'border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-900">
                    3. Sans subvention
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Aucune aide d'État (0 {currentCountry.currency.symbol})
                  </div>
                </button>
              </div>

              {/* Saisie montant personnalisé si sélectionné */}
              {config.customSubsidiesMode === 'custom' && (
                <div className="pt-2 flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="50"
                      min="0"
                      max="50000"
                      value={config.customSubsidiesAmount ?? ''}
                      placeholder="Ex: 1200"
                      onChange={(e) =>
                        onChange({
                          customSubsidiesAmount: parseFloat(e.target.value) || 0,
                          customSubsidiesMode: 'custom',
                        })
                      }
                      className="w-full pl-3 pr-14 py-2 border border-neutral-300 rounded-lg text-sm font-bold text-neutral-900 focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-500">
                      {currentCountry.currency.symbol}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ customSubsidiesMode: 'auto', customSubsidiesAmount: null })}
                    className="px-3 py-2 border border-neutral-300 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Rétablir barème officiel
                  </button>
                </div>
              )}
            </div>

            {/* 5. Inflation prévisionnelle & Coût Devis Global */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 block">
                    Inflation prévisionnelle du kWh (%/an)
                  </label>
                  <button
                    type="button"
                    onClick={() => onChange({ annualInflationRate: 3.0 })}
                    className="text-[10px] text-amber-700 hover:underline"
                  >
                    Défaut (3.0%)
                  </button>
                </div>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="12"
                  value={config.annualInflationRate}
                  onChange={(e) => onChange({ annualInflationRate: parseFloat(e.target.value) || 3.0 })}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[11px] text-neutral-500 block">
                  Évolution annuelle moyenne du coût de l'électricité sur 25 ans.
                </span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-neutral-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 block">
                    Devis global clé en main ({currentCountry.currency.symbol} TTC)
                  </label>
                  {config.customInstallationCost && (
                    <button
                      type="button"
                      onClick={() => onChange({ customInstallationCost: null })}
                      className="text-[10px] text-amber-700 hover:underline"
                    >
                      Effacer / Calcul auto
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="100"
                  placeholder="Calcul automatique détaillé"
                  value={config.customInstallationCost || ''}
                  onChange={(e) =>
                    onChange({
                      customInstallationCost: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm text-neutral-900 focus:ring-2 focus:ring-amber-500"
                />
                <span className="text-[11px] text-neutral-500 block">
                  Laissez vide pour utiliser le calcul certifié de l'onglet <strong>Volet Coûts</strong>.
                </span>
              </div>
            </div>

            {/* Guide pédagogique dépliable : "Comment retrouver ces données sur ma facture ?" */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50/60">
              <button
                type="button"
                onClick={() => setShowBillHelp(!showBillHelp)}
                className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-neutral-800">
                    Comment lire et retrouver ces données sur votre facture d'électricité ?
                  </span>
                </div>
                {showBillHelp ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>

              {showBillHelp && (
                <div className="p-4 pt-1 border-t border-neutral-200 text-xs text-neutral-600 space-y-2.5 bg-white">
                  <p>
                    <strong>1. Prix du kWh TTC consommé :</strong> Regardez la section <em>« Détail de votre consommation »</em> ou <em>« Fourniture d’électricité »</em>. Il s'agit du coût unitaire par kWh (en centimes ou dinars/francs) incluant la TVA et les taxes sur la consommation (ex: TICFE, CTA en France, taxes STEG en Tunisie). Ne prenez pas en compte l'abonnement mensuel fixe du compteur car il reste identique avec ou sans solaire.
                  </p>
                  <p>
                    <strong>2. Heures Pleines / Heures Creuses (HP/HC) :</strong> Si vous avez une tarification double, retenez en priorité le <strong>tarif des Heures Pleines</strong>, car c'est pendant la journée (soleil au zénith) que vos panneaux solaires fonctionnent et vous évitent d'acheter l'électricité la plus chère.
                  </p>
                  <p>
                    <strong>3. Revente du surplus :</strong> Si vous disposez d'un contrat d'obligation d'achat (ex: EDF OA, Net-Metering STEG), vous pouvez saisir le prix du kWh revendu stipulé dans vos conditions particulières.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
