import {
  SolarConfig,
  SimulationResults,
  MonthlyBreakdown,
  HourlyPoint,
  YearProjection,
  OptimizationPreset,
  ShadingImpactDetails,
} from '../types';
import {
  REGIONS,
  ORIENTATION_FACTORS,
  TILT_FACTORS,
  SHADING_FACTORS,
  MONTH_NAMES_FR,
  getRegionInfo,
  getRegionsForCountry,
} from '../data/regions';
import {
  getCountryProfile,
  generateInstallationCostBreakdown,
  calculateCountrySubsidies,
} from '../data/countries';

/**
 * Calcule l'estimation annuelle de consommation électrique en kWh
 * si l'utilisateur utilise le mode détaillé.
 */
export function estimateAnnualConsumptionKWh(config: SolarConfig): number {
  if (!config.useAdvancedConsumption) {
    if (config.annualConsumptionKWh > 0) {
      return config.annualConsumptionKWh;
    }
    if (config.annualBillEuros > 0 && config.gridElectricityCostPerKWh > 0) {
      return Math.round(config.annualBillEuros / config.gridElectricityCostPerKWh);
    }
    return 5500; // Valeur par défaut moyenne française
  }

  // Calcul basé sur les équipements
  let totalKWh = 1200; // Base maison (éclairage, électroménager froid, électronique)
  totalKWh += (config.occupantsCount || 3) * 650; // Usage par personne
  totalKWh += (config.homeSurfaceM2 || 100) * 8; // Surface

  // Chauffage
  if (config.equipment.hasElectricHeating) {
    totalKWh += (config.homeSurfaceM2 || 100) * 85; // Convecteurs
  } else if (config.equipment.hasHeatPump) {
    totalKWh += (config.homeSurfaceM2 || 100) * 32; // Pompe à chaleur (COP ~ 3.5)
  }

  // Eau chaude
  if (config.equipment.hasElectricWaterHeater) {
    if (config.equipment.isThermodynamicWaterHeater) {
      totalKWh += (config.occupantsCount || 3) * 300;
    } else {
      totalKWh += (config.occupantsCount || 3) * 850;
    }
  }

  // Véhicule électrique
  if (config.equipment.hasElectricVehicle) {
    const km = config.equipment.evAnnualKm || 15000;
    totalKWh += Math.round(km * 0.17); // ~17 kWh / 100km
  }

  // Climatisation
  if (config.equipment.hasAirConditioning) {
    totalKWh += (config.homeSurfaceM2 || 100) * 8;
  }

  // Piscine
  if (config.equipment.hasPool) {
    totalKWh += 1800; // Filtration 5 mois
  }

  return Math.round(totalKWh);
}

/**
 * Calcule le coût brut d'installation clé en main (matériel + pose RGE certifiée + Consuel + raccordement)
 */
export function calculateGrossInstallationCost(config: SolarConfig): number {
  if (config.customInstallationCost !== null && config.customInstallationCost > 0) {
    return config.customInstallationCost;
  }

  const kwp = config.systemPowerKWp;
  let baseCostPerKWp = 2300;

  if (kwp <= 3) {
    baseCostPerKWp = 2300; // ~6 900 € pour 3 kWc
  } else if (kwp <= 6) {
    baseCostPerKWp = 1950; // ~11 700 € pour 6 kWc
  } else if (kwp <= 9) {
    baseCostPerKWp = 1750; // ~15 750 € pour 9 kWc
  } else {
    baseCostPerKWp = 1580;
  }

  let totalCost = kwp * baseCostPerKWp;

  // Technologie d'onduleur : Micro-onduleurs vs Onduleur avec optimiseurs vs Onduleur unique central
  if (config.inverterType === 'micro') {
    const panelsCount = Math.round((kwp * 1000) / config.panelWattage);
    totalCost += panelsCount * 60; // Légère plus-value micro-onduleurs
  } else if (config.inverterType === 'string_opt') {
    const panelsCount = Math.round((kwp * 1000) / config.panelWattage);
    totalCost += panelsCount * 45; // Plus-value optimiseurs individuels de puissance
  } else {
    // 'string_central' : Onduleur unique pour tous les panneaux (aucun surcoût d'optimiseurs ou micro-onduleurs)
  }

  // Routeur solaire chauffe-eau
  if (config.hasSolarRouter) {
    totalCost += 480; // Boîtier électronique routeur + pose
  }

  // Batterie de stockage (LFP)
  if (config.batteryCapacityKWh > 0) {
    // Environ 720 € / kWh installé avec BMS et coffret de protection
    totalCost += config.batteryCapacityKWh * 720;
  }

  // TVA : 10% pour ≤ 3 kWc, 20% au-delà (le barème baseCost intègre la TVA standard)
  if (kwp > 3) {
    // ajustement léger pour la TVA à 20%
    totalCost *= 1.05;
  }

  return Math.round(totalCost);
}

/**
 * Calcule l'irradiation solaire moyenne en kWh/kWc/an à partir des coordonnées GPS (Latitude / Longitude)
 * selon le modèle géospatial PVGIS / Commission Européenne pour la France et l'Europe de l'Ouest.
 */
