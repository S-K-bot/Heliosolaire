import React, { useState } from 'react';
import {
  X,
  Printer,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Zap,
  PiggyBank,
  Shield,
  Download,
  Receipt,
  Globe,
  Clock,
  Coins,
  ShieldCheck,
  Share2,
  HelpCircle,
  Scale,
  Sun,
  PieChart,
  ArrowRight,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SolarConfig, SimulationResults } from '../types';
import { REGIONS, ORIENTATION_FACTORS, TILT_FACTORS } from '../data/regions';
import { getCountryProfile, formatMoney } from '../data/countries';
import { ShareReportModal } from './ShareReportModal';
import { CalculationExplainerModal } from './CalculationExplainerModal';

interface DetailedReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SolarConfig;
  results: SimulationResults;
}

export const DetailedReportModal: React.FC<DetailedReportModalProps> = ({
  isOpen,
  onClose,
  config,
  results,
}) => {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const countryProfile =
    results.countryProfile ||
    getCountryProfile(config.countryCode || config.location?.countryCode);

  const regionInfo = REGIONS[config.region];
  const costBreakdown = results.costBreakdown;
  const currency = countryProfile.currency;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between print:hidden">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-neutral-900">
                Rapport d'Étude & Synthèse de Rentabilité Solaire
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsShareOpen(true)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
                title="Partager via WhatsApp, Email, Telegram, SMS ou réseaux"
              >
                <Share2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                Partager
              </button>
              <button
                type="button"
                onClick={() => setIsExplainerOpen(true)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs"
                title="Comprendre en détail le calcul du taux et du productible"
              >
                <HelpCircle className="w-4 h-4 mr-1.5 text-amber-600" />
                Comprendre le calcul
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors shadow-2xs"
              >
                <Printer className="w-4 h-4 mr-1.5 text-neutral-500" />
                Imprimer / PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-neutral-800 text-xs sm:text-sm">
          {/* Printable Header */}
          <div className="border-b border-neutral-200 pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{countryProfile.flag}</span>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900">
                    Dossier Technique & Financier Solaire
                  </h1>
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  Simulation pour <strong className="text-neutral-800">{countryProfile.name}</strong> • Réalisée le{' '}
                  {new Date().toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  • Hélios Solaire Domestique
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                  Autoconsommation {results.selfConsumptionRate}%
                </span>
                <div className="text-xs text-neutral-500 mt-1 font-medium">
                  {results.panelsCount} Panneaux • {config.systemPowerKWp} kWc
                </div>
              </div>
            </div>
          </div>

          {/* 1. Résumé Exécutif Localisé */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div>
              <span className="text-neutral-500 text-xs block">Investissement Net :</span>
              <strong className="text-base font-bold text-neutral-900">
                {formatMoney(results.netInvestmentCost, currency)}
              </strong>
              <span className="text-[11px] text-emerald-700 block">
                ({formatMoney(results.selfConsumptionGrant, currency)} aides déduites)
              </span>
            </div>
            <div>
              <span className="text-neutral-500 text-xs block">Gain Annuel (An 1) :</span>
              <strong className="text-base font-bold text-emerald-700">
                +{formatMoney(results.totalAnnualBenefitYear1, currency)} / an
              </strong>
              <span className="text-[11px] text-neutral-500 block">
                Économie + {countryProfile.contractTypeName}
              </span>
            </div>
            <div>
              <span className="text-neutral-500 text-xs block">Temps d'Amortissement :</span>
              <strong className="text-base font-bold text-blue-700">
                {results.paybackPeriodYears} ans
              </strong>
              <span className="text-[11px] text-neutral-500 block">
                Rendement net {results.roiPercentage}%/an
              </span>
            </div>
            <div>
              <span className="text-neutral-500 text-xs block">Bénéfice Net 25 Ans :</span>
              <strong className="text-base font-bold text-emerald-700">
                +{formatMoney(results.cumulativeSavings25Years, currency)}
              </strong>
              <span className="text-[11px] text-neutral-500 block">
                Net après maintenance
              </span>
            </div>
          </div>

          {/* 2. Spécifications Techniques du Système */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              1. Spécifications Techniques du Système
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="border border-neutral-200 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Puissance totale :</span>
                  <span className="font-semibold text-neutral-900">{config.systemPowerKWp} kWc</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Nombre de modules :</span>
                  <span className="font-semibold text-neutral-900">
                    {results.panelsCount} modules ({config.panelWattage}W monocristallin N-Type)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Surface toiture requise :</span>
                  <span className="font-semibold text-neutral-900">{results.requiredRoofAreaM2} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Production estimée :</span>
                  <span className="font-semibold text-amber-800">
                    {results.annualProductionKWh.toLocaleString('fr-FR')} kWh / an
                  </span>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Localisation Google Maps :</span>
                  <span className="font-semibold text-neutral-900 truncate max-w-[200px]" title={config.location?.formattedAddress}>
                    {config.location?.city || config.location?.formattedAddress || regionInfo?.name}
                  </span>
                </div>
                {config.location && (
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-500">Coordonnées GPS & Pays :</span>
                    <span className="font-mono text-neutral-700">
                      {config.location.lat.toFixed(4)}°N, {config.location.lng.toFixed(4)}°E ({countryProfile.code})
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-500">Gisement solaire local :</span>
                  <span className="font-semibold text-amber-800">
                    {config.location?.annualIrradiationKWhPerKWp || regionInfo?.annualIrradiationKWhPerKWp} kWh/kWc/an
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Technologie onduleur :</span>
                  <span className="font-semibold text-neutral-900">
                    {config.inverterType === 'string_central'
                      ? 'Onduleur unique pour tous les panneaux (Chaîne / Fronius / SMA)'
                      : config.inverterType === 'micro'
                      ? 'Micro-onduleurs individuels (Enphase / Hoymiles)'
                      : 'Onduleur central avec optimiseurs de puissance (SolarEdge)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Batterie de stockage :</span>
                  <span className="font-semibold text-neutral-900">
                    {config.batteryCapacityKWh > 0 ? `${config.batteryCapacityKWh} kWh Lithium LFP` : 'Sans batterie (Autoconsommation directe)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Routeur Solaire ECS :</span>
                  <span className="font-semibold text-neutral-900">
                    {config.hasSolarRouter ? 'Inclus (Asservissement eau chaude)' : 'Non inclus'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Région & Orientation :</span>
                  <span className="font-semibold text-neutral-900">
                    {regionInfo?.name} • {ORIENTATION_FACTORS[config.orientation]?.label} ({config.tilt}°)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ombrage & Masques solaires :</span>
                  <span className={`font-semibold ${results.shadingDetails.lossPercentage > 0 ? 'text-amber-800' : 'text-emerald-700'}`}>
                    {results.shadingDetails.lossPercentage > 0
                      ? `-${results.shadingDetails.lossPercentage}% (-${results.shadingDetails.lostAnnualKWh} kWh/an)`
                      : 'Aucun (Ensoleillement direct optimal)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Explicitation des Modules de Calcul : Autoconsommation vs Autoproduction & Productible */}
          <div className="border border-neutral-200 rounded-xl p-5 bg-gradient-to-br from-neutral-50 to-amber-50/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-600" />
                  3. Méthodologie & Formules de Calcul : Autoconsommation, Autoproduction & Productible
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Transparence totale sur la modélisation mathématique et physique de votre projet
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsExplainerOpen(true)}
                className="inline-flex items-center text-xs font-semibold text-amber-800 bg-white border border-amber-300 hover:bg-amber-50 px-3 py-1.5 rounded-lg shadow-2xs transition-colors self-start sm:self-auto print:hidden"
              >
                <HelpCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                Détail pas à pas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Taux d'autoconsommation */}
              <div className="bg-white p-4 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 text-xs uppercase tracking-wider">
                    Taux d'Autoconsommation
                  </span>
                  <span className="text-lg font-extrabold text-amber-600">
                    {results.selfConsumptionRate}%
                  </span>
                </div>
                <div className="font-mono text-[11px] bg-neutral-50 p-2 rounded border border-neutral-200 text-neutral-700">
                  (Solaire consommé ÷ Production totale) × 100
                </div>
                <div className="text-xs text-neutral-600 space-y-1">
                  <div className="flex justify-between">
                    <span>• Solaire consommé directement :</span>
                    <strong className="text-neutral-900">{(results.selfConsumedKWh ?? 0).toLocaleString()} kWh/an</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>• Production solaire totale :</span>
                    <strong className="text-neutral-900">{(results.annualProductionKWh ?? 0).toLocaleString()} kWh/an</strong>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1 border-t border-neutral-100 text-[11px]">
                    <span>• Vendu / injecté sur réseau :</span>
                    <span>{(results.exportedKWh ?? 0).toLocaleString()} kWh/an ({(100 - results.selfConsumptionRate).toFixed(0)}%)</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Mesure la part de l'électricité générée par vos panneaux qui reste dans votre maison.
                </p>
              </div>

              {/* Taux d'autoproduction */}
              <div className="bg-white p-4 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 text-xs uppercase tracking-wider">
                    Taux d'Autoproduction (Couverture)
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600">
                    {results.selfSufficiencyRate}%
                  </span>
                </div>
                <div className="font-mono text-[11px] bg-neutral-50 p-2 rounded border border-neutral-200 text-neutral-700">
                  (Solaire consommé ÷ Besoins du foyer) × 100
                </div>
                <div className="text-xs text-neutral-600 space-y-1">
                  <div className="flex justify-between">
                    <span>• Solaire consommé directement :</span>
                    <strong className="text-neutral-900">{(results.selfConsumedKWh ?? 0).toLocaleString()} kWh/an</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>• Consommation totale du logement :</span>
                    <strong className="text-neutral-900">{(results.annualConsumptionKWh ?? 0).toLocaleString()} kWh/an</strong>
                  </div>
                  <div className="flex justify-between text-blue-700 font-semibold pt-1 border-t border-neutral-100 text-[11px]">
                    <span>• Acheté au fournisseur réseau :</span>
                    <span>{(results.gridImportKWh ?? 0).toLocaleString()} kWh/an ({(100 - results.selfSufficiencyRate).toFixed(0)}%)</span>
                  </div>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Mesure votre degré d'indépendance énergétique face aux hausses tarifaires du réseau.
                </p>
              </div>
            </div>

            {/* Productible et équation physique */}
            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-2 text-xs">
              <div className="font-bold text-neutral-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600" />
                  Calcul du Productible Solaire ({(results.annualProductionKWh ?? 0).toLocaleString()} kWh/an)
                </span>
                <span className="font-mono text-amber-700 font-semibold">
                  {config.systemPowerKWp > 0 ? Math.round((results.annualProductionKWh ?? 0) / config.systemPowerKWp) : 0} kWh/kWc/an
                </span>
              </div>
              <div className="bg-neutral-900 text-amber-400 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                Production (kWh) = {config.systemPowerKWp} kWc × {config.location?.annualIrradiationKWhPerKWp || 1250} kWh/m² × {(ORIENTATION_FACTORS[config.orientation]?.factor ?? 1).toFixed(2)} (orient.) × {(TILT_FACTORS[config.tilt]?.factor ?? 1).toFixed(2)} (inclin.) × 0.86 (PR)
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Le Performance Ratio (PR ~86%) modélise les pertes physiques incompressibles : effet Joule du câblage, rendement onduleur (97.5%), encrassement/poussières (2%) et pertes thermiques estivales (-0.35%/°C).
              </p>
            </div>
          </div>

          {/* 4. Volet Coûts & Devis Détaillé de l'Installation */}
          {costBreakdown && (
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-600" />
                4. Volet Coûts & Devis Détaillé Clé en Main ({countryProfile.name})
              </h3>

              <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Poste de Dépense</th>
                      <th className="py-2.5 px-3">Quantité / Base</th>
                      <th className="py-2.5 px-3 text-right">Prix Unitaire HT</th>
                      <th className="py-2.5 px-3 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {costBreakdown.items.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/60">
                        <td className="py-2 px-3">
                          <strong className="text-neutral-900 block">{item.label}</strong>
                          <span className="text-[11px] text-neutral-500">{item.description}</span>
                        </td>
                        <td className="py-2 px-3 text-neutral-600 font-medium">{item.quantity}</td>
                        <td className="py-2 px-3 text-neutral-600 text-right">
                          {formatMoney(item.unitPrice, currency)}
                        </td>
                        <td className="py-2 px-3 font-semibold text-neutral-900 text-right">
                          {formatMoney(item.totalPrice, currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-neutral-50/80 border-t border-neutral-200 font-semibold text-neutral-800">
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right text-neutral-600">
                        Sous-total HT :
                      </td>
                      <td className="py-2 px-3 text-right text-neutral-900">
                        {formatMoney(costBreakdown.totalEquipmentAndLaborHT, currency)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-1.5 px-3 text-right text-neutral-600">
                        TVA applicable en {countryProfile.name} ({Math.round(costBreakdown.vatRate * 100)}% - {countryProfile.vatRuleLabel}) :
                      </td>
                      <td className="py-1.5 px-3 text-right text-neutral-900">
                        {formatMoney(costBreakdown.vatAmount, currency)}
                      </td>
                    </tr>
                    <tr className="border-t border-neutral-200 bg-amber-50/40">
                      <td colSpan={3} className="py-2 px-3 text-right font-bold text-neutral-900">
                        Total Devis Clé en Main TTC :
                      </td>
                      <td className="py-2 px-3 text-right font-extrabold text-neutral-900 text-sm">
                        {formatMoney(costBreakdown.totalTTC, currency)}
                      </td>
                    </tr>
                    {costBreakdown.totalSubsidies > 0 && (
                      <tr className="bg-emerald-50/60 text-emerald-800 font-bold">
                        <td colSpan={3} className="py-2 px-3 text-right">
                          Aides & Subventions {countryProfile.subsidyAuthority} déductibles :
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-700">
                          -{formatMoney(costBreakdown.totalSubsidies, currency)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-neutral-900 text-white font-bold">
                      <td colSpan={3} className="py-2.5 px-3 text-right">
                        Reste à Charge Réel Net :
                      </td>
                      <td className="py-2.5 px-3 text-right font-extrabold text-sm text-amber-400">
                        {formatMoney(costBreakdown.netCostAfterSubsidies, currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* 5. Démarches administratives et réglementaires spécifiques au pays */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-600" />
              5. Démarches Réglementaires & Administratives Spécifiques ({countryProfile.name})
            </h3>
            <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 text-xs">
              {countryProfile.administrativeSteps.map((step, idx) => (
                <div key={idx} className="p-3 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <strong className="text-neutral-900">{step.stepName}</strong>
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-neutral-500 font-medium">Délai : {step.typicalDelay}</span>
                        {step.costNote && (
                          <span className="px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 text-[10px]">
                            {step.costNote}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-neutral-600 mt-1">{step.description}</p>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-blue-700 font-semibold">
                      <span>Organisme compétent :</span>
                      <span>{step.authority}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Tableau d'amortissement synthétique (5 ans par 5 ans) */}
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-2 flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              6. Tableau d'Amortissement Prévisionnel (sur 25 ans)
            </h3>
            <div className="overflow-x-auto border border-neutral-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                  <tr>
                    <th className="py-2.5 px-3">Année</th>
                    <th className="py-2.5 px-3">Tarif Réseau</th>
                    <th className="py-2.5 px-3">Sans Solaire</th>
                    <th className="py-2.5 px-3">Économie Solaire</th>
                    <th className="py-2.5 px-3">Vente Surplus</th>
                    <th className="py-2.5 px-3">Trésorerie Nette Cumulée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {[1, 3, 5, 8, 10, 15, 20, 25].map((yr) => {
                    const row = results.projections25Years.find((p) => p.year === yr);
                    if (!row) return null;
                    const isPositive = row.netCashFlowCumulative >= 0;
                    return (
                      <tr
                        key={yr}
                        className={
                          yr === Math.ceil(results.paybackPeriodYears)
                            ? 'bg-emerald-50/80 font-bold'
                            : ''
                        }
                      >
                        <td className="py-2 px-3 font-semibold text-neutral-900">An {yr}</td>
                        <td className="py-2 px-3 text-neutral-600">
                          {row.electricityPricePerKWh} {currency.symbol}/kWh
                        </td>
                        <td className="py-2 px-3 text-neutral-700">
                          {formatMoney(row.withoutSolarCost, currency)}
                        </td>
                        <td className="py-2 px-3 text-emerald-700 font-semibold">
                          +{formatMoney(row.solarSavingsAnnual - row.feedInIncome, currency)}
                        </td>
                        <td className="py-2 px-3 text-neutral-600">
                          +{formatMoney(row.feedInIncome, currency)}
                        </td>
                        <td
                          className={`py-2 px-3 font-bold ${
                            isPositive ? 'text-emerald-700' : 'text-neutral-500'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {formatMoney(row.netCashFlowCumulative, currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Encart Partager avec applications */}
          <div className="bg-emerald-50/80 border border-emerald-300/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3 text-emerald-950">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <strong className="block text-xs sm:text-sm font-bold text-emerald-900">
                  Transmettre cette étude de rentabilité
                </strong>
                <p className="text-[11px] text-emerald-800">
                  Envoyez la synthèse chiffrée par WhatsApp, Email, Telegram, SMS ou sur les réseaux à votre entourage ou installateur.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              Partager l'étude
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-2 print:hidden">
          <span className="text-xs text-neutral-500">
            Cadre réglementaire officiel appliqué : {countryProfile.name} • Visa {countryProfile.complianceCertificateName} • Réseau {countryProfile.gridOperatorName}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>

    {/* Modale de partage multi-applications */}
    <ShareReportModal
      isOpen={isShareOpen}
      onClose={() => setIsShareOpen(false)}
      config={config}
      results={results}
    />

    {/* Modale d'explication pédagogique des modules de calcul */}
    <CalculationExplainerModal
      isOpen={isExplainerOpen}
      onClose={() => setIsExplainerOpen(false)}
      config={config}
      results={results}
    />
  </>
  );
};
