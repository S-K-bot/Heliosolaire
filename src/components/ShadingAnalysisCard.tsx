import React, { useState } from 'react';
import {
  Trees,
  Building2,
  Flame,
  Mountain,
  Eye,
  Plus,
  Trash2,
  Info,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Sun,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  SolarConfig,
  ShadingObstacle,
  ObstacleType,
  ObstacleAzimuth,
  ShadingLevel,
  ShadingImpactDetails,
} from '../types';
import { SHADING_FACTORS } from '../data/regions';

interface ShadingAnalysisCardProps {
  config: SolarConfig;
  shadingDetails: ShadingImpactDetails;
  onChange: (updated: Partial<SolarConfig>) => void;
}

const OBSTACLE_TYPE_CONFIG: Record<
  ObstacleType,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  tree: { label: 'Arbre / Végétation', icon: Trees, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  building: { label: 'Bâtiment / Maison', icon: Building2, color: 'text-neutral-700 bg-neutral-100 border-neutral-300' },
  chimney: { label: 'Cheminée / Lucarne', icon: Flame, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  dormer: { label: 'Pignon / Velux', icon: Building2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  hill: { label: 'Relief / Colline', icon: Mountain, color: 'text-amber-700 bg-amber-50 border-amber-200' },
};

const AZIMUTH_LABELS: Record<ObstacleAzimuth, { label: string; period: string }> = {
  EST: { label: 'Est', period: 'Matin (8h - 10h)' },
  SUD_EST: { label: 'Sud-Est', period: 'Fin de matinée (10h - 12h)' },
  SUD: { label: 'Sud', period: 'Plein midi (12h - 14h - Pic)' },
  SUD_OUEST: { label: 'Sud-Ouest', period: 'Début d’après-midi (14h - 16h)' },
  OUEST: { label: 'Ouest', period: 'Fin d’après-midi (16h - 19h)' },
};

export const ShadingAnalysisCard: React.FC<ShadingAnalysisCardProps> = ({
  config,
  shadingDetails,
  onChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Bascule Mode Simple vs Avancé
  const handleToggleMode = (useAdvanced: boolean) => {
    onChange({ useAdvancedShading: useAdvanced });
  };

  // Ajout d'obstacle type
  const handleAddPresetObstacle = (type: ObstacleType) => {
    let preset: ShadingObstacle;
    const id = 'obs_' + Date.now();

    if (type === 'tree') {
      preset = {
        id,
        name: 'Arbre feuillu',
        type: 'tree',
        azimuth: 'OUEST',
        distanceMeters: 10,
        heightAboveRoofMeters: 6,
        active: true,
      };
    } else if (type === 'building') {
      preset = {
        id,
        name: 'Maison mitoyenne voisine',
        type: 'building',
        azimuth: 'EST',
        distanceMeters: 8,
        heightAboveRoofMeters: 4,
        active: true,
      };
    } else if (type === 'chimney') {
      preset = {
        id,
        name: 'Cheminée / Lucarne sur le toit',
        type: 'chimney',
        azimuth: 'SUD_EST',
        distanceMeters: 3,
        heightAboveRoofMeters: 1.5,
        active: true,
      };
    } else {
      preset = {
        id,
        name: 'Relief / Colline',
        type: 'hill',
        azimuth: 'SUD_OUEST',
        distanceMeters: 25,
        heightAboveRoofMeters: 8,
        active: true,
      };
    }

    onChange({
      useAdvancedShading: true,
      obstacles: [...(config.obstacles || []), preset],
    });
  };

  // Mise à jour d'un obstacle
  const handleUpdateObstacle = (id: string, updated: Partial<ShadingObstacle>) => {
    const next = (config.obstacles || []).map((obs) => (obs.id === id ? { ...obs, ...updated } : obs));
    onChange({ obstacles: next });
  };

  // Suppression d'un obstacle
  const handleDeleteObstacle = (id: string) => {
    const next = (config.obstacles || []).filter((obs) => obs.id !== id);
    onChange({ obstacles: next });
  };

  const activeObstacles = (config.obstacles || []).filter((o) => o.active);

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Header avec résumé d'impact */}
      <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-amber-100 text-amber-900 rounded-lg">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-900">
                Analyse d'Ombrage & Masques Solaires
              </h3>
              {shadingDetails.lossPercentage > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Perte : -{shadingDetails.lossPercentage}%
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Plein soleil (0% ombrage)
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500">
              Simulez la projection d'ombre des arbres, maisons voisines et cheminées sur votre toiture
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Mode Switcher */}
          <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                !config.useAdvancedShading
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Mode Simple
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                config.useAdvancedShading
                  ? 'bg-neutral-900 text-white font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Mode Obstacles Réels
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 space-y-5">
          {/* MODE 1 : NIVEAU GLOBAL SIMPLE */}
          {!config.useAdvancedShading ? (
            <div className="space-y-4">
              <label className="text-xs font-semibold text-neutral-800 block">
                Sélectionnez le niveau d'ombrage global de votre toit :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(Object.keys(SHADING_FACTORS) as ShadingLevel[]).map((shadeId) => {
                  const data = SHADING_FACTORS[shadeId];
                  const isSelected = config.shading === shadeId;
                  const lossPct = Math.round((1 - data.factor) * 100);
                  return (
                    <button
                      key={shadeId}
                      type="button"
                      onClick={() => onChange({ shading: shadeId })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 text-neutral-900 font-semibold ring-1 ring-amber-500'
                          : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold">{data.label}</span>
                        <span
                          className={`font-semibold ${
                            lossPct === 0 ? 'text-emerald-700' : 'text-amber-800'
                          }`}
                        >
                          {lossPct === 0 ? 'Optimal' : `-${lossPct}%`}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {shadeId === 'none' && 'Toiture dégagée sans aucun obstacle proche.'}
                        {shadeId === 'low' && 'Arbres éloignés ou petit conduit de cheminée.'}
                        {shadeId === 'moderate' && 'Arbres proches masquant le soleil levant ou couchant.'}
                        {shadeId === 'high' && 'Bâtiment à proximité masquant une large part de la journée.'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 flex items-center justify-between">
                <span>Vous avez des arbres ou bâtiments précis autour de votre maison ?</span>
                <button
                  type="button"
                  onClick={() => handleToggleMode(true)}
                  className="px-3 py-1 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors shrink-0 ml-2"
                >
                  Configurer les obstacles réels
                </button>
              </div>
            </div>
          ) : (
            /* MODE 2 : SIMULATEUR AVANCÉ D'OBSTACLES */
            <div className="space-y-5">
              {/* Quick Add Buttons */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-neutral-800">
                    Ajouter un obstacle proche pour simuler son ombre :
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleAddPresetObstacle('tree')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-700" />
                    <Trees className="w-3.5 h-3.5" />
                    + Arbre / Haie haute
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetObstacle('building')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-neutral-100 text-neutral-800 text-xs font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-neutral-600" />
                    <Building2 className="w-3.5 h-3.5" />
                    + Bâtiment / Maison voisine
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetObstacle('chimney')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-300 bg-orange-50 text-orange-900 text-xs font-semibold hover:bg-orange-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-orange-700" />
                    <Flame className="w-3.5 h-3.5" />
                    + Cheminée / Lucarne
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPresetObstacle('hill')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-700" />
                    <Mountain className="w-3.5 h-3.5" />
                    + Relief / Colline
                  </button>
                </div>
              </div>

              {/* Graphical Solar Horizon Sun-Path Visualizer */}
              <div className="p-4 bg-neutral-900 rounded-xl text-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="font-bold">Trajectoire Solaire vs Hauteur des Obstacles</span>
                  </div>
                  <span className="text-neutral-400 text-[11px]">
                    Projection de l'horizon (Azimut & Élévation)
                  </span>
                </div>

                {/* SVG Horizon Curve */}
                <div className="relative w-full h-32 bg-neutral-950/60 rounded-lg p-2 border border-neutral-800 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                    {/* Grille d'élévation solaire */}
                    <line x1="0" y1="90" x2="500" y2="90" stroke="#333" strokeDasharray="3,3" />
                    <text x="10" y="87" fill="#666" fontSize="9">15° (Hiver)</text>
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#333" strokeDasharray="3,3" />
                    <text x="10" y="47" fill="#666" fontSize="9">45° (Équinoxe)</text>
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#333" strokeDasharray="3,3" />
                    <text x="10" y="17" fill="#666" fontSize="9">65° (Été)</text>

                    {/* Courbe de trajectoire solaire d'été (jaune dorée) */}
                    <path
                      d="M 20,115 Q 250,15 480,115"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                    />

                    {/* Courbe d'hiver (orange douce) */}
                    <path
                      d="M 80,115 Q 250,85 420,115"
                      fill="none"
                      stroke="#ea580c"
                      strokeWidth="1.5"
                      strokeDasharray="4,2"
                    />

                    {/* Obstacles positionnés sur l'horizon */}
                    {activeObstacles.map((obs) => {
                      // Mapping azimut vers coordonnée X : Est=50, Sud-Est=150, Sud=250, Sud-Ouest=350, Ouest=450
                      const xMap: Record<ObstacleAzimuth, number> = {
                        EST: 60,
                        SUD_EST: 150,
                        SUD: 250,
                        SUD_OUEST: 350,
                        OUEST: 440,
                      };
                      const x = xMap[obs.azimuth] || 250;
                      // Angle d'obstruction
                      const angle = (Math.atan2(obs.heightAboveRoofMeters, obs.distanceMeters) * 180) / Math.PI;
                      // Hauteur sur le graphique : 0° = 115, 65° = 20
                      const hNorm = Math.min(100, Math.max(10, (angle / 65) * 95));
                      const y = 115 - hNorm;

                      const isTree = obs.type === 'tree';
                      const isBuilding = obs.type === 'building';
                      const color = isTree ? '#10b981' : isBuilding ? '#94a3b8' : '#f97316';

                      return (
                        <g key={obs.id}>
                          {/* Barre d'ombrage */}
                          <rect
                            x={x - 22}
                            y={y}
                            width="44"
                            height={115 - y}
                            fill={color}
                            fillOpacity="0.4"
                            stroke={color}
                            strokeWidth="1.5"
                            rx="3"
                          />
                          {/* Label de l'obstacle */}
                          <text
                            x={x}
                            y={y - 4}
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {Math.round(angle)}°
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Axe des directions */}
                  <div className="absolute bottom-1 inset-x-0 flex justify-between px-6 text-[9px] text-neutral-400 font-bold uppercase tracking-wider pointer-events-none">
                    <span>Est (Matin)</span>
                    <span>Sud-Est</span>
                    <span className="text-amber-400 font-extrabold">Sud (Midi)</span>
                    <span>Sud-Ouest</span>
                    <span>Ouest (Soir)</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-300">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                      Soleil d'été
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      Arbres
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400 inline-block"></span>
                      Bâtiments
                    </span>
                  </div>
                  <span className="text-neutral-400">
                    {activeObstacles.length} obstacle(s) actif(s) pris en compte
                  </span>
                </div>
              </div>

              {/* Obstacles List & Sliders */}
              <div className="space-y-3">
                {(!config.obstacles || config.obstacles.length === 0) ? (
                  <div className="p-4 text-center border border-dashed border-neutral-300 rounded-xl text-neutral-500 text-xs">
                    Aucun obstacle ajouté. Cliquez sur un des boutons ci-dessus pour ajouter un arbre ou un bâtiment voisin.
                  </div>
                ) : (
                  config.obstacles.map((obs) => {
                    const angleDeg = (Math.atan2(obs.heightAboveRoofMeters, obs.distanceMeters) * 180) / Math.PI;
                    const typeConfig = OBSTACLE_TYPE_CONFIG[obs.type];
                    const Icon = typeConfig.icon;

                    return (
                      <div
                        key={obs.id}
                        className={`p-4 rounded-xl border transition-all ${
                          obs.active
                            ? 'border-neutral-200 bg-white shadow-2xs'
                            : 'border-neutral-200 bg-neutral-50/60 opacity-60'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={obs.active}
                              onChange={(e) => handleUpdateObstacle(obs.id, { active: e.target.checked })}
                              className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                            />
                            <div className={`p-1.5 rounded-md border ${typeConfig.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <input
                              type="text"
                              value={obs.name}
                              onChange={(e) => handleUpdateObstacle(obs.id, { name: e.target.value })}
                              className="font-bold text-xs text-neutral-900 border-b border-transparent hover:border-neutral-300 focus:border-amber-500 focus:outline-hidden bg-transparent"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-neutral-100 text-neutral-700">
                              Angle : {angleDeg.toFixed(1)}°
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteObstacle(obs.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition-colors"
                              title="Supprimer cet obstacle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          {/* Azimut / Position */}
                          <div>
                            <label className="text-neutral-500 block mb-1">Direction / Azimut :</label>
                            <select
                              value={obs.azimuth}
                              onChange={(e) =>
                                handleUpdateObstacle(obs.id, { azimuth: e.target.value as ObstacleAzimuth })
                              }
                              className="w-full px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-semibold text-neutral-800"
                            >
                              {(Object.keys(AZIMUTH_LABELS) as ObstacleAzimuth[]).map((az) => (
                                <option key={az} value={az}>
                                  {AZIMUTH_LABELS[az].label} — {AZIMUTH_LABELS[az].period}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Distance */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-neutral-500">Distance aux panneaux :</span>
                              <strong className="text-neutral-900">{obs.distanceMeters} m</strong>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max="40"
                              step="1"
                              value={obs.distanceMeters}
                              onChange={(e) =>
                                handleUpdateObstacle(obs.id, { distanceMeters: parseFloat(e.target.value) })
                              }
                              className="w-full accent-amber-600"
                            />
                          </div>

                          {/* Hauteur */}
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-neutral-500">Hauteur au-dessus du toit :</span>
                              <strong className="text-neutral-900">{obs.heightAboveRoofMeters} m</strong>
                            </div>
                            <input
                              type="range"
                              min="0.5"
                              max="20"
                              step="0.5"
                              value={obs.heightAboveRoofMeters}
                              onChange={(e) =>
                                handleUpdateObstacle(obs.id, { heightAboveRoofMeters: parseFloat(e.target.value) })
                              }
                              className="w-full accent-amber-600"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* BILAN DE L'IMPACT FINANCIER & ÉNERGÉTIQUE DE L'OMBRAGE */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-amber-600" />
                Impact chiffré de l'ombrage sur l'installation ({config.systemPowerKWp} kWc) :
              </span>
              <span className="text-amber-900 font-extrabold text-sm">
                -{shadingDetails.lossPercentage}% de production
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                <span className="text-neutral-500 block text-[11px]">Énergie perdue :</span>
                <strong className="text-base font-bold text-amber-900">
                  -{shadingDetails.lostAnnualKWh} kWh/an
                </strong>
              </div>

              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                <span className="text-neutral-500 block text-[11px]">Perte financière annuelle :</span>
                <strong className="text-base font-bold text-amber-900">
                  -{shadingDetails.lostAnnualEuros} €/an
                </strong>
              </div>

              <div className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs">
                <span className="text-neutral-500 block text-[11px]">Manque à gagner 25 ans :</span>
                <strong className="text-base font-bold text-neutral-900">
                  -{(shadingDetails.lost25YearsEuros ?? 0).toLocaleString('fr-FR')} €
                </strong>
              </div>

              <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-2xs">
                <span className="text-emerald-700 block text-[11px] font-semibold">
                  Gain Micro-Onduleurs :
                </span>
                <strong className="text-base font-bold text-emerald-700">
                  +{shadingDetails.microInverterMitigationBenefitKWh} kWh/an
                </strong>
                <span className="text-[10px] text-neutral-400 block mt-0.5">
                  isolés par panneau
                </span>
              </div>
            </div>

            {/* Recommendation on Inverters */}
            <div className="text-[11px] text-neutral-600 pt-1 flex items-start gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Recommandation technique :</strong> En présence d'ombrages partiels (arbres ou cheminée),
                l'usage de <strong>micro-onduleurs individuels (ou optimiseurs DC)</strong> est crucial.
                Ils empêchent qu'un seul panneau ombragé ne fasse chuter la production de l'ensemble de la toiture.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