export function calculateIrradiationFromCoordinates(lat: number, lng: number): {
  annualIrradiation: number;
  region: import('../types').RegionId;
} {
  // Détection pour la Tunisie (lat ~30° à 37.5°, lng ~7.5° à 11.8°)
  if (lat >= 30.0 && lat <= 37.6 && lng >= 7.5 && lng <= 12.0) {
    let tnReg = 'tn_nord';
    let baseIrrad = 1680;
    if (lat < 33.5) {
      tnReg = 'tn_sahara';
      baseIrrad = 2090;
    } else if (lat < 34.2) {
      tnReg = 'tn_djerba_sud';
      baseIrrad = 1970;
    } else if (lat < 35.0) {
      tnReg = 'tn_sfax_sud_est';
      baseIrrad = 1890;
    } else if (lat < 35.8) {
      tnReg = 'tn_centre';
      baseIrrad = 1860;
    } else if (lat < 36.3) {
      tnReg = 'tn_sahel';
      baseIrrad = 1780;
    } else {
      tnReg = 'tn_nord';
      baseIrrad = 1680;
    }
    return {
      annualIrradiation: baseIrrad,
      region: tnReg,
    };
  }

  // Détection Maroc (lat ~21° à 36°, lng ~-17° à -1°)
  if (lat >= 21.0 && lat <= 36.0 && lng >= -17.0 && lng <= -1.0) {
    if (lat < 30.0) return { annualIrradiation: 2250, region: 'ma_sahara_sud' };
    if (lat < 31.8) return { annualIrradiation: 2080, region: 'ma_souss_marrakech' };
    if (lat < 33.5) return { annualIrradiation: 1950, region: 'ma_centre' };
    if (lng < -6.0) return { annualIrradiation: 1840, region: 'ma_atlantique' };
    return { annualIrradiation: 1760, region: 'ma_nord_oriental' };
  }

  // Détection Belgique (lat ~49.5° à 51.5°, lng ~2.5° à 6.4°)
  if (lat >= 49.5 && lat <= 51.5 && lng >= 2.5 && lng <= 6.4) {
    if (lat >= 51.1 && lng <= 3.4) return { annualIrradiation: 1040, region: 'be_flandre_littoral' };
    if (lat >= 50.9) return { annualIrradiation: 1010, region: 'be_flandre_centre' };
    if (lat >= 50.7) return { annualIrradiation: 990, region: 'be_bruxelles_brabant' };
    if (lat >= 50.3) return { annualIrradiation: 970, region: 'be_wallonie_nord' };
    return { annualIrradiation: 940, region: 'be_ardennes' };
  }

  // Détection Suisse (lat ~45.8° à 47.8°, lng ~5.9° à 10.5°)
  if (lat >= 45.8 && lat <= 47.8 && lng >= 5.9 && lng <= 10.5) {
    if (lat < 46.4 && lng > 7.0 && lng < 8.5) return { annualIrradiation: 1450, region: 'ch_valais' };
    if (lat < 46.4 && lng >= 8.5) return { annualIrradiation: 1380, region: 'ch_tessin' };
    if (lng < 6.8 && lat < 46.8) return { annualIrradiation: 1180, region: 'ch_leman' };
    if (lng >= 9.2) return { annualIrradiation: 1320, region: 'ch_grisons' };
    return { annualIrradiation: 1070, region: 'ch_plateau' };
  }

  // Détection Espagne (lat ~36° à 43.8°, lng ~-9.3° à 3.4°)
  if (lat >= 35.8 && lat <= 43.8 && lng >= -9.3 && lng <= 3.4) {
    if (lat < 38.0) return { annualIrradiation: 1880, region: 'es_andalousie' };
    if (lng > -0.5 && lat < 40.5) return { annualIrradiation: 1760, region: 'es_levante' };
    if (lng > 1.0 && lat < 40.2) return { annualIrradiation: 1740, region: 'es_baleares' };
    if (lat >= 40.5 && lng > 0.5) return { annualIrradiation: 1580, region: 'es_catalogne' };
    if (lat >= 42.5) return { annualIrradiation: 1220, region: 'es_nord' };
    return { annualIrradiation: 1680, region: 'es_centre' };
  }

  // Détection Allemagne (lat ~47.3° à 55.0°, lng ~5.9° à 15.0°)
  if (lat >= 47.3 && lat <= 55.0 && lng >= 5.9 && lng <= 15.0) {
    if (lat < 49.0 && lng >= 10.5) return { annualIrradiation: 1180, region: 'de_sud_baviere' };
    if (lat < 49.2 && lng < 10.5) return { annualIrradiation: 1140, region: 'de_sud_ouest' };
    if (lat >= 52.5) return { annualIrradiation: 940, region: 'de_nord' };
    if (lng >= 11.5) return { annualIrradiation: 1050, region: 'de_est_berlin' };
    return { annualIrradiation: 1020, region: 'de_centre_rhin' };
  }

  // Détection Italie (lat ~36.6° à 47.0°, lng ~6.6° à 18.5°)
  if (lat >= 36.6 && lat <= 47.0 && lng >= 6.6 && lng <= 18.5) {
    if (lat < 38.5) return { annualIrradiation: 1820, region: 'it_sicile' };
    if (lng < 10.0 && lat < 41.3) return { annualIrradiation: 1750, region: 'it_sardaigne' };
    if (lat < 41.5) return { annualIrradiation: 1680, region: 'it_sud' };
    if (lat < 44.0) return { annualIrradiation: 1520, region: 'it_centre' };
    return { annualIrradiation: 1220, region: 'it_nord' };
  }

  // Détection Royaume-Uni (lat ~50.0° à 59.0°, lng ~-8.0° à 1.8°)
  if (lat >= 50.0 && lat <= 59.0 && lng >= -8.0 && lng <= 1.8) {
    if (lat >= 55.0) return { annualIrradiation: 820, region: 'gb_scotland_ni' };
    if (lat >= 53.0) return { annualIrradiation: 890, region: 'gb_nord_england' };
    if (lat >= 52.0 && lng < -0.5) return { annualIrradiation: 950, region: 'gb_midlands_wales' };
    if (lat >= 51.3 && lng >= -0.5) return { annualIrradiation: 1020, region: 'gb_londres_est' };
    return { annualIrradiation: 1070, region: 'gb_sud' };
  }

  // Détection France (par défaut)
  let region: import('../types').RegionId = 'centre';

  if (lat < 43.2 && lng > 8.5) {
    region = 'corse';
  } else if (lat < 44.5 && lng > 4.2) {
    region = 'sud_est';
  } else if (lat < 45.2 && lng <= 2.5) {
    region = 'sud_ouest';
  } else if (lat >= 49.5) {
    region = 'nord';
  } else if (lng < -0.5 && lat >= 46.5) {
    region = 'ouest';
  } else if (lng > 5.5 && lat < 47.5) {
    region = 'est';
  } else if (lat >= 48.2 && lat < 49.5 && lng > 1.5 && lng < 4.5) {
    region = 'idf';
  } else {
    region = 'centre';
  }

  // Modèle d'irradiation en fonction de la latitude et longitude
  let base = 1000 + (50.5 - Math.min(50.5, Math.max(41.5, lat))) * 68;

  if (lat < 44.5 && lng > 4.0) {
    base += 140; // Effet PACA / Mistral
  } else if (lat < 44.0 && lng > 8.0) {
    base += 170; // Corse
  } else if (lng < -1.0 && lat < 46.5) {
    base += 50; // Bassin d'Arcachon / Côte landaise
  } else if (lat > 48.5 && lng > 6.0) {
    base -= 40; // Grand Est / Vosges
  }

  const annualIrradiation = Math.round(Math.min(1700, Math.max(900, base)));

  return {
    annualIrradiation,
    region,
  };
}

