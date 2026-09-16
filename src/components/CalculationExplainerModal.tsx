import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Zap,
  Sun,
  PieChart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Battery,
  Flame,
  Info,
  Sliders,
  Scale,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SolarConfig, SimulationResults } from '../types';
import { formatMoney } from '../data/countries';
import { ORIENTATION_FACTORS, TILT_FACTORS, SHADING_FACTORS } from '../data/regions';

interface CalculationExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SolarConfig;
  results: SimulationResults;
}

export const CalculationExplainerModal: React.FC<CalculationExplainerModalProps> = ({
  isOpen,
  onClose,
  config,
  results,
}) => {
  const [activeTab, setActiveTab] = useState<'autoconsommation' | 'production'>('autoconsommation');

  if (!isOpen) return null;

  const currency = results.countryProfile?.currency || { symbol: '€', code: 'EUR', name: 'Euro' };
  const annualProd = results.annualProductionKWh ?? 0;
  const annualCons = results.annualConsumptionKWh ?? 0;
  const selfConsumed = results.selfConsumedKWh ?? 0;
  const gridExport = results.exportedKWh ?? 0;
  const gridImport = results.gridImportKWh ?? 0;
  const selfConsRate = results.selfConsumptionRate ?? 0;
  const selfSuffRate = results.selfSufficiencyRate ?? 0;
  const specificYield = config.systemPowerKWp > 0 ? Math.round(annualProd / config.systemPowerKWp) : 0;

  // Calculs détaillés pour l'explication du productible
  const orientationFactor = ORIENTATION_FACTORS[config.orientation]?.factor ?? 1.0;
  const tiltFactor = TILT_FACTORS[config.tilt]?.factor ?? 1.0;
  const rawIrradiation = config.location?.annualIrradiationKWhPerKWp || 1250;
  const shadingLossPct = results.shadingDetails.lossPercentage;

  let techName = 'N-Type TOPCon';
  let techGain = '+2.5%';
  if (config.panelTechnology === 'hjt') {
    techName = 'Hétérojonction HJT';
    techGain = '+4.8%';
  } else if (config.panelTechnology === 'mono_perc') {
    techName = 'Monocristallin PERC standard';
    techGain = 'Base (0%)';
  } else if (config.panelTechnology === 'poly') {
    techName = 'Polycristallin';
    techGain = '-4.0%';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* En-tête */}
        <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Comprendre les Modules de Calcul
              </h2>
              <p className="text-xs text-neutral-500">
                Méthodologie physique, formules mathématiques et équilibrage énergétique
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-200/60 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Onglets de navigation */}
        <div className="border-b border-neutral-200 bg-white px-6 flex space-x-6 text-xs sm:text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('autoconsommation')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'autoconsommation'
                ? 'border-amber-500 text-amber-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Taux d'Autoconsommation vs Autoproduction</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('production')}
            className={`py-3 border-b-2 flex items-center space-x-2 transition-colors ${
              activeTab === 'production'
                ? 'border-amber-500 text-amber-800'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Taux de Production & Productible (kWh)</span>
          </button>
        </div>

        {/* Contenu déroulant */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs sm:text-sm text-neutral-700">
          {activeTab === 'autoconsommation' ? (
            <div className="space-y-6">
              {/* Différence fondamentale */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                      La distinction clé : Taux d'Autoconsommation vs Taux d'Autoproduction
                    </h3>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                      Ces deux indicateurs sont souvent confondus. L'un mesure <strong>l'efficacité d'utilisation de vos panneaux</strong>, tandis que l'autre mesure <strong>votre degré d'indépendance face au réseau électrique</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparatif 2 colonnes avec formules et chiffres réels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Bloc 1: Taux d'autoconsommation */}
                <div className="bg-white rounded-xl border-2 border-amber-300 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                      Indicateur Panneaux
                    </span>
                    <span className="text-2xl font-extrabold text-amber-600">
                      {selfConsRate}%
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">
                      1. Taux d'Autoconsommation
                    </h4>
                    <p className="text-xs text-neutral-600 mt-1">
                      « Quelle proportion de l'électricité produite par mes panneaux est consommée sur place dans mon logement ? »
                    </p>
                  </div>

                  {/* Formule */}
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 font-mono text-[11px] text-neutral-800">
                    <div className="text-neutral-500 mb-1 font-sans text-[10px] uppercase font-semibold">
                      Formule mathématique :
                    </div>
                    <div>Taux = (Énergie solaire autoconsommée ÷ Production solaire totale) × 100</div>
                  </div>

                  {/* Application numérique avec les données en direct */}
                  <div className="bg-amber-50/50 rounded-lg p-3 border border-amber-200/80 text-xs space-y-1.5">
                    <div className="font-semibold text-amber-900 flex items-center justify-between">
                      <span>Calcul sur votre simulation :</span>
                      <span className="text-amber-700 font-bold">{selfConsRate}%</span>
                    </div>
                    <div className="text-neutral-600 flex justify-between">
                      <span>• Énergie solaire consommée en direct :</span>
                      <strong className="text-neutral-900">{selfConsumed.toLocaleString()} kWh/an</strong>
                    </div>
                    <div className="text-neutral-600 flex justify-between">
                      <span>• Production solaire totale de l'année :</span>
                      <strong className="text-neutral-900">{annualProd.toLocaleString()} kWh/an</strong>
                    </div>
                    <div className="text-neutral-600 flex justify-between pt-1 border-t border-amber-200/60 text-[11px]">
                      <span>• Surplus injecté / vendu au réseau :</span>
                      <span className="text-emerald-700 font-semibold">{gridExport.toLocaleString()} kWh ({(100 - selfConsRate).toFixed(0)}%)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-500 italic">
                    💡 Plus ce taux est élevé, moins vous renvoyez d'électricité sur le réseau à bas tarif et plus vous rentabilisez l'investissement.
                  </p>
                </div>

                {/* Bloc 2: Taux d'autoproduction / couverture */}
                <div className="bg-white rounded-xl border-2 border-emerald-300 p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                      Indicateur Foyer
                    </span>
                    <span className="text-2xl font-extrabold text-emerald-600">
                      {selfSuffRate}%
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-neutral-900 text-sm">
                      2. Taux d'Autoproduction (Couverture)
                    </h4>
                    <p className="text-xs text-neutral-600 mt-1">
                      « Quelle proportion de la consommation globale de mon foyer est couverte par le solaire ? »
                    </p>
                  </div>

                  {/* Formule */}
                  <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200 font-mono text-[11px] text-neutral-800">
                    <div className="text-neutral-500 mb-1 font-sans text-[10px] uppercase font-semibold">
                      Formule mathématique :
                    </div>
                    <div>Taux = (Énergie solaire autoconsommée ÷ Consommation annuelle du foyer) × 100</div>
                  </div>

                  {/* Application numérique avec les données en direct */}
                  <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-200/80 text-xs space-y-1.5">
                    <div className="font-semibold text-emerald-900 flex items-center justify-between">
                      <span>Calcul sur votre simulation :</span>
                      <span className="text-emerald-700 font-bold">{selfSuffRate}%</span>
                    </div>
                    <div className="text-neutral-600 flex justify-between">
                      <span>• Énergie solaire consommée en direct :</span>
                      <strong className="text-neutral-900">{selfConsumed.toLocaleString()} kWh/an</strong>
                    </div>
                    <div className="text-neutral-600 flex justify-between">
                      <span>• Consommation totale du logement :</span>
                      <strong className="text-neutral-900">{annualCons.toLocaleString()} kWh/an</strong>
                    </div>
                    <div className="text-neutral-600 flex justify-between pt-1 border-t border-emerald-200/60 text-[11px]">
                      <span>• Électricité résiduelle achetée au réseau :</span>
                      <span className="text-blue-700 font-semibold">{gridImport.toLocaleString()} kWh ({(100 - selfSuffRate).toFixed(0)}%)</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-500 italic">
                    💡 Représente votre indépendance énergétique réelle : vous effacez {selfSuffRate}% de votre facture d'électricité.
                  </p>
                </div>
              </div>

              {/* Les 4 leviers physiques d'augmentation du taux */}
              <div className="border border-neutral-200 rounded-xl p-5 bg-neutral-50 space-y-4">
                <h4 className="font-bold text-neutral-900 text-xs sm:text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  Comment le simulateur module-t-il votre taux d'autoconsommation ?
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-600" />
                      1. Ratio Dimensionnement (Production / Consommation)
                    </div>
                    <p className="text-neutral-600 text-[11px]">
                      Plus l'installation est puissante par rapport aux besoins diurnes, plus l'autoconsommation naturelle diminue en l'absence de stockage (surplus vers le réseau).
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-orange-600" />
                      2. Routeur Solaire Chauffe-eau (+15% à +22%)
                    </div>
                    <p className="text-neutral-600 text-[11px]">
                      {config.hasSolarRouter
                        ? '✅ Activé : dérivation dynamique de l’excédent vers votre cumulus pour stocker l’énergie sous forme d’eau chaude gratuite.'
                        : '❌ Inactif : l’activation d’un routeur solaire permettrait d’augmenter immédiatement votre taux de 15 à 22% sans batterie chimique.'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Battery className="w-3.5 h-3.5 text-emerald-600" />
                      3. Batterie Lithium LFP (+25% à +40%)
                    </div>
                    <p className="text-neutral-600 text-[11px]">
                      {config.batteryCapacityKWh > 0
                        ? `✅ Activé (${config.batteryCapacityKWh} kWh) : stockage des surplus de midi pour couvrir la pointe de 19h-23h et la nuit.`
                        : '❌ Inactif : sans batterie, toute l’énergie non consommée instantanément est injectée sur le réseau.'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      4. Profil de Présence & Véhicule Électrique
                    </div>
                    <p className="text-neutral-600 text-[11px]">
                      {config.presenceProfile === 'present_day'
                        ? 'Télétravail / présence en journée : bonus de +8% d’autoconsommation en faisant tourner machine à laver et électroménager à midi.'
                        : 'Absence en journée : les consommations sont décalées le soir, nécessitant programmation ou domotique.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Formule générale du productible */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0 mt-0.5">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                      Le Calcul du Productible Solaire Annuel (kWh)
                    </h3>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                      Conforme aux modèles satellitaires européens <strong>PVGIS / NREL</strong>, le calcul prend en compte l'irradiation géographique exacte, l'orientation, l'inclinaison de toiture, la technologie des cellules et les pertes physiques réelles du système.
                    </p>
                  </div>
                </div>
              </div>

              {/* Équation globale */}
              <div className="bg-neutral-900 text-white rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-2">
                <div className="text-amber-400 font-sans font-bold text-[11px] uppercase tracking-wider">
                  Équation fondamentale du productible PV :
                </div>
                <div className="text-sm font-semibold tracking-wide">
                  Production (kWh/an) = P_crête × Irradiation × F_orientation × F_inclinaison × F_techno × F_bifacial × (1 - Pertes_ombrage) × PR
                </div>
                <div className="text-[11px] text-neutral-400 font-sans pt-1 border-t border-neutral-700">
                  Où <strong>PR</strong> est le Performance Ratio global (~86%) intégrant les pertes thermiques, d'onduleur, de câblage et salissures.
                </div>
              </div>

              {/* Décomposition paramètre par paramètre pour l'installation de l'utilisateur */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <div className="bg-neutral-100 px-4 py-2.5 text-xs font-bold text-neutral-800 border-b border-neutral-200 flex items-center justify-between">
                  <span>Facteurs appliqués à votre installation ({config.systemPowerKWp} kWc)</span>
                  <span className="text-amber-700 font-extrabold">{annualProd.toLocaleString()} kWh/an au total</span>
                </div>

                <div className="divide-y divide-neutral-100 text-xs">
                  <div className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <div className="font-semibold text-neutral-900">1. Puissance crête (P_crête)</div>
                      <div className="text-neutral-500 text-[11px]">
                        {results.panelsCount} panneaux solaires de {config.panelWattage || 430} Wc
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-neutral-900">
                      {config.systemPowerKWp} kWc
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <div className="font-semibold text-neutral-900">2. Gisement solaire géographique brut</div>
                      <div className="text-neutral-500 text-[11px]">
                        Irradiation annuelle relevée par satellite PVGIS à {config.location?.city || 'votre position'}
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-amber-700">
                      {rawIrradiation} kWh/m²/an
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <div className="font-semibold text-neutral-900">3. Facteur d'Orientation</div>
                      <div className="text-neutral-500 text-[11px]">
                        Orientation {config.orientation} (optimum Sud = 1.00)
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-neutral-900">
                      × {(orientationFactor).toFixed(2)}
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <div className="font-semibold text-neutral-900">4. Facteur d'Inclinaison de toiture</div>
                      <div className="text-neutral-500 text-[11px]">
                        Inclinaison {config.tilt}° (optimum européen à 30-35° = 1.00)
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-neutral-900">
                      × {(tiltFactor).toFixed(2)}
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <div className="font-semibold text-neutral-900">5. Technologie de Cellules & Dégradation</div>
                      <div className="text-neutral-500 text-[11px]">
                        Technologie : {techName} (bonus rendement & tolérance thermique)
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-emerald-700">
                      {techGain}
                    </div>
                  </div>

                  {config.isBifacial && (
                    <div className="p-3 sm:p-3.5 flex items-center justify-between bg-emerald-50/40">
                      <div>
                        <div className="font-semibold text-emerald-900">6. Bonus Panneaux Bi-faciaux</div>
                        <div className="text-neutral-500 text-[11px]">
                          Capture de la lumière diffuse et de l'albédo réfléchi par l'arrière
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-emerald-700">
                        +{config.bifacialGainPercent || 10}%
                      </div>
                    </div>
                  )}

                  <div className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-neutral-50">
                    <div>
                      <div className="font-semibold text-neutral-900">7. Masques solaires & Ombrages</div>
                      <div className="text-neutral-500 text-[11px]">
                        {shadingLossPct > 0
                          ? `Arbres, lucarnes ou bâtiments atténués par votre onduleur`
                          : `Aucun obstacle significatif identifié`}
                      </div>
                    </div>
                    <div className={`text-right font-mono font-bold ${shadingLossPct > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {shadingLossPct > 0 ? `-${shadingLossPct}%` : '1.00 (0% perte)'}
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-neutral-50 bg-neutral-50/80">
                    <div>
                      <div className="font-semibold text-neutral-900">8. Performance Ratio global (PR)</div>
                      <div className="text-neutral-500 text-[11px]">
                        Pertes thermiques estivales (-0.35%/°C), conversion onduleur (97.5%), câbles DC/AC (1.5%), poussières (2%)
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-neutral-900">
                      × 0.86 (86%)
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-amber-500 text-white font-bold flex items-center justify-between text-xs sm:text-sm">
                  <span>Résultat final (Productible spécifique : {specificYield} kWh/kWc/an)</span>
                  <span className="text-base sm:text-lg">{annualProd.toLocaleString()} kWh/an</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de page modal */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            Modèles algorithmiques conformes aux normes IEC 61724 et PVGIS
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
