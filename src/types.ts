export type RegionId = string;

export type Orientation = 'SUD' | 'SUD_EST' | 'SUD_OUEST' | 'EST' | 'OUEST' | 'NORD';

export type InclinasonType = 0 | 15 | 30 | 45 | 60;

export type ShadingLevel = 'none' | 'low' | 'moderate' | 'high';

export type InverterType = 'micro' | 'string_opt' | 'string_central';

export type PresenceProfile = 'present_day' | 'absent_day' | 'hybrid';

export interface HeatingEquipment {
  hasHeatPump: boolean; // Pompe à chaleur
  hasElectricHeating: boolean; // Convecteurs classiques
  hasElectricWaterHeater: boolean; // Cumulus électrique ou thermodynamique
  isThermodynamicWaterHeater: boolean;
  hasElectricVehicle: boolean; // VE
  evAnnualKm: number;
  hasPool: boolean; // Piscine
  hasAirConditioning: boolean; // Climatisation
}

export interface GeoLocation {
  lat: number;
  lng: number;
  formattedAddress: string;
  city: string;
  postalCode: string;
  countryCode?: string; // ex: 'FR', 'BE', 'CH', 'ES', 'DE', 'GB', 'IT', 'CA', 'MA', 'TN'
  countryName?: string; // ex: 'France', 'Belgique', 'Suisse'
  annualIrradiationKWhPerKWp: number;
  source: 'google_maps_solar' | 'pvgis_gps' | 'regional_standard';
  buildingSolarPotential?: {
    maxArrayPanelsCount?: number;
    maxArrayAreaMeters2?: number;
    maxSunshineHoursPerYear?: number;
    carbonOffsetFactorKgPerMwh?: number;
  };
}

export interface AdministrativeStep {
  step: number;
  title: string;
  authority: string;
  delayWeeks: string;
  mandatory: boolean;
  costEstimate: string;
  description: string;
}

export interface CurrencyConfig {
  symbol: string;
  code: string;
  position: 'before' | 'after';
  name?: string;
  exchangeRateFromEUR?: number;
}

export interface CountryProfile {
  code: string;
  name: string;
  flag: string;
  currency: CurrencyConfig;
  defaultElectricityPricePerKWh: number;
  defaultFeedInTariffPerKWh: number;
  gridCarbonIntensityGramsPerKWh: number;
  defaultVatRate: number; // ex: 0.10 (10%)
  vatRuleLabel: string;
  subsidyName: string;
  subsidyAuthority: string;
  subsidyDescription: string;
  gridOperatorName: string;
  complianceCertificateName: string; // Consuel, RGIE, OIBT, Boletín CIE...
  installerCertificationName: string; // RGE QualiPV, RESCert, OIBT...
  contractTypeName: string; // EDF OA, Pronovo, SEG...
  administrativeSteps: AdministrativeStep[];
  regulatoryHighlights: string[];
}

export type CostPostCategory =
  | 'panels'
  | 'inverter'
  | 'mounting'
  | 'electrical'
  | 'labor'
  | 'administrative'
  | 'options';

export interface CostPostItem {
  id: string;
  category: CostPostCategory;
  label: string;
  description: string;
  quantity: number;
  unit: string;
  unitPriceHT: number;
  totalHT: number;
  isOptional?: boolean;
}

export interface InstallationCostBreakdown {
  items: CostPostItem[];
  totalEquipmentHT: number;
  totalLaborHT: number;
  totalAdministrativeHT: number;
  totalOptionsHT: number;
  totalHT: number;
  vatRate: number;
  vatAmount: number;
  totalTTC: number;
  subsidies: {
    id: string;
    label: string;
    amount: number;
    description: string;
    authority: string;
  }[];
  totalSubsidies: number;
  netCostAfterSubsidies: number;
  pricePerWpTTC: number;
}

export type ObstacleType = 'tree' | 'building' | 'chimney' | 'dormer' | 'hill';
export type ObstacleAzimuth = 'EST' | 'SUD_EST' | 'SUD' | 'SUD_OUEST' | 'OUEST';

export interface ShadingObstacle {
  id: string;
  name: string;
  type: ObstacleType;
  azimuth: ObstacleAzimuth; // Direction de l'obstacle
  distanceMeters: number; // Distance aux panneaux (en mètres)
  heightAboveRoofMeters: number; // Hauteur relative au-dessus du plan des panneaux (en mètres)
  active: boolean; // Activé ou non pour la simulation
}

export interface ShadingImpactDetails {
  effectiveShadingFactor: number; // ex: 0.88 = 12% de perte
  lossPercentage: number; // ex: 12%
  lostAnnualKWh: number; // ex: 620 kWh/an perdus
  lostAnnualEuros: number; // ex: 156 €/an perdus
  lost25YearsEuros: number; // ex: 4 800 € sur 25 ans
  microInverterMitigationBenefitKWh: number; // gain récupéré grâce aux micro-onduleurs
  obstaclesCount: number;
}

export type PanelTechnologyType = 'topcon_ntype' | 'hjt' | 'mono_perc' | 'poly';

export interface SolarConfig {
  // Localisation & Toiture
  region: RegionId;
  location: GeoLocation;
  roofAreaAvailable: number; // m²
  orientation: Orientation;
  tilt: InclinasonType;
  exactTiltDegrees?: number; // 0° à 90°
  exactAzimuthDegrees?: number; // -180° à +180° (0° = Sud, -90° = Est, +90° = Ouest)
  shading: ShadingLevel;
  useAdvancedShading: boolean;
  obstacles: ShadingObstacle[];