/**
 * Calcule l'impact détaillé des masques solaires et obstacles proches (arbres, bâtiments, cheminées)
 * sur la production annuelle selon la trigonométrie d'élévation solaire et la technologie d'onduleur.
 */
export function calculateDetailedObstacleShading(config: SolarConfig): ShadingImpactDetails {
  const unshadedAnnualKWh = Math.round(
    config.systemPowerKWp *
    (config.location?.annualIrradiationKWhPerKWp || 1200) *
    (ORIENTATION_FACTORS[config.orientation]?.factor ?? 1.0) *
    (TILT_FACTORS[config.tilt]?.factor ?? 1.0) *
    0.86
  );
  const priceKWh = (config.gridElectricityCostPerKWh || 0.25) * 0.7 + (config.feedInTariffPerKWh || 0.13) * 0.3;

  if (!config.useAdvancedShading || !config.obstacles || config.obstacles.length === 0) {
    const factor = SHADING_FACTORS[config.shading]?.factor ?? 1.0;
    const lossPercentage = Math.round((1 - factor) * 1000) / 10;
    const lostAnnualKWh = Math.round(unshadedAnnualKWh * (1 - factor));
    const lostAnnualEuros = Math.round(lostAnnualKWh * priceKWh);
    const lost25YearsEuros = Math.round(lostAnnualEuros * 25 * 1.35);

    return {
      effectiveShadingFactor: factor,
      lossPercentage,
      lostAnnualKWh,
      lostAnnualEuros,
      lost25YearsEuros,
      microInverterMitigationBenefitKWh: 0,
      obstaclesCount: 0,
    };
  }

  const activeObstacles = config.obstacles.filter((o) => o.active);
  if (activeObstacles.length === 0) {
    return {
      effectiveShadingFactor: 1.0,
      lossPercentage: 0,
      lostAnnualKWh: 0,
      lostAnnualEuros: 0,
      lost25YearsEuros: 0,
      microInverterMitigationBenefitKWh: 0,
      obstaclesCount: 0,
    };
  }

  let totalLossFraction = 0;
  for (const obs of activeObstacles) {
    const dist = Math.max(0.5, obs.distanceMeters);
    const height = Math.max(0.2, obs.heightAboveRoofMeters);
    const angleDeg = (Math.atan2(height, dist) * 180) / Math.PI;

    let azimuthWeight = 1.0;
    if (obs.azimuth === 'SUD') azimuthWeight = 1.35;
    else if (obs.azimuth === 'SUD_EST' || obs.azimuth === 'SUD_OUEST') azimuthWeight = 1.1;
    else if (obs.azimuth === 'EST') azimuthWeight = 0.85;
    else if (obs.azimuth === 'OUEST') azimuthWeight = 0.9;

    let opacityWeight = 1.0;
    if (obs.type === 'tree') opacityWeight = 0.72;
    else if (obs.type === 'building' || obs.type === 'hill') opacityWeight = 1.0;
    else if (obs.type === 'chimney') opacityWeight = 0.45;
    else if (obs.type === 'dormer') opacityWeight = 0.5;

    let obstacleLoss = 0;
    if (angleDeg > 5) {
      const normalizedAngle = Math.min(65, angleDeg - 5) / 60;
      obstacleLoss = Math.min(0.40, Math.pow(normalizedAngle, 1.2) * 0.32 * azimuthWeight * opacityWeight);
    }

    totalLossFraction = 1 - (1 - totalLossFraction) * (1 - obstacleLoss);
  }

  const rawLossFraction = Math.min(0.65, totalLossFraction);

  // Atténuation technologique selon la technologie d'onduleur
  let mitigationFactor = 1.0;
  if (config.inverterType === 'micro') {
    mitigationFactor = 0.62; // Micro-onduleurs indépendants par panneau
  } else if (config.inverterType === 'string_opt') {
    mitigationFactor = 0.72; // Optimiseurs MPPT sous chaque panneau
  } else {
    mitigationFactor = 1.0; // Onduleur unique central (effet de chaîne string standard)
  }
  const effectiveLossFraction = rawLossFraction * mitigationFactor;
  const effectiveShadingFactor = Math.max(0.35, 1.0 - effectiveLossFraction);

  const lossPercentage = Math.round(effectiveLossFraction * 1000) / 10;
  const lostAnnualKWh = Math.round(unshadedAnnualKWh * effectiveLossFraction);
  const withoutMitigationLostKWh = Math.round(unshadedAnnualKWh * rawLossFraction);
  const microInverterMitigationBenefitKWh = Math.max(0, withoutMitigationLostKWh - lostAnnualKWh);

  const lostAnnualEuros = Math.round(lostAnnualKWh * priceKWh);
  const lost25YearsEuros = Math.round(lostAnnualEuros * 25 * 1.35);

  return {
    effectiveShadingFactor,
    lossPercentage,
    lostAnnualKWh,
    lostAnnualEuros,
    lost25YearsEuros,
    microInverterMitigationBenefitKWh,
    obstaclesCount: activeObstacles.length,
  };
}

