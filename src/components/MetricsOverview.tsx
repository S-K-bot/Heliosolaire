import React from 'react';
import {
  TrendingUp,
  Zap,
  PiggyBank,
  Calendar,
  Leaf,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Trees,
  Car,
  Globe,
  Info,
  Wind,
  HelpCircle,
} from 'lucide-react';
import { SimulationResults } from '../types';
import { formatMoney } from '../data/countries';

interface CountryMixDetail {
  primarySources: string;
  marginalDisplaced: string;
  category: 'ultra_low' | 'low' | 'moderate' | 'carbon_intensive';
  categoryLabel: string;
  mixDescription: string;
}

const COUNTRY_MIX_DETAILS: Record<string, CountryMixDetail> = {
  FR: {
    primarySources: 'Nucléaire (67%), Hydraulique (12%), Éolien/Solaire (15%), Gaz (5%)',
    marginalDisplaced: 'Centrales thermiques d’appoint au gaz et importations de pointe.',
    category: 'ultra_low',
    categoryLabel: 'Réseau ultra bas-carbone',
    mixDescription: 'En France, le réseau électrique est déjà l’un des plus décarbonés au monde. Votre production solaire efface en priorité les pointes diurnes fossiles (gaz) et sécurise l’approvisionnement européen.',
  },
  BE: {
    primarySources: 'Nucléaire (45%), Renouvelables (28%), Gaz naturel (25%)',
    marginalDisplaced: 'Centrales thermiques au gaz naturel et cycles combinés.',
    category: 'low',
    categoryLabel: 'Réseau intermédiaire',
    mixDescription: 'En Belgique, chaque kWh solaire d’autoconsommation se substitue directement à l’électricité produite par des centrales thermiques au gaz.',
  },
  CH: {
    primarySources: 'Hydraulique (58%), Nucléaire (32%), Solaire/Éolien (8%)',
    marginalDisplaced: 'Permet d’économiser l’eau des barrages pour l’hiver et évite les importations fossiles.',
    category: 'ultra_low',
    categoryLabel: 'Réseau très fortement décarboné',
    mixDescription: 'En Suisse, le mix électrique national est très vertueux. Votre installation soulage les retenues de barrages alpins et réduit la dépendance aux importations énergétiques hivernales.',
  },
  ES: {
    primarySources: 'Renouvelables (50%), Cycles combinés gaz (25%), Nucléaire (20%)',
    marginalDisplaced: 'Turbines à gaz à cycle combiné à fort coût marginal.',
    category: 'low',
    categoryLabel: 'Réseau en forte transition verte',
    mixDescription: 'En Espagne, l’électricité solaire résidentielle remplace immédiatement la production de centrales thermiques au gaz fossile lors des pics de consommation et de climatisation.',
  },
  DE: {
    primarySources: 'Éolien/Solaire (52%), Lignite & Houille (26%), Gaz naturel (14%)',
    marginalDisplaced: 'Centrales thermiques au charbon/lignite et centrales à gaz.',
    category: 'carbon_intensive',
    categoryLabel: 'Réseau à forte intensité carbone',
    mixDescription: 'En Allemagne, malgré une forte part d’énergies renouvelables, le charbon et le gaz restent très présents. Chaque kWh solaire produit évite une quantité majeure de dioxyde de carbone.',
  },
  IT: {
    primarySources: 'Gaz naturel (48%), Renouvelables (38%), Importations (14%)',
    marginalDisplaced: 'Centrales thermiques au gaz naturel.',
    category: 'moderate',
    categoryLabel: 'Réseau dominé par le gaz',
    mixDescription: 'En Italie, le gaz naturel représente près de la moitié du mix électrique. Le solaire permet de réduire massivement l’importation d’hydrocarbures et les rejets polluants associés.',
  },
  GB: {
    primarySources: 'Éolien/Solaire (36%), Gaz naturel (34%), Nucléaire (15%)',
    marginalDisplaced: 'Turbines à combustion au gaz naturel en journée.',
    category: 'moderate',
    categoryLabel: 'Réseau en décarbonation active',
    mixDescription: 'Au Royaume-Uni, la sortie du charbon est actée. L’énergie photovoltaïque réduit directement la sollicitation des centrales à gaz (CCGT) en heures pleines.',
  },
  CA: {
    primarySources: 'Hydroélectricité (61%), Nucléaire (15%), Gaz & Charbon résiduel (15%)',
    marginalDisplaced: 'Centrales au gaz (Ontario/Alberta) et valorisation d’exportations hydroélectriques.',
    category: 'ultra_low',
    categoryLabel: 'Réseau hydroélectrique propre',
    mixDescription: 'Au Canada, l’hydroélectricité domine largement au Québec, tandis que le solaire compense efficacement les centrales thermiques fossiles dans d’autres provinces comme l’Alberta.',
  },
  MA: {
    primarySources: 'Charbon (65%), Gaz naturel & Fioul (15%), Solaire/Éolien (20%)',
    marginalDisplaced: 'Centrales au charbon et turbines à fioul lourd.',
    category: 'carbon_intensive',
    categoryLabel: 'Réseau à très fort impact fossile',
    mixDescription: 'Au Maroc, l’électricité du réseau repose encore majoritairement sur le charbon importé. Le solaire y offre un bénéfice climatique exceptionnel en effaçant du kWh très carboné.',
  },
  TN: {
    primarySources: 'Gaz naturel (90%), Solaire & Éolien (8%), Hydraulique (2%)',
    marginalDisplaced: 'Centrales électriques thermiques au gaz naturel.',
    category: 'carbon_intensive',
    categoryLabel: 'Réseau thermique au gaz',
    mixDescription: 'En Tunisie, 90% de l’électricité provient de centrales à gaz. Le solaire résidentiel apporte un allègement direct sur la facture énergétique nationale et l’empreinte CO₂.',
  },
};

