import { RegionId, Orientation, InclinasonType, ShadingLevel } from '../types';

export interface RegionInfo {
  id: RegionId;
  name: string;
  departmentExamples: string;
  annualIrradiationKWhPerKWp: number; // Irradiation standard optimale (kWh produit par kWc installé)
  // Facteur mensuel de répartition de la production solaire (12 mois, totalise 1.0)
  monthlyWeights: number[];
}

export const COUNTRY_REGIONS: Record<string, Record<string, RegionInfo>> = {
  FR: {
    nord: {
      id: 'nord',
      name: 'Nord / Hauts-de-France / Ardennes',
      departmentExamples: 'Lille, Amiens, Arras, Dunkerque, Calais',
      annualIrradiationKWhPerKWp: 980,
      monthlyWeights: [0.03, 0.05, 0.09, 0.12, 0.14, 0.15, 0.15, 0.13, 0.08, 0.04, 0.02, 0.02],
    },
    idf: {
      id: 'idf',
      name: 'Île-de-France / Normandie / Grand Est',
      departmentExamples: 'Paris, Rouen, Reims, Strasbourg, Nancy, Metz',
      annualIrradiationKWhPerKWp: 1080,
      monthlyWeights: [0.035, 0.055, 0.09, 0.12, 0.135, 0.145, 0.145, 0.13, 0.085, 0.045, 0.025, 0.02],
    },
    ouest: {
      id: 'ouest',
      name: 'Bretagne / Pays de la Loire',
      departmentExamples: 'Rennes, Nantes, Brest, Angers, Vannes, Quimper',
      annualIrradiationKWhPerKWp: 1180,
      monthlyWeights: [0.04, 0.06, 0.095, 0.115, 0.13, 0.135, 0.135, 0.125, 0.09, 0.05, 0.03, 0.025],
    },
    centre: {
      id: 'centre',
      name: 'Centre-Val de Loire / Bourgogne / Auvergne',
      departmentExamples: 'Tours, Orléans, Clermont-Ferrand, Dijon, Bourges',
      annualIrradiationKWhPerKWp: 1220,
      monthlyWeights: [0.04, 0.06, 0.095, 0.115, 0.13, 0.14, 0.14, 0.125, 0.09, 0.05, 0.03, 0.025],
    },
    est: {
      id: 'est',
      name: 'Franche-Comté / Massif Alpin',
      departmentExamples: 'Besançon, Grenoble, Annecy, Chambéry, Belfort',
      annualIrradiationKWhPerKWp: 1250,
      monthlyWeights: [0.04, 0.06, 0.095, 0.115, 0.13, 0.135, 0.135, 0.125, 0.09, 0.055, 0.035, 0.03],
    },
    sud_ouest: {
      id: 'sud_ouest',
      name: 'Nouvelle-Aquitaine / Occitanie Ouest',
      departmentExamples: 'Bordeaux, Toulouse, Pau, La Rochelle, Montauban, Bayonne',
      annualIrradiationKWhPerKWp: 1360,
      monthlyWeights: [0.045, 0.065, 0.095, 0.11, 0.125, 0.135, 0.14, 0.13, 0.095, 0.06, 0.035, 0.03],
    },
    sud_est: {
      id: 'sud_est',
      name: 'PACA / Occitanie Est / Vallée du Rhône',
      departmentExamples: 'Marseille, Nice, Montpellier, Toulon, Avignon, Nîmes',
      annualIrradiationKWhPerKWp: 1540,
      monthlyWeights: [0.055, 0.07, 0.095, 0.105, 0.12, 0.13, 0.135, 0.125, 0.10, 0.07, 0.045, 0.04],
    },
    corse: {
      id: 'corse',
      name: 'Corse',
      departmentExamples: 'Ajaccio, Bastia, Porto-Vecchio, Calvi, Corte',
      annualIrradiationKWhPerKWp: 1620,
      monthlyWeights: [0.055, 0.07, 0.095, 0.105, 0.12, 0.13, 0.135, 0.125, 0.10, 0.07, 0.045, 0.04],
    },
  },

  TN: {
    tn_nord: {
      id: 'tn_nord',
      name: 'Grand Tunis / Nord & Cap Bon',
      departmentExamples: 'Tunis, Ariana, Ben Arous, Manouba, Bizerte, Nabeul, Béja, Jendouba',
      annualIrradiationKWhPerKWp: 1680,
      monthlyWeights: [0.055, 0.065, 0.088, 0.102, 0.115, 0.122, 0.125, 0.115, 0.092, 0.078, 0.058, 0.048],
    },
    tn_sahel: {
      id: 'tn_sahel',
      name: 'Sahel & Centre-Est Littoral',
      departmentExamples: 'Sousse, Monastir, Mahdia, Enfidha, Moknine',
      annualIrradiationKWhPerKWp: 1780,
      monthlyWeights: [0.06, 0.068, 0.088, 0.10, 0.112, 0.12, 0.122, 0.115, 0.092, 0.08, 0.062, 0.052],
    },
    tn_centre: {
      id: 'tn_centre',
      name: 'Centre Ouest & Hautes Plaines',
      departmentExamples: 'Kairouan, Sidi Bouzid, Kasserine, Siliana, Le Kef',
      annualIrradiationKWhPerKWp: 1860,
      monthlyWeights: [0.062, 0.07, 0.089, 0.098, 0.11, 0.118, 0.12, 0.114, 0.092, 0.082, 0.065, 0.055],
    },
    tn_sfax_sud_est: {
      id: 'tn_sfax_sud_est',
      name: 'Sfax & Golfe de Gabès',
      departmentExamples: 'Sfax, Gabès, Kerkenah, Maharès, El Hamma',
      annualIrradiationKWhPerKWp: 1890,
      monthlyWeights: [0.064, 0.072, 0.089, 0.098, 0.11, 0.116, 0.118, 0.112, 0.092, 0.082, 0.067, 0.057],
    },
    tn_djerba_sud: {
      id: 'tn_djerba_sud',
      name: 'Djerba & Région de Médenine / Zarzis',
      departmentExamples: 'Houmt Souk, Midoun, Médenine, Zarzis, Ben Gardane',
      annualIrradiationKWhPerKWp: 1970,
      monthlyWeights: [0.068, 0.074, 0.088, 0.096, 0.108, 0.114, 0.116, 0.11, 0.092, 0.084, 0.07, 0.06],
    },
    tn_sahara: {
      id: 'tn_sahara',
      name: 'Sahara, Chott & Sud Profond',
      departmentExamples: 'Tozeur, Tataouine, Kébili, Gafsa, Douz, Nefta',
      annualIrradiationKWhPerKWp: 2090,
      monthlyWeights: [0.07, 0.075, 0.088, 0.095, 0.105, 0.112, 0.115, 0.11, 0.092, 0.085, 0.072, 0.065],
    },
  },

  BE: {
    be_flandre_littoral: {
      id: 'be_flandre_littoral',
      name: 'Flandre occidentale & Littoral de la Mer du Nord',
      departmentExamples: 'Ostende, Bruges, Courtrai, La Panne, Coxyde, Roulers',
      annualIrradiationKWhPerKWp: 1040,
      monthlyWeights: [0.032, 0.052, 0.09, 0.12, 0.138, 0.148, 0.148, 0.13, 0.085, 0.045, 0.026, 0.02],
    },
    be_flandre_centre: {
      id: 'be_flandre_centre',
      name: 'Flandre centrale, Campine & Anvers',
      departmentExamples: 'Gand, Anvers, Malines, Saint-Nicolas, Alost, Turnhout',
      annualIrradiationKWhPerKWp: 1010,
      monthlyWeights: [0.03, 0.05, 0.09, 0.12, 0.14, 0.15, 0.15, 0.13, 0.085, 0.045, 0.025, 0.02],
    },
    be_bruxelles_brabant: {
      id: 'be_bruxelles_brabant',
      name: 'Région de Bruxelles-Capitale & Brabants',
      departmentExamples: 'Bruxelles, Leuven, Wavre, Waterloo, Nivelles, Hal',
      annualIrradiationKWhPerKWp: 990,
      monthlyWeights: [0.03, 0.05, 0.09, 0.12, 0.14, 0.15, 0.15, 0.13, 0.085, 0.045, 0.025, 0.02],
    },
    be_wallonie_nord: {
      id: 'be_wallonie_nord',
      name: 'Hainaut, Liège & Sillon Sambre-et-Meuse',
      departmentExamples: 'Charleroi, Liège, Mons, Namur, Tournai, Huy, Verviers',
      annualIrradiationKWhPerKWp: 970,
      monthlyWeights: [0.03, 0.05, 0.09, 0.12, 0.14, 0.15, 0.15, 0.13, 0.085, 0.045, 0.025, 0.02],
    },
    be_ardennes: {
      id: 'be_ardennes',
      name: 'Ardennes belges & Luxembourg belge',
      departmentExamples: 'Bastogne, Arlon, Neufchâteau, Bouillon, Marche-en-Famenne, Spa',
      annualIrradiationKWhPerKWp: 940,
      monthlyWeights: [0.03, 0.05, 0.09, 0.12, 0.14, 0.15, 0.15, 0.13, 0.085, 0.045, 0.025, 0.02],
    },
  },

  CH: {
    ch_valais: {
      id: 'ch_valais',
      name: 'Valais / Vallée du Rhône (Ensoleillement exceptionnel)',
      departmentExamples: 'Sion, Sierre, Martigny, Brigue, Viège, Monthey',
      annualIrradiationKWhPerKWp: 1450,
      monthlyWeights: [0.05, 0.065, 0.095, 0.11, 0.125, 0.135, 0.14, 0.13, 0.095, 0.065, 0.045, 0.035],
    },
    ch_tessin: {
      id: 'ch_tessin',
      name: 'Tessin (Sud des Alpes suisses & Climat méditerranéen)',
      departmentExamples: 'Lugano, Locarno, Bellinzone, Mendrisio, Ascona',
      annualIrradiationKWhPerKWp: 1380,
      monthlyWeights: [0.05, 0.065, 0.095, 0.11, 0.125, 0.13, 0.135, 0.125, 0.095, 0.065, 0.045, 0.035],
    },
    ch_leman: {
      id: 'ch_leman',
      name: 'Bassin Lémanique & Riviera vaudoise',
      departmentExamples: 'Genève, Lausanne, Nyon, Montreux, Vevey, Morges',
      annualIrradiationKWhPerKWp: 1180,
      monthlyWeights: [0.038, 0.058, 0.095, 0.115, 0.132, 0.14, 0.14, 0.128, 0.09, 0.052, 0.032, 0.025],
    },
    ch_grisons: {
      id: 'ch_grisons',
      name: 'Grisons & Engadine (Rayonnement alpin de haute altitude)',
      departmentExamples: 'Coire, Saint-Moritz, Davos, Pontresina, Scuol',
      annualIrradiationKWhPerKWp: 1320,
      monthlyWeights: [0.05, 0.065, 0.095, 0.11, 0.125, 0.13, 0.135, 0.125, 0.095, 0.065, 0.045, 0.035],
    },
    ch_plateau: {
      id: 'ch_plateau',
      name: 'Plateau suisse, Mittelland & Suisse alémanique',
      departmentExamples: 'Zurich, Berne, Bâle, Lucerne, Winterthour, Saint-Gall, Bienne',
      annualIrradiationKWhPerKWp: 1070,
      monthlyWeights: [0.035, 0.055, 0.09, 0.12, 0.135, 0.145, 0.145, 0.13, 0.085, 0.045, 0.025, 0.02],
    },
  },

  ES: {
    es_andalousie: {
      id: 'es_andalousie',
      name: 'Andalousie & Costa del Sol',
      departmentExamples: 'Séville, Malaga, Grenade, Cordoue, Cadix, Huelva, Almería',
      annualIrradiationKWhPerKWp: 1880,
      monthlyWeights: [0.06, 0.07, 0.09, 0.10, 0.112, 0.12, 0.122, 0.115, 0.092, 0.08, 0.062, 0.052],
    },
    es_canaries: {
      id: 'es_canaries',
      name: 'Îles Canaries (Rayonnement subtropical constant)',
      departmentExamples: 'Tenerife, Las Palmas, Lanzarote, Fuerteventura, La Palma',
      annualIrradiationKWhPerKWp: 1960,
      monthlyWeights: [0.07, 0.075, 0.088, 0.095, 0.105, 0.112, 0.115, 0.11, 0.092, 0.085, 0.072, 0.065],
    },
    es_levante: {
      id: 'es_levante',
      name: 'Communauté valencienne & Région de Murcie',
      departmentExamples: 'Valence, Alicante, Murcie, Carthagène, Castellón',
      annualIrradiationKWhPerKWp: 1760,
      monthlyWeights: [0.058, 0.068, 0.09, 0.102, 0.115, 0.122, 0.125, 0.115, 0.092, 0.078, 0.058, 0.048],
    },
    es_baleares: {
      id: 'es_baleares',
      name: 'Îles Baléares',
      departmentExamples: 'Palma de Majorque, Ibiza, Minorque, Formentera, Manacor',
      annualIrradiationKWhPerKWp: 1740,
      monthlyWeights: [0.058, 0.068, 0.09, 0.102, 0.115, 0.122, 0.125, 0.115, 0.092, 0.078, 0.058, 0.048],
    },
    es_centre: {
      id: 'es_centre',
      name: 'Communauté de Madrid, Castille & Estrémadure',
      departmentExamples: 'Madrid, Tolède, Ciudad Real, Badajoz, Cáceres, Ségovie',
      annualIrradiationKWhPerKWp: 1680,
      monthlyWeights: [0.055, 0.065, 0.09, 0.105, 0.118, 0.125, 0.13, 0.12, 0.092, 0.075, 0.052, 0.045],
    },
    es_catalogne: {
      id: 'es_catalogne',
      name: 'Catalogne, Aragon & Costa Brava',
      departmentExamples: 'Barcelone, Saragosse, Tarragone, Gérone, Lérida',
      annualIrradiationKWhPerKWp: 1580,
      monthlyWeights: [0.052, 0.065, 0.092, 0.108, 0.12, 0.128, 0.132, 0.122, 0.095, 0.072, 0.05, 0.042],
    },
    es_nord: {
      id: 'es_nord',
      name: 'Nord, Cantabrie, Galice & Pays Basque',
      departmentExamples: 'Bilbao, Saint-Sébastien, Santander, La Corogne, Gijón, Vigo',
      annualIrradiationKWhPerKWp: 1220,
      monthlyWeights: [0.04, 0.06, 0.095, 0.115, 0.13, 0.14, 0.14, 0.125, 0.09, 0.05, 0.03, 0.025],
    },
  },

  DE: {
    de_sud_baviere: {
      id: 'de_sud_baviere',
      name: 'Bavière & Région Alpine',
      departmentExamples: 'Munich, Nuremberg, Augsbourg, Ratisbonne, Passau, Ingolstadt',
      annualIrradiationKWhPerKWp: 1180,
      monthlyWeights: [0.038, 0.058, 0.095, 0.118, 0.135, 0.142, 0.142, 0.128, 0.09, 0.05, 0.03, 0.024],
    },
    de_sud_ouest: {
      id: 'de_sud_ouest',
      name: 'Bade-Wurtemberg & Forêt-Noire',
      departmentExamples: 'Stuttgart, Fribourg, Karlsruhe, Mannheim, Heidelberg, Ulm',
      annualIrradiationKWhPerKWp: 1140,
      monthlyWeights: [0.036, 0.056, 0.095, 0.118, 0.135, 0.142, 0.142, 0.128, 0.09, 0.05, 0.03, 0.024],
    },
    de_centre_rhin: {
      id: 'de_centre_rhin',
      name: 'Rhénanie, Hesse & Rhénanie-du-Nord-Westphalie',
      departmentExamples: 'Francfort, Cologne, Düsseldorf, Dortmund, Essen, Mayence, Bonn',
      annualIrradiationKWhPerKWp: 1020,
      monthlyWeights: [0.032, 0.052, 0.09, 0.12, 0.138, 0.148, 0.148, 0.13, 0.085, 0.045, 0.026, 0.02],
    },
    de_est_berlin: {
      id: 'de_est_berlin',
      name: 'Berlin, Brandebourg, Saxe & Thuringe',
      departmentExamples: 'Berlin, Leipzig, Dresde, Potsdam, Erfurt, Magdebourg, Halle',
      annualIrradiationKWhPerKWp: 1050,
      monthlyWeights: [0.034, 0.054, 0.092, 0.12, 0.136, 0.146, 0.146, 0.128, 0.086, 0.046, 0.026, 0.02],
    },
    de_nord: {
      id: 'de_nord',
      name: 'Nord / Basse-Saxe, Mer du Nord & Baltique',
      departmentExamples: 'Hambourg, Brême, Hanovre, Kiel, Rostock, Lübeck, Wolfsburg',
      annualIrradiationKWhPerKWp: 940,
      monthlyWeights: [0.028, 0.048, 0.09, 0.122, 0.142, 0.152, 0.152, 0.132, 0.082, 0.042, 0.024, 0.018],
    },
  },

  GB: {
    gb_sud: {
      id: 'gb_sud',
      name: 'South of England & South Coast',
      departmentExamples: 'Brighton, Southampton, Portsmouth, Plymouth, Exeter, Bournemouth',
      annualIrradiationKWhPerKWp: 1070,
      monthlyWeights: [0.034, 0.054, 0.092, 0.12, 0.136, 0.146, 0.146, 0.128, 0.086, 0.046, 0.026, 0.02],
    },
    gb_londres_est: {
      id: 'gb_londres_est',
      name: 'Greater London & East Anglia',
      departmentExamples: 'London, Cambridge, Norwich, Ipswich, Chelmsford, Colchester',
      annualIrradiationKWhPerKWp: 1020,
      monthlyWeights: [0.032, 0.052, 0.09, 0.12, 0.138, 0.148, 0.148, 0.13, 0.085, 0.045, 0.026, 0.02],
    },
    gb_midlands_wales: {
      id: 'gb_midlands_wales',
      name: 'Midlands, Bristol & Wales',
      departmentExamples: 'Birmingham, Bristol, Cardiff, Swansea, Nottingham, Leicester',
      annualIrradiationKWhPerKWp: 950,
      monthlyWeights: [0.029, 0.049, 0.09, 0.122, 0.141, 0.151, 0.151, 0.131, 0.083, 0.043, 0.024, 0.019],
    },
    gb_nord_england: {
      id: 'gb_nord_england',
      name: 'North of England & Yorkshire',
      departmentExamples: 'Manchester, Leeds, Liverpool, Newcastle, Sheffield, York',
      annualIrradiationKWhPerKWp: 890,
      monthlyWeights: [0.026, 0.046, 0.09, 0.125, 0.145, 0.155, 0.155, 0.132, 0.08, 0.04, 0.022, 0.016],
    },
    gb_scotland_ni: {
      id: 'gb_scotland_ni',
      name: 'Scotland & Northern Ireland',
      departmentExamples: 'Edinburgh, Glasgow, Belfast, Aberdeen, Dundee, Derry, Inverness',
      annualIrradiationKWhPerKWp: 820,
      monthlyWeights: [0.024, 0.044, 0.09, 0.128, 0.148, 0.158, 0.158, 0.134, 0.078, 0.038, 0.02, 0.014],
    },
  },

  IT: {
    it_sicile: {
      id: 'it_sicile',
      name: 'Sicile (Gisement solaire méditerranéen majeur)',
      departmentExamples: 'Palerme, Catane, Syracuse, Agrigente, Trapani, Messine',
      annualIrradiationKWhPerKWp: 1820,
      monthlyWeights: [0.058, 0.068, 0.09, 0.102, 0.114, 0.12, 0.122, 0.116, 0.092, 0.08, 0.062, 0.052],
    },
    it_sardaigne: {
      id: 'it_sardaigne',
      name: 'Sardaigne',
      departmentExamples: 'Cagliari, Sassari, Olbia, Nuoro, Alghero, Oristano',
      annualIrradiationKWhPerKWp: 1750,
      monthlyWeights: [0.056, 0.068, 0.09, 0.102, 0.115, 0.122, 0.124, 0.116, 0.092, 0.078, 0.058, 0.048],
    },
    it_sud: {
      id: 'it_sud',
      name: 'Mezzogiorno (Pouilles, Campanie, Calabre)',
      departmentExamples: 'Naples, Bari, Lecce, Salerne, Tarente, Reggio de Calabre',
      annualIrradiationKWhPerKWp: 1680,
      monthlyWeights: [0.055, 0.065, 0.09, 0.105, 0.118, 0.125, 0.13, 0.12, 0.092, 0.075, 0.052, 0.045],
    },
    it_centre: {
      id: 'it_centre',
      name: 'Centre (Latium, Toscane, Ombrie, Marches)',
      departmentExamples: 'Rome, Florence, Pise, Pérouse, Sienne, Ancône, Viterbe',
      annualIrradiationKWhPerKWp: 1520,
      monthlyWeights: [0.05, 0.065, 0.092, 0.11, 0.122, 0.13, 0.134, 0.124, 0.095, 0.07, 0.048, 0.04],
    },
    it_nord: {
      id: 'it_nord',
      name: 'Nord (Lombardie, Piémont, Vénétie, Émilie-Romagne)',
      departmentExamples: 'Milan, Turin, Venise, Bologne, Vérone, Padoue, Bergame',
      annualIrradiationKWhPerKWp: 1220,
      monthlyWeights: [0.04, 0.06, 0.095, 0.115, 0.13, 0.14, 0.14, 0.125, 0.09, 0.05, 0.03, 0.025],
    },
  },

  MA: {
    ma_sahara_sud: {
      id: 'ma_sahara_sud',
      name: 'Sud Saharien, Draa-Tafilalet & Oasis',
      departmentExamples: 'Ouarzazate, Zagora, Laâyoune, Dakhla, Errachidia, Tinghir',
      annualIrradiationKWhPerKWp: 2250,
      monthlyWeights: [0.072, 0.076, 0.088, 0.095, 0.104, 0.11, 0.112, 0.108, 0.092, 0.085, 0.074, 0.068],
    },
    ma_souss_marrakech: {
      id: 'ma_souss_marrakech',
      name: 'Souss-Massa & Marrakech-Safi',
      departmentExamples: 'Marrakech, Agadir, Taroudant, Essaouira, Tiznit, Safi',
      annualIrradiationKWhPerKWp: 2080,
      monthlyWeights: [0.068, 0.074, 0.088, 0.096, 0.106, 0.114, 0.116, 0.11, 0.092, 0.084, 0.07, 0.062],
    },
    ma_centre: {
      id: 'ma_centre',
      name: 'Centre / Fès-Meknès & Béni Mellal-Khénifra',
      departmentExamples: 'Fès, Meknès, Béni Mellal, Khénifra, Taza, Ifrane',
      annualIrradiationKWhPerKWp: 1950,
      monthlyWeights: [0.065, 0.072, 0.089, 0.098, 0.108, 0.116, 0.118, 0.112, 0.092, 0.082, 0.066, 0.058],
    },
    ma_atlantique: {
      id: 'ma_atlantique',
      name: 'Littoral Atlantique (Casablanca-Settat & Rabat-Salé)',
      departmentExamples: 'Casablanca, Rabat, Salé, Kénitra, Mohammédia, El Jadida, Settat',
      annualIrradiationKWhPerKWp: 1840,
      monthlyWeights: [0.062, 0.07, 0.09, 0.10, 0.11, 0.118, 0.12, 0.114, 0.092, 0.08, 0.064, 0.054],
    },
    ma_nord_oriental: {
      id: 'ma_nord_oriental',
      name: 'Tanger-Tétouan-Al Hoceïma & Région Orientale',
      departmentExamples: 'Tanger, Tétouan, Oujda, Nador, Al Hoceïma, Larache',
      annualIrradiationKWhPerKWp: 1760,
      monthlyWeights: [0.058, 0.068, 0.09, 0.102, 0.115, 0.122, 0.124, 0.115, 0.092, 0.078, 0.058, 0.048],
    },
  },

  CA: {
    ca_qc_sud: {
      id: 'ca_qc_sud',
      name: 'Grand Montréal & Montérégie',
      departmentExamples: 'Montréal, Laval, Longueuil, Brossard, Saint-Jérôme, Vaudreuil',
      annualIrradiationKWhPerKWp: 1230,
      monthlyWeights: [0.045, 0.065, 0.095, 0.115, 0.13, 0.135, 0.14, 0.125, 0.09, 0.055, 0.035, 0.03],
    },
    ca_qc_estrie: {
      id: 'ca_qc_estrie',
      name: 'Estrie / Cantons-de-l’Est & Centre-du-Québec',
      departmentExamples: 'Sherbrooke, Magog, Drummondville, Victoriaville, Granby',
      annualIrradiationKWhPerKWp: 1210,
      monthlyWeights: [0.045, 0.065, 0.095, 0.115, 0.13, 0.135, 0.14, 0.125, 0.09, 0.055, 0.035, 0.03],
    },
    ca_qc_capitale: {
      id: 'ca_qc_capitale',
      name: 'Capitale-Nationale & Chaudière-Appalaches',
      departmentExamples: 'Québec, Lévis, Sainte-Foy, Beauport, Saint-Georges, Thetford Mines',
      annualIrradiationKWhPerKWp: 1160,
      monthlyWeights: [0.042, 0.062, 0.095, 0.115, 0.132, 0.138, 0.14, 0.126, 0.09, 0.052, 0.034, 0.028],
    },
    ca_qc_nord: {
      id: 'ca_qc_nord',
      name: 'Mauricie & Saguenay-Lac-Saint-Jean',
      departmentExamples: 'Trois-Rivières, Chicoutimi, Jonquière, Alma, Shawinigan',
      annualIrradiationKWhPerKWp: 1120,
      monthlyWeights: [0.04, 0.06, 0.095, 0.115, 0.135, 0.14, 0.14, 0.125, 0.09, 0.05, 0.032, 0.026],
    },
    ca_qc_est: {
      id: 'ca_qc_est',
      name: 'Bas-Saint-Laurent & Gaspésie / Îles',
      departmentExamples: 'Rimouski, Rivière-du-Loup, Matane, Gaspé, Carleton-sur-Mer',
      annualIrradiationKWhPerKWp: 1090,
      monthlyWeights: [0.04, 0.06, 0.095, 0.115, 0.135, 0.14, 0.14, 0.125, 0.09, 0.05, 0.032, 0.026],
    },
  },
};