/**
 * Prime à l'autoconsommation selon l'arrêté tarifaire officiel en vigueur
 */
export function calculateSelfConsumptionGrant(systemPowerKWp: number): number {
  if (systemPowerKWp <= 3) {
    return Math.round(systemPowerKWp * 300); // 300 € / kWc pour <= 3 kWc
  } else if (systemPowerKWp <= 9) {
    return Math.round(systemPowerKWp * 230); // 230 € / kWc pour 3 à 9 kWc
  } else if (systemPowerKWp <= 36) {
    return Math.round(systemPowerKWp * 160);
  }
  return 0;
}

/**
 * Moteur principal de calcul et simulation
 */
export function runSolarSimulation(config: SolarConfig): SimulationResults {
  const regionData = getRegionInfo(
    config.region,
    config.countryCode || config.location?.countryCode
  );
  const orientationFactor = ORIENTATION_FACTORS[config.orientation]?.factor ?? 1.0;
  const tiltFactor = TILT_FACTORS[config.tilt]?.factor ?? 1.0;
  
  // Calcul d'ombrage précis
  const shadingDetails = calculateDetailedObstacleShading(config);
  const shadingFactor = shadingDetails.effectiveShadingFactor;

  // Pertes système standards (onduleur, câblage DC/AC, poussières) ~ 14%
  const systemEfficiencyFactor = 0.86;

  // Facteur de technologie de cellule (TOPCon, HJT, PERC, Poly)
  let techBonus = 1.025; // N-Type TOPCon par défaut
  let panelDegradationRate = 0.004; // 0.40% / an (87.4% à 30 ans)
  if (config.panelTechnology === 'hjt') {
    techBonus = 1.048; // +4.8% gain de cellule et coefficient de température d'élite (-0.26%/°C)
    panelDegradationRate = 0.003; // 0.30% / an (90% à 30 ans)
  } else if (config.panelTechnology === 'mono_perc') {
    techBonus = 1.00; // base standard PERC (-0.35%/°C)
    panelDegradationRate = 0.0055; // 0.55% / an (84.8% à 25 ans)
  } else if (config.panelTechnology === 'poly') {
    techBonus = 0.96; // -4.0%
    panelDegradationRate = 0.007; // 0.70% / an (80% à 25 ans)
  }

  // Bonus Bifacial : capte le rayonnement diffus et l'albédo réfléchi par l'arrière de la toiture/sol
  let bifacialFactor = 1.0;
  if (config.isBifacial) {
    const gainPct = config.bifacialGainPercent ?? 10;
    bifacialFactor = 1.0 + Math.max(0, Math.min(30, gainPct)) / 100;
  }

  // Inclinaison précise : si exactTiltDegrees est renseigné, calcul d'une courbe continue PVGIS
  let effectiveTiltFactor = tiltFactor;
  if (config.exactTiltDegrees !== undefined && config.exactTiltDegrees !== null) {
    const deg = Math.max(0, Math.min(90, config.exactTiltDegrees));
    // Optimum à 32° (facteur 1.0)
    effectiveTiltFactor = Math.max(0.62, 1.0 - Math.pow((deg - 32) / 80, 2) * 0.45);
  }

  // Orientation / Azimut précis (-180° à +180°, 0° = Sud)
  let effectiveOrientationFactor = orientationFactor;
  if (config.exactAzimuthDegrees !== undefined && config.exactAzimuthDegrees !== null) {
    const az = Math.abs(config.exactAzimuthDegrees);
    effectiveOrientationFactor = Math.max(0.50, 1.0 - Math.pow(az / 180, 1.6) * 0.50);
  }

  // Utilisation de l'irradiation GPS de Google Maps si disponible, sinon valeur régionale
  const rawIrradiation =
    config.location?.annualIrradiationKWhPerKWp || regionData.annualIrradiationKWhPerKWp;

  // Productible spécifique effectif (kWh / kWc / an)
  const effectiveYieldPerKWp =
    rawIrradiation *
    effectiveOrientationFactor *
    effectiveTiltFactor *
    techBonus *
    bifacialFactor *
    shadingFactor *
    systemEfficiencyFactor;

  const annualProductionKWh = Math.round(config.systemPowerKWp * effectiveYieldPerKWp);
  const annualConsumptionKWh = estimateAnnualConsumptionKWh(config);

  // Nombre de panneaux nécessaires (calculé ou fixé par l'utilisateur)
  const panelsCount =
    config.panelsCount && config.panelsCount > 0
      ? config.panelsCount
      : Math.max(1, Math.round((config.systemPowerKWp * 1000) / (config.panelWattage || 430)));
  const requiredRoofAreaM2 = Math.round(panelsCount * 1.95 * 10) / 10;

  // Calcul du taux d'autoconsommation de base
  // Rapport Production / Consommation
  const prodToConsRatio = annualConsumptionKWh > 0 ? annualProductionKWh / annualConsumptionKWh : 1;

  let baseSelfConsumptionRate = 0.65;
  if (prodToConsRatio < 0.4) {
    baseSelfConsumptionRate = 0.88;
  } else if (prodToConsRatio < 0.7) {
    baseSelfConsumptionRate = 0.76;
  } else if (prodToConsRatio < 1.0) {
    baseSelfConsumptionRate = 0.62;
  } else if (prodToConsRatio < 1.4) {
    baseSelfConsumptionRate = 0.48;
  } else {
    baseSelfConsumptionRate = 0.36;
  }

  // Modulation selon profil de présence
  if (config.presenceProfile === 'present_day') {
    baseSelfConsumptionRate += 0.08;
  } else if (config.presenceProfile === 'absent_day') {
    baseSelfConsumptionRate -= 0.09;
  }

  // Bonus Routeur Solaire Chauffe-eau
  // Le routeur capte les excédents pour chauffer l'eau sans batterie
  let routerBonusRate = 0;
  if (config.hasSolarRouter && (config.equipment.hasElectricWaterHeater || !config.useAdvancedConsumption)) {
    // Gain typique de +14% à +22% d'autoconsommation
    routerBonusRate = Math.min(0.20, (1 - baseSelfConsumptionRate) * 0.45);
  }

  // Bonus Batterie de stockage
  let batteryBonusRate = 0;
  if (config.batteryCapacityKWh > 0) {
    const batteryToPowerRatio = config.batteryCapacityKWh / config.systemPowerKWp;
    // Une batterie de 5 kWh sur 3 kWc apporte environ +25% à +35% d'autoconsommation
    const potentialGain = Math.min(0.40, batteryToPowerRatio * 0.22);
    batteryBonusRate = Math.min(potentialGain, (1 - (baseSelfConsumptionRate + routerBonusRate)) * 0.75);
  }

  // Bonus Smart EV charging
  let smartEVBonusRate = 0;
  if (config.hasSmartEVCharging && config.equipment.hasElectricVehicle) {
    smartEVBonusRate = 0.08;
  }

  let finalSelfConsumptionRate = baseSelfConsumptionRate + routerBonusRate + batteryBonusRate + smartEVBonusRate;
  // Bornage physique réaliste (5% min, 96% max car il y a toujours un léger talon ou surplus)
  finalSelfConsumptionRate = Math.min(0.96, Math.max(0.15, finalSelfConsumptionRate));

  const selfConsumedKWh = Math.round(annualProductionKWh * finalSelfConsumptionRate);
  const exportedKWh = Math.max(0, annualProductionKWh - selfConsumedKWh);
  const gridImportKWh = Math.max(0, annualConsumptionKWh - selfConsumedKWh);

  // Taux d'autoproduction / indépendance énergétique
  const selfSufficiencyRate = annualConsumptionKWh > 0
    ? Math.min(1.0, Math.round((selfConsumedKWh / annualConsumptionKWh) * 1000) / 1000)
    : 0;

  // Profil pays et calcul détaillé des coûts d'installation (« Volet Coûts »)
  const countryProfile = getCountryProfile(config.countryCode || config.location?.countryCode);
  const costBreakdown = generateInstallationCostBreakdown(config, countryProfile);

  // Calcul financier Année 1
  const grossInstallationCost = costBreakdown.totalTTC;
  const selfConsumptionGrant = costBreakdown.totalSubsidies;
  const netInvestmentCost = costBreakdown.netCostAfterSubsidies;

  const electricityPrice = config.gridElectricityCostPerKWh || countryProfile.defaultElectricityPricePerKWh;
  const feedInTariff =
    config.feedInTariffPerKWh !== undefined
      ? config.feedInTariffPerKWh
      : countryProfile.defaultFeedInTariffPerKWh;

  const annualBillSavingsEuros = Math.round(selfConsumedKWh * electricityPrice);
  const annualExportIncomeEuros = Math.round(exportedKWh * feedInTariff);
  const totalAnnualBenefitYear1 = annualBillSavingsEuros + annualExportIncomeEuros;

  // Répartition mensuelle
  const monthlyWeights = regionData.monthlyWeights;
  // Poids saisonnier de consommation (en hiver on consomme plus qu'en été)
  const monthlyConsumptionWeights = [
    0.135, 0.125, 0.105, 0.08, 0.065, 0.055,
    0.055, 0.06, 0.07, 0.09, 0.115, 0.145
  ];

  const monthlyData: MonthlyBreakdown[] = MONTH_NAMES_FR.map((name, idx) => {
    const prodMonth = Math.round(annualProductionKWh * monthlyWeights[idx]);
    const consMonth = Math.round(annualConsumptionKWh * monthlyConsumptionWeights[idx]);
    // Autoconsommation mensuelle
    const ratioM = consMonth > 0 ? prodMonth / consMonth : 1;
    let autoRateM = finalSelfConsumptionRate;
    if (ratioM > 1.2) {
      // En été, surplus plus grand donc taux d'autoconsommation plus bas
      autoRateM = Math.max(0.25, finalSelfConsumptionRate * 0.75);
    } else if (ratioM < 0.6) {
      // En hiver, quasi toute la production solaire est immédiatement bue par la maison
      autoRateM = Math.min(0.98, finalSelfConsumptionRate * 1.35);
    }
    const selfM = Math.min(prodMonth, Math.round(prodMonth * autoRateM));
    const expM = Math.max(0, prodMonth - selfM);
    const impM = Math.max(0, consMonth - selfM);

    return {
      month: name,
      monthIndex: idx,
      solarProductionKWh: prodMonth,
      consumptionKWh: consMonth,
      selfConsumedKWh: selfM,
      exportedKWh: expM,
      gridImportKWh: impM,
    };
  });

  // Profils journaliers types (24 heures) pour Été, Mi-saison, Hiver
  const hourlyProfiles = generateHourlyProfiles(
    config.systemPowerKWp,
    annualConsumptionKWh,
    config.presenceProfile,
    config.batteryCapacityKWh,
    config.hasSolarRouter
  );

  // Projection financière sur 25 ans
  const inflationRate = (config.annualInflationRate || 3.0) / 100;
  // Dégradation annuelle garantie selon la technologie des cellules (TOPCon: 0.4%/an, HJT: 0.3%/an, PERC: 0.55%/an)
  const effectiveDegradationRate = panelDegradationRate;
  const projections25Years: YearProjection[] = [];

  let cumulativeWithoutSolar = 0;
  let cumulativeWithSolarCashFlow = -netInvestmentCost;
  let paybackPeriodYears = 25;
  let foundPayback = false;

  for (let year = 1; year <= 25; year++) {
    const currentPrice = electricityPrice * Math.pow(1 + inflationRate, year - 1);
    const prodDegraded = annualProductionKWh * (1 - effectiveDegradationRate * (year - 1));
    const selfConsDegraded = prodDegraded * finalSelfConsumptionRate;
    const exportDegraded = prodDegraded - selfConsDegraded;

    const withoutSolarCost = Math.round(annualConsumptionKWh * currentPrice);
    cumulativeWithoutSolar += withoutSolarCost;

    const remainingGridImport = Math.max(0, annualConsumptionKWh - selfConsDegraded);
    const withSolarBill = Math.round(remainingGridImport * currentPrice);
    // Tarif EDF OA garanti 20 ans
    const feedInRateCurrent = year <= 20 ? feedInTariff : feedInTariff * 0.8;
    const feedInIncome = Math.round(exportDegraded * feedInRateCurrent);

    const solarSavingsAnnual = withoutSolarCost - withSolarBill + feedInIncome;

    // Remplacement éventuel de l'onduleur vers l'an 12
    let maintenanceCost = 0;
    if (year === 12) {
      if (config.inverterType === 'micro') {
        maintenanceCost = 300; // Micro-onduleurs garantis 25 ans, faible coût de maintenance
      } else if (config.inverterType === 'string_opt') {
        maintenanceCost = 900; // Remplacement onduleur central hybride avec optimiseurs
      } else {
        maintenanceCost = 750; // Remplacement onduleur unique de chaîne standard
      }
    }

    cumulativeWithSolarCashFlow += (solarSavingsAnnual - maintenanceCost);

    if (!foundPayback && cumulativeWithSolarCashFlow >= 0) {
      // Interpolation linéaire pour le temps de retour
      const prevCash = cumulativeWithSolarCashFlow - (solarSavingsAnnual - maintenanceCost);
      const frac = prevCash < 0 ? (-prevCash) / (solarSavingsAnnual - maintenanceCost) : 0;
      paybackPeriodYears = Math.round(((year - 1) + frac) * 10) / 10;
      foundPayback = true;
    }

    projections25Years.push({
      year,
      electricityPricePerKWh: Math.round(currentPrice * 1000) / 1000,
      withoutSolarCost,
      withoutSolarCumulative: cumulativeWithoutSolar,
      withSolarBill,
      feedInIncome,
      solarSavingsAnnual,
      netCashFlowCumulative: Math.round(cumulativeWithSolarCashFlow),
    });
  }

  if (!foundPayback) {
    paybackPeriodYears = Math.min(25, Math.round((netInvestmentCost / Math.max(1, totalAnnualBenefitYear1)) * 10) / 10);
  }

  const cumulativeSavings25Years = Math.round(cumulativeWithSolarCashFlow);
  const roiPercentage = netInvestmentCost > 0
    ? Math.round(((totalAnnualBenefitYear1 / netInvestmentCost) * 100) * 10) / 10
    : 100;

  // Calcul écologique : prise en compte exacte de l'intensité carbone du réseau national
  const gridCarbonFactorKg = (countryProfile.gridCarbonIntensityGramsPerKWh || 55) / 1000;
  const co2SavedKgPerYear = Math.round(annualProductionKWh * gridCarbonFactorKg);

  return {
    annualProductionKWh,
    annualConsumptionKWh,
    selfConsumedKWh,
    exportedKWh,
    gridImportKWh,
    selfConsumptionRate: Math.round(finalSelfConsumptionRate * 100),
    selfSufficiencyRate: Math.round(selfSufficiencyRate * 100),
    panelsCount,
    requiredRoofAreaM2,
    grossInstallationCost,
    selfConsumptionGrant,
    netInvestmentCost,
    annualBillSavingsEuros,
    annualExportIncomeEuros,
    totalAnnualBenefitYear1,
    paybackPeriodYears,
    cumulativeSavings25Years,
    roiPercentage,
    co2SavedKgPerYear,
    shadingDetails,
    costBreakdown,
    countryProfile,
    monthlyData,
    hourlyProfiles,
    projections25Years,
  };
}