interface MetricsOverviewProps {
  results: SimulationResults;
  systemPowerKWp: number;
  onOpenExplainer?: () => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  results,
  systemPowerKWp,
  onOpenExplainer,
}) => {
  const {
    annualBillSavingsEuros = 0,
    annualExportIncomeEuros = 0,
    totalAnnualBenefitYear1 = 0,
    paybackPeriodYears = 0,
    cumulativeSavings25Years = 0,
    selfConsumptionRate = 0,
    selfSufficiencyRate = 0,
    netInvestmentCost = 0,
    selfConsumptionGrant = 0,
    annualProductionKWh = 0,
    annualConsumptionKWh = 0,
    panelsCount = 0,
    requiredRoofAreaM2 = 0,
    co2SavedKgPerYear = 0,
    countryProfile,
  } = results || {};

  const currency = countryProfile?.currency;
  const countryCode = countryProfile?.code || 'FR';
  const gridIntensity = countryProfile?.gridCarbonIntensityGramsPerKWh || 55;
  const mixDetail = COUNTRY_MIX_DETAILS[countryCode] || COUNTRY_MIX_DETAILS.FR;

  // Calculs environnementaux détaillés
  const co2SavedAnnualKg = co2SavedKgPerYear ?? 0;
  const co2SavedAnnualTonnes = (co2SavedAnnualKg / 1000).toFixed(2);
  // Cumul sur 25 ans avec vieillissement moyen de 0,5%/an (~94% moyen de production)
  const co2Saved25YearsTonnes = ((co2SavedAnnualKg * 25 * 0.94) / 1000).toFixed(1);
  // Équivalents concrets :
  // - Absorption moyenne d'un arbre adulte : ~25 kg CO2 / an (ADEME / ONF)
  const arbresEquivalents = Math.max(1, Math.round(co2SavedAnnualKg / 25));
  // - Voiture thermique moyenne européenne : ~120 g CO2 / km (0.12 kg/km)
  const kmVoitureThermique = Math.round(co2SavedAnnualKg / 0.12);
  // - Vol long-courrier aller-retour : ~1 000 kg CO2 / passager
  const volsLongCourrier = (co2SavedAnnualKg / 1000).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Économie Annuelle */}
        <div
          id="metric-card-savings"
          className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full pointer-events-none -z-0 opacity-60" />
          <div className="relative z-10">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                Gain Annuel (An 1)
              </span>
              <div className="p-2 bg-emerald-100/70 text-emerald-700 rounded-lg">
                <PiggyBank className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                {formatMoney(totalAnnualBenefitYear1, currency)}
              </span>
              <span className="text-xs font-medium text-emerald-700">/ an</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-col text-xs text-neutral-600 gap-1">
              <div className="flex justify-between">
                <span>Économies sur facture :</span>
                <strong className="text-neutral-900 font-semibold">{formatMoney(annualBillSavingsEuros, currency)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Surplus ({countryProfile?.contractTypeName || 'Rachat'}) :</span>
                <strong className="text-neutral-900 font-semibold">{formatMoney(annualExportIncomeEuros, currency)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Autoconsommation & Autonomie */}
        <div
          id="metric-card-autoconsommation"
          className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full pointer-events-none -z-0 opacity-60" />
          <div className="relative z-10">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Autoconsommation
              </span>
              <div className="flex items-center gap-1.5">
                {onOpenExplainer && (
                  <button
                    type="button"
                    onClick={onOpenExplainer}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    title="Comprendre le calcul mathématique et physique du taux d'autoconsommation"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Calcul</span>
                  </button>
                )}
                <div className="p-2 bg-amber-100/70 text-amber-700 rounded-lg">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                {selfConsumptionRate}%
              </span>
              <span className="text-xs font-medium text-amber-700">d'énergie utilisée</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-col text-xs text-neutral-600 gap-1">
              <div className="flex justify-between">
                <span>Taux d'autoproduction :</span>
                <strong className="text-neutral-900 font-semibold">{selfSufficiencyRate}% des besoins</strong>
              </div>
              <div className="w-full bg-neutral-100 rounded-full h-1.5 mt-1 overflow-hidden">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, selfConsumptionRate)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Temps de retour sur investissement (ROI) */}
        <div
          id="metric-card-payback"
          className="bg-white rounded-xl border border-blue-200/80 p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full pointer-events-none -z-0 opacity-60" />
          <div className="relative z-10">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
                Amortissement (ROI)
              </span>
              <div className="p-2 bg-blue-100/70 text-blue-700 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                {paybackPeriodYears}
              </span>
              <span className="text-xs font-medium text-blue-700">ans</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-col text-xs text-neutral-600 gap-1">
              <div className="flex justify-between">
                <span>Coût net après prime :</span>
                <strong className="text-neutral-900 font-semibold">
                  {formatMoney(netInvestmentCost, currency)}
                </strong>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>{countryProfile?.subsidyAuthority || 'Aides'} :</span>
                <strong className="font-semibold">-{formatMoney(selfConsumptionGrant, currency)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Bénéfice net cumulé sur 25 ans */}
        <div
          id="metric-card-cumulative"
          className="bg-white rounded-xl border border-indigo-200/80 p-5 shadow-xs relative overflow-hidden transition-all hover:shadow-md"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full pointer-events-none -z-0 opacity-60" />
          <div className="relative z-10">
            <div className="flex items-center justify-between text-neutral-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-800">
                Gain Net sur 25 Ans
              </span>
              <div className="p-2 bg-indigo-100/70 text-indigo-700 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-neutral-900 tracking-tight text-emerald-700">
                +{formatMoney(cumulativeSavings25Years, currency)}
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-neutral-100 flex flex-col text-xs text-neutral-600 gap-1">
              <div className="flex justify-between">
                <span>Rendement annuel équiv. :</span>
                <strong className="text-emerald-700 font-semibold">{results.roiPercentage}% / an</strong>
              </div>
              <div className="flex justify-between items-center text-neutral-500">
                <span>Matériel garanti 25-30 ans</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Quick Specs Strip */}
      <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3 sm:p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white rounded-lg border border-neutral-200 text-amber-600">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-neutral-500">Installation</div>
            <div className="font-semibold text-neutral-900">
              {panelsCount} panneaux ({systemPowerKWp} kWc)
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white rounded-lg border border-neutral-200 text-neutral-600">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div>
            <div className="text-neutral-500">Surface toiture</div>
            <div className="font-semibold text-neutral-900">
              {requiredRoofAreaM2} m² nécessaires
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white rounded-lg border border-neutral-200 text-amber-600">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-neutral-500 flex items-center gap-1">
              <span>Production annuelle</span>
              {onOpenExplainer && (
                <button
                  type="button"
                  onClick={onOpenExplainer}
                  className="text-amber-700 hover:text-amber-900 transition-colors"
                  title="Voir la décomposition du calcul du productible (PVGIS, orientation, pertes...)"
                >
                  <HelpCircle className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="font-semibold text-neutral-900">
              {annualProductionKWh.toLocaleString('fr-FR')} kWh / an
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white rounded-lg border border-neutral-200 text-emerald-600">
            <Leaf className="w-4 h-4" />
          </div>
          <div>
            <div className="text-neutral-500">Empreinte carbone</div>
            <div className="font-semibold text-emerald-700">
              -{co2SavedKgPerYear.toLocaleString('fr-FR')} kg CO₂ / an
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section dédiée : Économies d'émissions de CO2 évitées & Mix énergétique national */}
      <div
        id="metrics-co2-section"
        className="bg-white rounded-xl border border-emerald-200/90 p-5 shadow-xs relative overflow-hidden"
      >
        {/* Background eco-accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50/70 rounded-bl-full pointer-events-none -z-0 opacity-60" />

        <div className="relative z-10">
          {/* Header de la section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-emerald-100/80 text-emerald-800 rounded-xl mt-0.5">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">
                    Bilan Carbone & Émissions de CO₂ Évitées
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                    Écologie
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Calcul personnalisé basé sur le mix électrique officiel de {countryProfile?.name || 'France'} ({gridIntensity} g CO₂ / kWh produit).
                </p>
              </div>
            </div>

            {/* Badge Pays & Intensité Carbone Réseau */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-emerald-200 rounded-lg text-xs self-start sm:self-auto">
              <span className="text-base">{countryProfile?.flag || '🇫🇷'}</span>
              <div className="text-left">
                <div className="font-bold text-neutral-900 leading-tight">
                  {countryProfile?.name || 'France'}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold leading-tight">
                  {gridIntensity} g CO₂/kWh • {mixDetail.categoryLabel}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Cartes d'indicateurs environnementaux */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 my-4">
            {/* Carte 1 : CO2 Évité par an */}
            <div
              id="metric-card-co2-annual"
              className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-neutral-500 mb-1.5">
                  <span className="text-xs font-semibold text-emerald-900">
                    CO₂ Évité / An
                  </span>
                  <Leaf className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                  {co2SavedAnnualKg >= 1000 ? `${co2SavedAnnualTonnes} t` : `${co2SavedAnnualKg.toLocaleString('fr-FR')} kg`}
                  <span className="text-xs font-normal text-neutral-500 ml-1">CO₂/an</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-100/80 text-[11px] text-neutral-600 leading-snug">
                <strong>{annualProductionKWh.toLocaleString('fr-FR')} kWh</strong> solaires × <strong>{gridIntensity} g CO₂</strong>
              </div>
            </div>

            {/* Carte 2 : CO2 Cumulé sur 25 ans */}
            <div
              id="metric-card-co2-25y"
              className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-neutral-500 mb-1.5">
                  <span className="text-xs font-semibold text-emerald-900">
                    Bilan 25 Ans
                  </span>
                  <Globe className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                  ~{co2Saved25YearsTonnes} t
                  <span className="text-xs font-normal text-neutral-500 ml-1">de CO₂</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-100/80 text-[11px] text-neutral-600 leading-snug">
                Économie cumulée sur la garantie de performance (-0,5%/an)
              </div>
            </div>

            {/* Carte 3 : Arbres équivalents */}
            <div
              id="metric-card-co2-trees"
              className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-neutral-500 mb-1.5">
                  <span className="text-xs font-semibold text-emerald-900">
                    Arbres Équivalents
                  </span>
                  <Trees className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                  ~{arbresEquivalents}
                  <span className="text-xs font-normal text-neutral-500 ml-1">arbres</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-100/80 text-[11px] text-neutral-600 leading-snug">
                Capacité d'absorption annuelle équivalente (25 kg CO₂/arbre)
              </div>
            </div>

            {/* Carte 4 : Voiture thermique évitée */}
            <div
              id="metric-card-co2-car"
              className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-neutral-500 mb-1.5">
                  <span className="text-xs font-semibold text-emerald-900">
                    Voiture Thermique
                  </span>
                  <Car className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                  ~{kmVoitureThermique.toLocaleString('fr-FR')}
                  <span className="text-xs font-normal text-neutral-500 ml-1">km</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-emerald-100/80 text-[11px] text-neutral-600 leading-snug">
                Trajets routiers évités par an (norme moyenne 120 g CO₂/km)
              </div>
            </div>
          </div>

          {/* Volet contextuel : Mix énergétique national & Effacement marginal */}
          <div className="bg-neutral-50/90 border border-neutral-200/80 rounded-xl p-4 text-xs text-neutral-700">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-neutral-200/60">
              <div>
                <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                  <Wind className="w-3.5 h-3.5 text-emerald-600" />
                  Composition du mix électrique en {countryProfile?.name || 'France'} :
                </span>
                <span className="text-neutral-600 block mt-0.5">
                  {mixDetail.primarySources}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 bg-white border border-neutral-200 px-2.5 py-1 rounded-md shrink-0">
                Effacement : <strong className="text-neutral-800 font-medium">{mixDetail.marginalDisplaced}</strong>
              </div>
            </div>

            <p className="mt-2.5 leading-relaxed text-neutral-600">
              {mixDetail.mixDescription}
            </p>

            {/* Comparatif de l'intensité carbone par rapport aux pays voisins */}
            <div className="mt-3 pt-3 border-t border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
              <div className="flex items-center gap-1 text-neutral-500">
                <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <span>
                  Formule appliquée : <em>Production solaire annuelle ({annualProductionKWh.toLocaleString('fr-FR')} kWh) × Intensité réseau ({gridIntensity} g/kWh) ÷ 1 000 = {co2SavedAnnualKg.toLocaleString('fr-FR')} kg CO₂/an.</em>
                </span>
              </div>
              <span className="font-medium text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                Moyenne UE : ~230 g CO₂/kWh
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
