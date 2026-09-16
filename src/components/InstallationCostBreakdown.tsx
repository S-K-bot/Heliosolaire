import React, { useState } from 'react';
import {
  Receipt,
  FileCheck2,
  ShieldCheck,
  Percent,
  CheckCircle2,
  Info,
  Layers,
  Wrench,
  FileText,
  Sparkles,
  Zap,
  HelpCircle,
  PiggyBank,
  ArrowRight,
  TrendingDown,
  Building,
} from 'lucide-react';
import { SolarConfig, InstallationCostBreakdown as CostBreakdownType, CountryProfile } from '../types';
import { formatMoney } from '../data/countries';

interface InstallationCostBreakdownProps {
  config: SolarConfig;
  costBreakdown: CostBreakdownType;
  countryProfile: CountryProfile;
  onChange: (updated: Partial<SolarConfig>) => void;
}

export const InstallationCostBreakdown: React.FC<InstallationCostBreakdownProps> = ({
  config,
  costBreakdown,
  countryProfile,
  onChange,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [isEditingCustomQuote, setIsEditingCustomQuote] = useState<boolean>(
    config.customInstallationCost !== null && config.customInstallationCost > 0
  );
  const [customQuoteInput, setCustomQuoteInput] = useState<string>(
    config.customInstallationCost ? config.customInstallationCost.toString() : ''
  );

  const currencySymbol = countryProfile.currency.symbol;
  const currencyPos = countryProfile.currency.position;

  // Filtrage des postes
  const filteredItems = costBreakdown.items.filter((item) => {
    if (activeCategoryFilter === 'all') return true;
    if (activeCategoryFilter === 'equipment') {
      return (
        item.category === 'panels' ||
        item.category === 'inverter' ||
        item.category === 'mounting' ||
        item.category === 'electrical'
      );
    }
    if (activeCategoryFilter === 'labor') return item.category === 'labor';
    if (activeCategoryFilter === 'admin') return item.category === 'administrative';
    if (activeCategoryFilter === 'options') return item.category === 'options';
    return true;
  });

  // Pourcentages des composantes de coût
  const totalHT = Math.max(1, costBreakdown.totalHT);
  const equipmentPct = Math.round((costBreakdown.totalEquipmentHT / totalHT) * 100);
  const laborPct = Math.round((costBreakdown.totalLaborHT / totalHT) * 100);
  const adminPct = Math.round((costBreakdown.totalAdministrativeHT / totalHT) * 100);
  const optionsPct = Math.round((costBreakdown.totalOptionsHT / totalHT) * 100);

  // Sauvegarde du devis personnalisé
  const handleSaveCustomQuote = (val: string) => {
    setCustomQuoteInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      onChange({ customInstallationCost: Math.round(num) });
    } else {
      onChange({ customInstallationCost: null });
    }
  };

  const handleResetToAuto = () => {
    setIsEditingCustomQuote(false);
    setCustomQuoteInput('');
    onChange({ customInstallationCost: null });
  };

  return (
    <div className="space-y-6">
      {/* 1. CARTE DE SYNTHÈSE FINANCIÈRE PRINCIPALE */}
      <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-50 rounded-xl p-5 border border-amber-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{countryProfile.flag}</span>
              <h3 className="text-base font-bold text-neutral-900">
                Volet Coûts & Devis Estimatif Clé en Main
              </h3>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              Chiffrage transparent pour une installation de{' '}
              <span className="font-semibold text-neutral-900">{config.systemPowerKWp} kWc</span> en{' '}
              <span className="font-semibold text-neutral-900">{countryProfile.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isEditingCustomQuote) {
                  handleResetToAuto();
                } else {
                  setIsEditingCustomQuote(true);
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isEditingCustomQuote
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {isEditingCustomQuote ? '← Revenir au barème standard' : '✏️ Saisir mon propre devis'}
            </button>
          </div>
        </div>

        {/* Input devis personnalisé si actif */}
        {isEditingCustomQuote && (
          <div className="mt-4 p-3.5 bg-white rounded-lg border border-amber-300 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-neutral-800 mb-1">
                  Montant total de votre devis reçu ({currencySymbol} TTC tout compris)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1000}
                    max={100000}
                    step={100}
                    value={customQuoteInput}
                    onChange={(e) => handleSaveCustomQuote(e.target.value)}
                    placeholder="Ex: 8500"
                    className="w-full pl-3 pr-12 py-2 text-sm font-bold border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-neutral-500">
                    {currencySymbol} TTC
                  </span>
                </div>
              </div>
              <div className="text-xs text-neutral-600 sm:max-w-xs">
                La décomposition poste par poste et le calcul du reste à charge après déduction des primes
                s’ajustent instantanément à votre proposition artisan.
              </div>
            </div>
          </div>
        )}

        {/* 4 Métriques financières clés */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-white/85 p-3 rounded-lg border border-neutral-200/80">
            <span className="text-[11px] font-semibold text-neutral-500 block">Total Matériel & Pose HT</span>
            <span className="text-base font-bold text-neutral-800">
              {formatMoney(costBreakdown.totalHT, currencySymbol, currencyPos)}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5">Avant TVA et aides</span>
          </div>

          <div className="bg-white/85 p-3 rounded-lg border border-neutral-200/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-500">TVA Légale ({Math.round(costBreakdown.vatRate * 100)}%)</span>
              <span className="text-[9px] font-extrabold px-1 rounded bg-amber-100 text-amber-800">
                {countryProfile.code}
              </span>
            </div>
            <span className="text-base font-bold text-neutral-800">
              {formatMoney(costBreakdown.vatAmount, currencySymbol, currencyPos)}
            </span>
            <span className="text-[10px] text-neutral-500 block mt-0.5 truncate" title={countryProfile.vatRuleLabel}>
              {countryProfile.vatRuleLabel}
            </span>
          </div>

          <div className="bg-emerald-50/80 p-3 rounded-lg border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 block">Subventions & Primes</span>
            <span className="text-base font-bold text-emerald-700">
              {costBreakdown.totalSubsidies > 0
                ? `-${formatMoney(costBreakdown.totalSubsidies, currencySymbol, currencyPos)}`
                : '0 ' + currencySymbol}
            </span>
            <span className="text-[10px] text-emerald-700 block mt-0.5 truncate" title={countryProfile.subsidyName}>
              {countryProfile.subsidyName}
            </span>
          </div>

          <div className="bg-amber-600 text-white p-3 rounded-lg shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-100 block">Reste à Charge Net</span>
            <span className="text-lg font-black tracking-tight">
              {formatMoney(costBreakdown.netCostAfterSubsidies, currencySymbol, currencyPos)}
            </span>
            <span className="text-[10px] text-amber-200 block mt-0.5">
              Soit {formatMoney(costBreakdown.pricePerWpTTC, currencySymbol, currencyPos, 2)} / Wc TTC
            </span>
          </div>
        </div>

        {/* Répartition visuelle en barre horizontale */}
        <div className="mt-4 pt-3 border-t border-amber-200/50">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-neutral-700">Répartition estimée des dépenses :</span>
            <span className="text-neutral-500 font-medium">
              Matériel {equipmentPct}% • Pose {laborPct}% • Sécurité & Admin {adminPct + optionsPct}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-neutral-200 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${equipmentPct}%` }}
              title={`Équipements solaires : ${equipmentPct}%`}
              className="bg-amber-500 h-full transition-all"
            />
            <div
              style={{ width: `${laborPct}%` }}
              title={`Main-d’œuvre et pose : ${laborPct}%`}
              className="bg-sky-600 h-full transition-all"
            />
            <div
              style={{ width: `${adminPct}%` }}
              title={`Consuel et administratif : ${adminPct}%`}
              className="bg-emerald-500 h-full transition-all"
            />
            {optionsPct > 0 && (
              <div
                style={{ width: `${optionsPct}%` }}
                title={`Options (batterie / routeur) : ${optionsPct}%`}
                className="bg-purple-500 h-full transition-all"
              />
            )}
          </div>
        </div>
      </div>

      {/* 2. TABLEAU DÉTAILLÉ DU DEVIS POSTE PAR POSTE */}
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-neutral-50/80 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-amber-600" />
              <span>Nomenclature & Détail des Postes de Coûts</span>
            </h4>
            <p className="text-xs text-neutral-500">
              Composants aux normes certifiées conformes aux exigences de raccordement en {countryProfile.name}
            </p>
          </div>

          {/* Filtres par catégorie */}
          <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-lg border border-neutral-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-neutral-900 text-white font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tous ({costBreakdown.items.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('equipment')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeCategoryFilter === 'equipment'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Matériel
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('labor')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeCategoryFilter === 'labor'
                  ? 'bg-sky-700 text-white font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Pose & Raccordement
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryFilter('admin')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeCategoryFilter === 'admin'
                  ? 'bg-emerald-700 text-white font-bold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Conformité & Visa
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100/70 text-neutral-600 font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-4">Poste & Spécification technique</th>
                <th className="py-2.5 px-3 text-center">Quantité</th>
                <th className="py-2.5 px-3 text-right">Prix Unitaire HT</th>
                <th className="py-2.5 px-4 text-right">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/70">
              {filteredItems.map((item) => {
                let badgeBg = 'bg-neutral-100 text-neutral-700 border-neutral-200';
                if (item.category === 'panels' || item.category === 'inverter' || item.category === 'mounting') {
                  badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
                } else if (item.category === 'labor') {
                  badgeBg = 'bg-sky-50 text-sky-800 border-sky-200';
                } else if (item.category === 'administrative') {
                  badgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                } else if (item.category === 'options') {
                  badgeBg = 'bg-purple-50 text-purple-800 border-purple-200';
                }

                return (
                  <tr key={item.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900">{item.label}</span>
                            {item.isOptional && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                                Option choisie
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-500 text-[11px] mt-0.5 max-w-xl">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-neutral-700 whitespace-nowrap">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 px-3 text-right text-neutral-600 font-mono whitespace-nowrap">
                      {formatMoney(item.unitPriceHT, currencySymbol, currencyPos)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-neutral-900 font-mono whitespace-nowrap">
                      {formatMoney(item.totalHT, currencySymbol, currencyPos)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Pied de tableau récapitulatif */}
            <tfoot className="bg-neutral-50/90 font-semibold border-t-2 border-neutral-300">
              <tr>
                <td colSpan={3} className="py-2.5 px-4 text-right text-neutral-700">
                  Sous-total HT (Hors Taxes) :
                </td>
                <td className="py-2.5 px-4 text-right font-bold text-neutral-900 font-mono">
                  {formatMoney(costBreakdown.totalHT, currencySymbol, currencyPos)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="py-2 px-4 text-right text-neutral-600 font-normal">
                  TVA applicable ({Math.round(costBreakdown.vatRate * 100)}% - {countryProfile.vatRuleLabel}) :
                </td>
                <td className="py-2 px-4 text-right text-neutral-800 font-mono">
                  +{formatMoney(costBreakdown.vatAmount, currencySymbol, currencyPos)}
                </td>
              </tr>
              <tr className="bg-neutral-100/80">
                <td colSpan={3} className="py-2.5 px-4 text-right text-neutral-900 font-bold">
                  Total Devis Brut Clé en Main (TTC) :
                </td>
                <td className="py-2.5 px-4 text-right font-black text-neutral-900 font-mono text-sm">
                  {formatMoney(costBreakdown.totalTTC, currencySymbol, currencyPos)}
                </td>
              </tr>
              {costBreakdown.totalSubsidies > 0 && (
                <tr className="bg-emerald-50/70 text-emerald-800">
                  <td colSpan={3} className="py-2 px-4 text-right font-semibold">
                    Déduction des Subventions & Primes officielles ({countryProfile.subsidyAuthority}) :
                  </td>
                  <td className="py-2 px-4 text-right font-black font-mono">
                    -{formatMoney(costBreakdown.totalSubsidies, currencySymbol, currencyPos)}
                  </td>
                </tr>
              )}
              <tr className="bg-amber-600 text-white font-bold">
                <td colSpan={3} className="py-3 px-4 text-right text-sm">
                  Reste à Charge Réel Net (Investissement final) :
                </td>
                <td className="py-3 px-4 text-right font-black font-mono text-base">
                  {formatMoney(costBreakdown.netCostAfterSubsidies, currencySymbol, currencyPos)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 3. DÉTAIL DES SUBVENTIONS ET PRIMES APPLICABLES AU PAYS */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-neutral-900">
              Aides Financières & Subventions Déductibles en {countryProfile.name}
            </h4>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
            Cadre Réglementaire Officiel
          </span>
        </div>

        {costBreakdown.subsidies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {costBreakdown.subsidies.map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-950">{sub.label}</span>
                    <span className="text-sm font-black text-emerald-700">
                      {formatMoney(sub.amount, currencySymbol, currencyPos)}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800/90 leading-relaxed">{sub.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-700">
                  <span>Organisme payeur :</span>
                  <span className="font-semibold">{sub.authority}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-600">
            Aucune subvention directe en capital n’est appliquée pour ce profil. L’amortissement repose
            intégralement sur l’économie générée par l’autoconsommation et le rachat légal du surplus au gestionnaire
            de réseau.
          </div>
        )}
      </div>

      {/* 4. GUIDE DES DÉMARCHES ADMINISTRATIVES ET SPÉCIFICITÉS RÉGLEMENTAIRES */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-amber-600" />
            <h4 className="text-sm font-bold text-neutral-900">
              Procédure Administrative & Démarches Légales ({countryProfile.name})
            </h4>
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            Prises en charge par l’installateur certifié
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {countryProfile.administrativeSteps.map((step) => (
            <div
              key={step.step}
              className="p-3 rounded-lg border border-neutral-200 bg-neutral-50/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {step.step}
                  </span>
                  <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-200/60 px-1.5 py-0.5 rounded">
                    {step.delayWeeks}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-neutral-900 mb-1 leading-snug">{step.title}</h5>
                <p className="text-[11px] text-neutral-600 leading-relaxed">{step.description}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-200/80 text-[10px] text-neutral-500 flex flex-col gap-0.5">
                <div>
                  <span className="font-semibold text-neutral-700">Autorité :</span> {step.authority}
                </div>
                <div>
                  <span className="font-semibold text-neutral-700">Frais :</span> {step.costEstimate}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Spécificités & Points de vigilance */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg">
          <h5 className="text-xs font-bold text-amber-950 mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            <span>Exigences Techniques & Certifications Indispensables</span>
          </h5>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-amber-900/90">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Qualification Installateur :</strong> {countryProfile.installerCertificationName}
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Contrôle de Sécurité :</strong> {countryProfile.complianceCertificateName}
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Gestionnaire Réseau :</strong> {countryProfile.gridOperatorName}
              </span>
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Contrat de Surplus :</strong> {countryProfile.contractTypeName}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