/**
 * Génère des profils horaires de 24h pour visualiser la production vs consommation
 */
function generateHourlyProfiles(
  powerKWp: number,
  annualConsumptionKWh: number,
  presence: string,
  batteryKWh: number,
  hasRouter: boolean
) {
  const dailyConsKWh = annualConsumptionKWh / 365;

  const makeSeason = (peakSunHour: number, sunDurationHours: number, seasonalFactor: number) => {
    const points: HourlyPoint[] = [];
    const dailyProdKWh = (powerKWp * 3.4) * seasonalFactor;
    let batteryLevelKWh = batteryKWh > 0 ? batteryKWh * 0.2 : 0; // état initial charge 20%
    const maxSoc = batteryKWh * 0.95;
    const minSoc = batteryKWh * 0.10;

    for (let h = 0; h < 24; h++) {
      // Production solaire : profil en cloche gaussienne
      let prodW = 0;
      const startHour = peakSunHour - sunDurationHours / 2;
      const endHour = peakSunHour + sunDurationHours / 2;

      if (h >= startHour && h <= endHour) {
        const distFromPeak = Math.abs(h - peakSunHour);
        const normalized = Math.max(0, 1 - Math.pow(distFromPeak / (sunDurationHours / 2), 2));
        prodW = Math.round((dailyProdKWh * 1000 / (sunDurationHours * 0.65)) * normalized);
      }

      // Consommation : profil avec pics du matin (7h-9h) et soir (18h-22h) + talon
      const baseW = (dailyConsKWh * 1000 / 24) * 0.45;
      let activityFactor = 1.0;

      if (h >= 7 && h <= 9) {
        activityFactor = 2.4;
      } else if (h >= 12 && h <= 14) {
        activityFactor = presence === 'present_day' ? 2.1 : 1.2;
      } else if (h >= 18 && h <= 22) {
        activityFactor = 2.9;
      } else if (h >= 0 && h <= 6) {
        activityFactor = 0.55;
      } else {
        activityFactor = presence === 'present_day' ? 1.5 : 0.8;
      }

      // Routeur solaire : si fort surplus, absorbe jusqu'à 1500W pour l'eau chaude
      let routerAbsorbW = 0;
      if (hasRouter && prodW > (baseW * activityFactor) + 400) {
        const excess = prodW - (baseW * activityFactor);
        routerAbsorbW = Math.min(1800, excess * 0.7);
      }

      const consW = Math.round(baseW * activityFactor + routerAbsorbW);

      // Gestion batterie
      let battChargeW = 0;
      let battDischargeW = 0;

      if (prodW >= consW) {
        // Surplus potentiel
        const excessW = prodW - consW;
        if (batteryKWh > 0 && batteryLevelKWh < maxSoc) {
          battChargeW = Math.min(excessW, 2500); // max charge rate 2.5 kW
          batteryLevelKWh = Math.min(maxSoc, batteryLevelKWh + battChargeW / 1000);
        }
      } else {
        // Déficit
        const deficitW = consW - prodW;
        if (batteryKWh > 0 && batteryLevelKWh > minSoc) {
          battDischargeW = Math.min(deficitW, 2500, (batteryLevelKWh - minSoc) * 1000);
          batteryLevelKWh = Math.max(minSoc, batteryLevelKWh - battDischargeW / 1000);
        }
      }

      const selfW = Math.min(consW, prodW + battDischargeW);
      const exportW = Math.max(0, prodW - consW - battChargeW);
      const importW = Math.max(0, consW - prodW - battDischargeW);

      points.push({
        hour: h,
        timeLabel: `${h.toString().padStart(2, '0')}h`,
        productionW: prodW,
        consumptionW: consW,
        selfConsumedW: selfW,
        batteryChargeW: Math.round(battChargeW),
        batteryDischargeW: Math.round(battDischargeW),
        batterySocKWh: Math.round(batteryLevelKWh * 10) / 10,
        gridExportW: Math.round(exportW),
        gridImportW: Math.round(importW),
      });
    }

    return points;
  };

  return {
    summer: makeSeason(13.5, 14, 1.45),
    midSeason: makeSeason(13, 11, 1.0),
    winter: makeSeason(12.5, 8, 0.45),
  };
}