  // Consommation
  useAdvancedConsumption: boolean;
  annualConsumptionKWh: number; // kWh par an
  annualBillEuros: number; // € par an
  homeSurfaceM2: number;
  occupantsCount: number;
  presenceProfile: PresenceProfile;
  equipment: HeatingEquipment;

  // Installation & Configuration des Panneaux
  systemPowerKWp: number; // kWc (ex: 3, 4.5, 6, 9)
  panelWattage: number; // Wc unitaire par panneau (ex: 430W, 440W, 500W)
  panelsCount?: number; // Nombre de panneaux installés
  panelTechnology?: PanelTechnologyType; // 'topcon_ntype' | 'hjt' | 'mono_perc' | 'poly'
  isBifacial?: boolean; // Technologie bifaciale (bi-verre captant l'albédo arrière)
  bifacialGainPercent?: number; // Gain en % apporté par la face arrière (ex: 10%)
  inverterType: InverterType;
  batteryCapacityKWh: number; // 0, 5, 10, etc.
  hasSolarRouter: boolean; // Routeur chauffe-eau pour surplus
  hasSmartEVCharging: boolean; // Recharge VE asservie au surplus

  // Économie, Réglementation & Facture
  gridElectricityCostPerKWh: number; // Prix d'achat de l'électricité réseau
  feedInTariffPerKWh: number; // Prix de rachat du surplus
  annualInflationRate: number; // % par an (ex: 3%)
  customInstallationCost: number | null; // null pour calcul automatique

  // Facture personnalisée vs Barème pays
  isCustomGridTariff?: boolean; // Vrai si l'utilisateur a saisi sa propre facture réseau
  isCustomFeedInTariff?: boolean; // Vrai si l'utilisateur a saisi son propre tarif de rachat
  customSubsidiesMode?: 'auto' | 'custom' | 'none'; // Mode subventions : auto (officiel), personnalisé (facture/aide locale), ou aucune
  customSubsidiesAmount?: number | null; // Montant personnalisé d'aides/subventions

  // Pays & Devise
  countryCode?: string;
  currency?: string;
  currencyCode?: string;
  customVatRate?: number | null;
  customCostMode?: 'auto' | 'custom_total';
}

export interface MonthlyBreakdown {
  month: string;
  monthIndex: number;
  solarProductionKWh: number;
  consumptionKWh: number;
  selfConsumedKWh: number;
  exportedKWh: number;
  gridImportKWh: number;
}

export interface HourlyPoint {
  hour: number;
  timeLabel: string;
  productionW: number;
  consumptionW: number;
  selfConsumedW: number;
  batteryChargeW: number;
  batteryDischargeW: number;
  batterySocKWh: number;
  gridExportW: number;
  gridImportW: number;
}

export interface YearProjection {
  year: number;
  electricityPricePerKWh: number;
  withoutSolarCost: number;
  withoutSolarCumulative: number;
  withSolarBill: number;
  feedInIncome: number;
  solarSavingsAnnual: number;
  netCashFlowCumulative: number;
}

export interface SimulationResults {
  // Énergie
  annualProductionKWh: number;
  annualConsumptionKWh: number;
  selfConsumedKWh: number;
  exportedKWh: number;
  gridImportKWh: number;
  selfConsumptionRate: number; // % (énergie solaire consommée / produite)
  selfSufficiencyRate: number; // % (énergie solaire consommée / besoin total)

  // Spécifications matériel
  panelsCount: number;
  requiredRoofAreaM2: number;

  // Investissement & Aides
  grossInstallationCost: number; // € TTC
  selfConsumptionGrant: number; // Prime à l'autoconsommation €
  netInvestmentCost: number; // Coût réel après primes €

  // Économies & Rentabilité
  annualBillSavingsEuros: number; // Économie sur le réseau €
  annualExportIncomeEuros: number; // Vente surplus €
  totalAnnualBenefitYear1: number; // Économie + revente €
  paybackPeriodYears: number; // Temps de retour sur investissement
  cumulativeSavings25Years: number; // Gain net sur 25 ans
  roiPercentage: number; // Rendement annuel équivalent

  // Écologie
  co2SavedKgPerYear: number; // kg CO2/an

  // Analyse d'ombrage & Impact des obstacles
  shadingDetails: ShadingImpactDetails;

  // Volet Coûts & Profil Réglementaire du Pays
  costBreakdown: InstallationCostBreakdown;
  countryProfile: CountryProfile;

  // Données graphiques
  monthlyData: MonthlyBreakdown[];
  hourlyProfiles: {
    summer: HourlyPoint[];
    midSeason: HourlyPoint[];
    winter: HourlyPoint[];
  };
  projections25Years: YearProjection[];
}

export interface OptimizationPreset {
  id: 'roi' | 'autonomy' | 'budget';
  title: string;
  subtitle: string;
  description: string;
  config: Partial<SolarConfig>;
}

export interface BillExtractionData {
  detected: boolean;
  isFallback?: boolean;
  supplierName?: string;
  contractType?: string;
  powerSubscribedKVA?: number | null;
  tariffOption?: string;
  pricePerKWhTTC?: number | null;
  pricePerKWhHT?: number | null;
  annualConsumptionKWh?: number | null;
  periodConsumptionKWh?: number | null;
  periodMonths?: number | null;
  totalBillAmountTTC?: number | null;
  estimatedAnnualBillTTC?: number | null;
  vatRate?: number | null;
  currency?: string;
  accountCity?: string | null;
  confidenceScore: number;
  keyHighlights: string[];
  analysisNotes?: string;
}

