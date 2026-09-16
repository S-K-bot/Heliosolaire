import React from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Zap,
  TrendingUp,
  BatteryCharging,
  Sliders,
  CheckCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { SolarConfig, OptimizationPreset, SimulationResults } from '../types';

interface OptimizerPanelProps {
  config: SolarConfig;
  results: SimulationResults;
  presets: OptimizationPreset[];
  onApplyPreset: (presetConfig: Partial<SolarConfig>) => void;
}

export const OptimizerPanel: React.FC<OptimizerPanelProps> = ({
  config,
  results,
  presets,
  onApplyPreset,
}) => {
  const handleSelectPreset = (preset: OptimizationPreset) => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
    onApplyPreset(preset.config);
  };

  // Diagnostic intelligent en temps réel
  const recommendations: { title: string; desc: string; icon: string; action?: () => void }[] = [];

  // 1. Analyse du routeur chauffe-eau
  if (!config.hasSolarRouter && (config.equipment.hasElectricWaterHeater || !config.useAdvancedConsumption)) {
    recommendations.push({
      title: 'Optimisation Chauffe-eau (Gain +15% à 20% d’autoconsommation)',
      desc: 'Votre installation produit un surplus durant les heures de midi. Un routeur solaire (coût ~480 €) permet de chauffer gratuitement votre ballon d’eau chaude avec les excédents au lieu de les vendre à bas coût. Amorti en moins de 18 mois !',
      icon: 'water',
    });
  }

  // 2. Analyse de la batterie
  if (config.batteryCapacityKWh === 0 && results.selfConsumptionRate < 60) {
    recommendations.push({
      title: 'Surplus important : évaluer le stockage sur batterie',
      desc: `Votre taux d’autoconsommation actuel est de ${results.selfConsumptionRate}%. L’ajout d’une batterie LFP de 5 kWh permettrait de stocker le surplus pour alimenter la maison en soirée et faire grimper l’autoconsommation à plus de 80%.`,
      icon: 'battery',
    });
  } else if (config.batteryCapacityKWh > 5 && results.paybackPeriodYears > 12) {
    recommendations.push({
      title: 'Batterie surdimensionnée par rapport au ROI',
      desc: `Une capacité de ${config.batteryCapacityKWh} kWh alourdit le coût net. Pour un retour sur investissement plus rapide (sous 9 ans), une batterie de 5 kWh ou un simple routeur thermique est financièrement plus efficient.`,
      icon: 'alert',
    });
  }

  // 3. Palier fiscal 3 kWc
  if (config.systemPowerKWp > 3 && config.systemPowerKWp < 4.5) {
    recommendations.push({
      title: 'Astuce Fiscale : Palier des 3 kWc',
      desc: 'À 3 kWc ou moins, la TVA est réduite à 10% (contre 20% au-delà) et la prime d’État est au barème supérieur (300 €/kWc). Si votre toiture ou budget est limité, 3 kWc offre souvent le rendement financier pur le plus élevé.',
      icon: 'tax',
    });
  }

  // 4. Recharge de véhicule électrique
  if (config.equipment.hasElectricVehicle && !config.hasSmartEVCharging) {
    recommendations.push({
      title: 'Véhicule Électrique : Activer la recharge solaire asservie',
      desc: 'Programmer la borne de recharge aux heures de pic solaire (11h-16h) permet de rouler 100% à l’énergie solaire gratuite plutôt que de payer les kilowattheures du réseau.',
      icon: 'ev',
    });
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-xs">
            <Sparkles className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Moteur d'Optimisation d'Autoconsommation
            </h2>
            <p className="text-xs text-amber-100">
              Scénarios certifiés pour maximiser la rentabilité et l'indépendance de votre logement
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Scénarios en 1 clic */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-600" />
              Scénarios préconfigurés selon votre profil
            </h3>
            <span className="text-xs text-neutral-500">Cliquez pour appliquer instantanément</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {presets.map((preset) => {
              const isSelected =
                config.systemPowerKWp === preset.config.systemPowerKWp &&
                config.batteryCapacityKWh === preset.config.batteryCapacityKWh &&
                config.hasSolarRouter === preset.config.hasSolarRouter;

              return (
                <div
                  key={preset.id}
                  id={`preset-${preset.id}`}
                  className={`rounded-xl border p-4 transition-all text-left flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500'
                      : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-neutral-900">
                        {preset.title}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center text-[11px] font-semibold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Actif
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-amber-700 mb-2">
                      {preset.subtitle}
                    </p>
                    <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                      {preset.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-200/70">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                      <span>Puissance : <strong>{preset.config.systemPowerKWp} kWc</strong></span>
                      <span>Batterie : <strong>{preset.config.batteryCapacityKWh ? `${preset.config.batteryCapacityKWh} kWh` : 'Sans'}</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white border border-neutral-300 text-neutral-800 hover:bg-neutral-100'
                      }`}
                    >
                      {isSelected ? 'Configuration appliquée' : 'Appliquer ce scénario'}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conseils & Recommandations personnalisées */}
        {recommendations.length > 0 && (
          <div className="pt-4 border-t border-neutral-100">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Recommandations d'optimisation sur mesure
            </h3>

            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3.5 flex items-start gap-3 text-xs"
                >
                  <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-neutral-900 mb-0.5">
                      {rec.title}
                    </h4>
                    <p className="text-neutral-700 leading-relaxed">
                      {rec.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