/**
 * Calculateur de scénarios d'optimisation préconfigurés
 */
export function calculateOptimizationPresets(
  baseConfig: SolarConfig
): OptimizationPreset[] {
  const annualCons = estimateAnnualConsumptionKWh(baseConfig);

  // 1. Scénario Rentabilité Maximale (Quick Payback / Fast ROI)
  // Vise typiquement 3 kWc (pour bénéficier de la TVA 10% et de la prime max par kWc) ou 4.5 kWc
  const roiPower = annualCons > 8000 ? 4.5 : 3.0;
  const roiPreset: OptimizationPreset = {
    id: 'roi',
    title: 'Rentabilité Maximale',
    subtitle: 'Retour sur investissement le plus rapide (6 à 8 ans)',
    description: `Installation calibrée à ${roiPower} kWc avec routeur chauffe-eau. Bénéficie de la TVA réduite à 10% et de la prime maximale par kWc sans surcoût de batterie lourde.`,
    config: {
      systemPowerKWp: roiPower,
      inverterType: 'micro',
      batteryCapacityKWh: 0,
      hasSolarRouter: true,
      hasSmartEVCharging: baseConfig.equipment.hasElectricVehicle,
    },
  };

  // 2. Scénario Autonomie & Sérénité (High Self-Sufficiency)
  // Vise 6 kWc à 9 kWc + Batterie 5 ou 10 kWh
  const autoPower = annualCons > 7000 ? 7.5 : 5.5;
  const batteryKWh = annualCons > 7000 ? 10 : 5;
  const autoPreset: OptimizationPreset = {
    id: 'autonomy',
    title: 'Autonomie & Indépendance',
    subtitle: 'Couverture jusqu’à 75-85% de vos besoins énergétiques',
    description: `Installation haute puissance (${autoPower} kWc) couplée à une batterie physique LFP de ${batteryKWh} kWh et pilotage d'énergie pour effacer les pics du soir et les coupures.`,
    config: {
      systemPowerKWp: autoPower,
      inverterType: 'micro',
      batteryCapacityKWh: batteryKWh,
      hasSolarRouter: true,
      hasSmartEVCharging: baseConfig.equipment.hasElectricVehicle,
    },
  };

  // 3. Scénario Équilibré / Recommandé (Compromis Idéal)
  // Puissance alignée avec la consommation globale annuelle
  const balancedPower = annualCons > 9000 ? 6.0 : annualCons > 5000 ? 4.5 : 3.0;
  const budgetPreset: OptimizationPreset = {
    id: 'budget',
    title: 'Équilibre Budget / Économies',
    subtitle: 'Le compromis recommandé par les ingénieurs solaires',
    description: `Dimensionnement ajusté (${balancedPower} kWc) sans batterie coûteuse mais avec routeur intelligent pour capter 100% de l'eau chaude et des appareils de jour.`,
    config: {
      systemPowerKWp: balancedPower,
      inverterType: 'micro',
      batteryCapacityKWh: 0,
      hasSolarRouter: true,
      hasSmartEVCharging: false,
    },
  };

  return [budgetPreset, roiPreset, autoPreset];
}