export const REGIONS: Record<string, RegionInfo> = COUNTRY_REGIONS.FR;

export function getRegionsForCountry(countryCode?: string): Record<string, RegionInfo> {
  const code = (countryCode || 'FR').toUpperCase();
  return COUNTRY_REGIONS[code] || COUNTRY_REGIONS.FR;
}

export function getRegionInfo(regionId?: string, countryCode?: string): RegionInfo {
  const countryRegions = getRegionsForCountry(countryCode);
  if (regionId && countryRegions[regionId]) {
    return countryRegions[regionId];
  }
  // Check if regionId matches any region in any country
  if (regionId) {
    for (const cCode of Object.keys(COUNTRY_REGIONS)) {
      if (COUNTRY_REGIONS[cCode][regionId]) {
        return COUNTRY_REGIONS[cCode][regionId];
      }
    }
  }
  // Default to first region of specified country, or France centre
  const firstKey = Object.keys(countryRegions)[0];
  if (firstKey && countryRegions[firstKey]) {
    return countryRegions[firstKey];
  }
  return COUNTRY_REGIONS.FR.centre;
}

export const ORIENTATION_FACTORS: Record<Orientation, { label: string; factor: number; azimuthDeg: number }> = {
  SUD: { label: 'Plein Sud (Optimal)', factor: 1.0, azimuthDeg: 180 },
  SUD_EST: { label: 'Sud-Est', factor: 0.96, azimuthDeg: 135 },
  SUD_OUEST: { label: 'Sud-Ouest', factor: 0.96, azimuthDeg: 225 },
  EST: { label: 'Plein Est', factor: 0.82, azimuthDeg: 90 },
  OUEST: { label: 'Plein Ouest', factor: 0.82, azimuthDeg: 270 },
  NORD: { label: 'Nord (Non recommandé)', factor: 0.52, azimuthDeg: 0 },
};

export const TILT_FACTORS: Record<InclinasonType, { label: string; factor: number }> = {
  0: { label: 'Toit plat / Sol (0°)', factor: 0.88 },
  15: { label: 'Pente douce (15°)', factor: 0.95 },
  30: { label: 'Pente optimale standard (30° - 35°)', factor: 1.0 },
  45: { label: 'Pente forte (45°)', factor: 0.96 },
  60: { label: 'Façade / Très forte pente (60°)', factor: 0.85 },
};

export const SHADING_FACTORS: Record<ShadingLevel, { label: string; factor: number }> = {
  none: { label: 'Aucun ombrage (Dégagé)', factor: 1.0 },
  low: { label: 'Faible (Arbres éloignés ou cheminée)', factor: 0.95 },
  moderate: { label: 'Modéré (Obstacles proches en matinée/soirée)', factor: 0.86 },
  high: { label: 'Élevé (Bâtiment voisin haut ou relief)', factor: 0.72 },
};

export const MONTH_NAMES_FR = [
  'Janv', 'Févr', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
];
