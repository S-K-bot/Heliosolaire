export type PanelTechnologyType = 'topcon_ntype' | 'hjt' | 'mono_perc' | 'poly';

export interface PanelTechnologyInfo {
  id: PanelTechnologyType;
  name: string;
  shortName: string;
  badge: string;
  efficiencyPercent: number; // Rendement nominal en %
  tempCoeffPercentPerC: number; // Coefficient de perte thermique (%/°C au-dessus de 25°C)
  yieldBonusFactor: number; // Gain de productible par rapport au PERC standard
  degradationPerYear: number; // Dégradation annuelle (0.004 = 0.4%/an)
  warrantyYears: number; // Garantie de production (ans)
  bifacialReady: boolean;
  costMultiplier: number; // Multiplicateur de prix de fabrication
  description: string;
  advantages: string[];
}

export const PANEL_TECHNOLOGIES: Record<PanelTechnologyType, PanelTechnologyInfo> = {
  topcon_ntype: {
    id: 'topcon_ntype',
    name: 'N-Type TOPCon (Tunnel Oxide Passivated Contact)',
    shortName: 'N-Type TOPCon',
    badge: 'Standard Moderne 2024-2026',
    efficiencyPercent: 22.5,
    tempCoeffPercentPerC: -0.30,
    yieldBonusFactor: 1.025, // +2.5% de rendement annuel vs standard PERC
    degradationPerYear: 0.004, // 0.40% / an (87.4% à 30 ans)
    warrantyYears: 30,
    bifacialReady: true,
    costMultiplier: 1.05,
    description: 'Technologie dominante haute performance. Excellent comportement sous faible luminosité et faible coefficient de température.',
    advantages: [
      'Rendement élevé (22-23%)',
      'Excellente tenue en chaleur estivale (-0.30%/°C)',
      'Garantie linéaire 30 ans',
      'Facteur de bifacialité élevé (>80%)',
    ],
  },
  hjt: {
    id: 'hjt',
    name: 'HJT Hétérojonction (Silicium cristallin + couches amorphes)',
    shortName: 'HJT Hétérojonction',
    badge: 'Ultra Haute Performance',
    efficiencyPercent: 23.6,
    tempCoeffPercentPerC: -0.26,
    yieldBonusFactor: 1.048, // +4.8% de rendement annuel
    degradationPerYear: 0.003, // 0.30% / an (90% à 30 ans)
    warrantyYears: 30,
    bifacialReady: true,
    costMultiplier: 1.20,
    description: 'Technologie d’élite combinant silicium cristallin et silicium amorphe. Le meilleur coefficient de température et facteur bifacial du marché (>90%).',
    advantages: [
      'Rendement record (>23.5%)',
      'Perte thermique ultra-faible (-0.26%/°C)',
      'Bifacialité quasi parfaite (~90%)',
      'Dégradation minimale (< 0.3%/an)',
    ],
  },
  mono_perc: {
    id: 'mono_perc',
    name: 'Monocristallin PERC (Passivated Emitter and Rear Cell)',
    shortName: 'Mono PERC',
    badge: 'Standard Éprouvé',
    efficiencyPercent: 20.8,
    tempCoeffPercentPerC: -0.35,
    yieldBonusFactor: 1.00, // Référence base
    degradationPerYear: 0.0055, // 0.55% / an (84.8% à 25 ans)
    warrantyYears: 25,
    bifacialReady: false,
    costMultiplier: 0.95,
    description: 'La technologie historique des 8 dernières années. Éprouvée, fiable et très répandue.',
    advantages: [
      'Coût très maîtrisé',
      'Fiabilité et historique connus sur 20+ ans',
      'Rendement honorable (~20.5-21%)',
    ],
  },
  poly: {
    id: 'poly',
    name: 'Polycristallin classique',
    shortName: 'Polycristallin',
    badge: 'Économique / Ancienne génération',
    efficiencyPercent: 17.5,
    tempCoeffPercentPerC: -0.40,
    yieldBonusFactor: 0.96, // -4% de rendement
    degradationPerYear: 0.007, // 0.70% / an
    warrantyYears: 20,
    bifacialReady: false,
    costMultiplier: 0.80,
    description: 'Ancienne génération de cellules bleu marbré. Rendement surfacique plus faible demandant plus de surface de toit.',
    advantages: [
      'Prix le plus bas au m²',
      'Robuste',
    ],
  },
};
