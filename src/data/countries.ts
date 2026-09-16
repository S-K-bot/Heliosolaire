import { CountryProfile, AdministrativeStep, CostPostItem, InstallationCostBreakdown, SolarConfig } from '../types';

export const COUNTRIES: Record<string, CountryProfile> = {
  FR: {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: {
      symbol: '€',
      code: 'EUR',
      position: 'after',
    },
    defaultElectricityPricePerKWh: 0.2516, // Tarif Réglementé de Vente (Tarif Bleu EDF)
    defaultFeedInTariffPerKWh: 0.1276, // Tarif d'achat EDF OA pour ≤ 9 kWc (Arrêté S21)
    gridCarbonIntensityGramsPerKWh: 55, // Mix nucléaire et hydraulique très décarboné
    defaultVatRate: 0.10, // 10% pour ≤ 3 kWc, 20% au-delà
    vatRuleLabel: 'TVA réduite à 10% (≤ 3 kWc) / 20% (> 3 kWc)',
    subsidyName: "Prime à l'autoconsommation de l'État (Arrêté S21)",
    subsidyAuthority: 'Ministère de la Transition Écologique / EDF OA',
    subsidyDescription:
      'Prime officielle versée en une fois à la mise en service : 300 €/kWc jusqu’à 3 kWc, 230 €/kWc de 3 à 9 kWc.',
    gridOperatorName: 'Enedis (gestionnaire du réseau national de distribution)',
    complianceCertificateName: 'Attestation de conformité Consuel (Visa Jaune)',
    installerCertificationName: 'Qualification RGE QualiPV (Reconnu Garant de l’Environnement)',
    contractTypeName: 'Contrat d’Obligation d’Achat (EDF OA) garanti 20 ans',
    regulatoryHighlights: [
      'Arrêté tarifaire S21 : tarif de rachat garanti 20 ans par l’État indexé sur l’inflation.',
      'Prime à l’autoconsommation non imposable versée directement sur votre compte bancaire.',
      'Exonération d’impôt sur le revenu sur la revente de surplus si la puissance ≤ 3 kWc.',
      'Pose obligatoire par un installateur certifié RGE QualiPV pour prétendre aux aides d’État.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Déclaration Préalable en Mairie (DP)',
        authority: 'Mairie de la commune (Service Urbanisme)',
        delayWeeks: '4 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Dépôt du formulaire Cerfa 13703*10 pour modifier l’aspect extérieur de la toiture. Silence vaut accord après 1 mois.',
      },
      {
        step: 2,
        title: 'Demande de Raccordement Enedis',
        authority: 'Enedis (Portail Raccordement)',
        delayWeeks: '2 à 4 semaines',
        mandatory: true,
        costEstimate: 'Gratuit (en injection de surplus)',
        description:
          'Convention d’Accès et d’Exploitation (CAE / CRAE) pour autoriser l’injection d’électricité sur le réseau public.',
      },
      {
        step: 3,
        title: 'Contrôle de Conformité Consuel',
        authority: 'Consuel (Comité National Sécurité Électrique)',
        delayWeeks: '1 à 2 semaines',
        mandatory: true,
        costEstimate: 'Env. 190 € TTC (inclus dans devis artisan)',
        description:
          'Validation de la sécurité électrique de l’installation PV. L’attestation visée est indispensable pour la mise en service.',
      },
      {
        step: 4,
        title: 'Mise en Service & Contrat EDF OA',
        authority: 'Enedis & EDF Obligation d’Achat',
        delayWeeks: '1 à 2 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Télé-activation du compteur Linky en mode injection bidirectionnelle et activation du contrat de rachat sur 20 ans.',
      },
    ],
  },

  BE: {
    code: 'BE',
    name: 'Belgique',
    flag: '🇧🇪',
    currency: {
      symbol: '€',
      code: 'EUR',
      position: 'after',
    },
    defaultElectricityPricePerKWh: 0.34, // Prix moyen réseau en Belgique
    defaultFeedInTariffPerKWh: 0.082, // Tarif d'injection moyen selon fournisseur
    gridCarbonIntensityGramsPerKWh: 160,
    defaultVatRate: 0.06, // TVA 6% pour les logements de plus de 10 ans
    vatRuleLabel: 'TVA réduite à 6% pour habitations de + de 10 ans (21% sinon)',
    subsidyName: 'Primes régionales (Fluvius en Flandre / Soutien Wallonie)',
    subsidyAuthority: 'Gestionnaires de réseau régionaux (Fluvius / SPW)',
    subsidyDescription:
      'Primes régionales modulées selon la région et la puissance installée (jusqu’à 750 € selon barème).',
    gridOperatorName: 'Fluvius (Flandre) / ORES / Sibelga (Bruxelles) / Resa',
    complianceCertificateName: 'Rapport de contrôle de conformité RGIE',
    installerCertificationName: 'Certification RESCert (Énergies Renouvelables)',
    contractTypeName: 'Contrat d’injection de surplus & tarif prosumer',
    regulatoryHighlights: [
      'Généralement dispensé de permis d’urbanisme si les panneaux sont intégrés ou coplanaires au toit.',
      'Contrôle de conformité RGIE obligatoire par un organisme certifié (Vinçotte, BTV, etc.) avant raccordement.',
      'Mise en place d’un compteur communicant bidirectionnel pour le décompte de l’injection.',
      'Taux de TVA très avantageux de 6% pour les bâtiments de plus de 10 ans d’ancienneté.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Dispense ou Déclaration Urbanistique',
        authority: 'Commune / Région',
        delayWeeks: '1 semaine',
        mandatory: false,
        costEstimate: 'Gratuit',
        description:
          'En toiture inclinée dans le plan du toit, les installations sont généralement exonérées de permis d’urbanisme.',
      },
      {
        step: 2,
        title: 'Visite de Contrôle RGIE',
        authority: 'Organisme de contrôle agréé (BTV, Vinçotte, OCB)',
        delayWeeks: '1 à 2 semaines',
        mandatory: true,
        costEstimate: 'Env. 160 € TTC',
        description:
          'Vérification de la mise à la terre, des schémas unifilaires et de l’isolation par un inspecteur agréé.',
      },
      {
        step: 3,
        title: 'Notification au GRD (Fluvius / ORES)',
        authority: 'Gestionnaire de Réseau de Distribution',
        delayWeeks: '2 à 3 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Déclaration de l’installation avec le rapport de conformité RGIE pour validation et adaptation du compteur.',
      },
      {
        step: 4,
        title: 'Contrat d’Injection avec le Fournisseur',
        authority: 'Fournisseur d’énergie (Engie, TotalEnergies, Luminus)',
        delayWeeks: '1 à 2 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Négociation ou activation automatique du tarif de rachat de l’électricité injectée sur votre facture de décompte.',
      },
    ],
  },

  CH: {
    code: 'CH',
    name: 'Suisse',
    flag: '🇨🇭',
    currency: {
      symbol: 'CHF',
      code: 'CHF',
      position: 'after',
    },
    defaultElectricityPricePerKWh: 0.31, // Prix moyen du kWh en Suisse
    defaultFeedInTariffPerKWh: 0.14, // Tarif moyen de reprise des GRD suisses
    gridCarbonIntensityGramsPerKWh: 40, // Mix hydraulique et nucléaire très bas carbone
    defaultVatRate: 0.081, // TVA suisse à 8,1%
    vatRuleLabel: 'TVA suisse à 8,1% (déductible des impôts cantonaux)',
    subsidyName: 'Rétribution Unique Pronovo (PRU pour installations ≤ 30 kW)',
    subsidyAuthority: 'Pronovo AG / Office Fédéral de l’Énergie (OFEN)',
    subsidyDescription:
      'Subvention fédérale suisse : contribution fixe de base de 380 CHF + 360 CHF par kWc installé.',
    gridOperatorName: 'Gestionnaire de Réseau local (Romande Energie, BKW, SIG, CKW)',
    complianceCertificateName: 'Rapport de Sécurité (RS) & Protocole d’essais OIBT',
    installerCertificationName: 'Installateur-électricien diplômé / Concessionnaire OIBT',
    contractTypeName: 'Convention de reprise d’énergie solaire du gestionnaire local',
    regulatoryHighlights: [
      'Procédure simplifiée : simple annonce communale de construction (art. 18a LAT) au lieu d’un permis lourd.',
      'Rétribution unique PRU financée par la Confédération suisse couvrant jusqu’à 25% du coût d’installation.',
      'Déductibilité fiscale intégrale des coûts d’investissement PV dans la plupart des cantons.',
      'Obligation légale pour les GRD suisses de reprendre le surplus injecté à un tarif régulé.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Annonce d’Installation aux Services Communaux',
        authority: 'Service technique de la commune (Art. 18a LAT)',
        delayWeeks: '2 à 3 semaines',
        mandatory: true,
        costEstimate: 'Gratuit / Taxes légères',
        description:
          'Dépôt du formulaire cantonal d’annonce solaire. Si le projet est conforme aux critères de toiture, aucune autorisation formelle n’est requise.',
      },
      {
        step: 2,
        title: 'Demande de Raccordement Technique (DRT)',
        authority: 'Gestionnaire de Réseau de Distribution (GRD)',
        delayWeeks: '3 à 4 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Accord technique du distributeur d’électricité local pour autoriser l’injection sur la boucle basse tension.',
      },
      {
        step: 3,
        title: 'Contrôle Indépendant OIBT',
        authority: 'Organe de contrôle indépendant agréé OIBT',
        delayWeeks: '1 à 2 semaines',
        mandatory: true,
        costEstimate: 'Env. 350 CHF',
        description:
          'Inspection obligatoire par un contrôleur indépendant pour délivrer le Rapport de Sécurité (RS) officiel.',
      },
      {
        step: 4,
        title: 'Demande de Subvention Pronovo',
        authority: 'Pronovo AG',
        delayWeeks: '4 à 8 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Saisie du dossier d’achèvement pour le versement direct de la Rétribution Unique pour petite installation (PRU).',
      },
    ],
  },

  ES: {
    code: 'ES',
    name: 'Espagne',
    flag: '🇪🇸',
    currency: {
      symbol: '€',
      code: 'EUR',
      position: 'after',
    },
    defaultElectricityPricePerKWh: 0.22,
    defaultFeedInTariffPerKWh: 0.085,
    gridCarbonIntensityGramsPerKWh: 140,
    defaultVatRate: 0.21,
    vatRuleLabel: 'TVA à 21% (ou 10% pour rénovation de logement principal)',
    subsidyName: 'Bonificación IBI municipal & Deducción IRPF (RD 244/2019)',
    subsidyAuthority: 'Ayuntamientos & Agencia Tributaria (Hacienda)',
    subsidyDescription:
      'Réduction de l’impôt foncier (IBI) de 30% à 50% sur 3 à 5 ans selon la commune, et déduction fiscale IRPF jusqu’à 40%.',
    gridOperatorName: 'i-DE (Iberdrola) / e-distribución (Endesa) / UFD (Naturgy)',
    complianceCertificateName: 'Certificado de Instalación Eléctrica (CIE / Boletín Eléctrico)',
    installerCertificationName: 'Instalador Autorizado en Baja Tensión (IBTE)',
    contractTypeName: 'Compensación simplificada de excedentes (Facturación neta mensual)',
    regulatoryHighlights: [
      'Régime de l’Autoconsumo RD 244/2019 : compensation simplifiée directement sur la facture électrique.',
      'Gisement solaire exceptionnel en Péninsule Ibérique (1 500 à 1 900 kWh/kWc/an).',
      'Démarche municipale simplifiée via Déclaration Responsable (Declaración Responsable de Obra).',
      'Exonération de taxe sur les constructions (ICIO) jusqu’à 95% dans de nombreuses communes.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Declaración Responsable de Obra',
        authority: 'Ayuntamiento (Mairie espagnole)',
        delayWeeks: '1 à 2 semaines',
        mandatory: true,
        costEstimate: 'Taxe ICIO réduite',
        description:
          'Déclaration préalable auprès de la mairie autorisant le début immédiat des travaux de pose.',
      },
      {
        step: 2,
        title: 'Certificado CIE (Boletín Eléctrico)',
        authority: 'Instalador Autorizado & Industria de la Comunidad',
        delayWeeks: '1 semaine',
        mandatory: true,
        costEstimate: 'Inclus dans devis',
        description:
          'Émission du certificat de conformité de basse tension et enregistrement auprès de la délégation d’industrie.',
      },
      {
        step: 3,
        title: 'Inscription au Registre d’Autoconsommation',
        authority: 'Comunidad Autónoma (Industria)',
        delayWeeks: '2 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Transmission automatique au gestionnaire de réseau pour lier l’installation au code CUPS.',
      },
      {
        step: 4,
        title: 'Activation de la Compensación de Excedentes',
        authority: 'Comercializadora eléctrica (Iberdrola, Endesa, Repsol...)',
        delayWeeks: '2 à 3 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Déduction automatique de la valeur du surplus injecté sur vos factures mensuelles d’électricité.',
      },
    ],
  },

  DE: {
    code: 'DE',
    name: 'Allemagne',
    flag: '🇩🇪',
    currency: {
      symbol: '€',
      code: 'EUR',
      position: 'after',
    },
    defaultElectricityPricePerKWh: 0.38, // Prix de l'électricité parmi les plus élevés d'Europe
    defaultFeedInTariffPerKWh: 0.082, // EEG Vergütung für Teileinspeisung
    gridCarbonIntensityGramsPerKWh: 380, // Mix allemand
    defaultVatRate: 0.0, // 0% Mehrwertsteuer (TVA 0% depuis 2023 pour le solaire résidentiel)
    vatRuleLabel: '0% TVA (Nullsteuersatz gem. § 12 Abs. 3 UStG)',
    subsidyName: 'EEG-Einspeisevergütung & Exonération totale de TVA (0% MwSt)',
    subsidyAuthority: 'Bundesnetzagentur / EEG (Erneuerbare-Energien-Gesetz)',
    subsidyDescription:
      'TVA à 0% sur le matériel et la pose résidentielle + tarif légal garanti 20 ans par la loi EEG.',
    gridOperatorName: 'Örtlicher Verteilnetzbetreiber (VNB : Westnetz, Bayernwerk, Netze BW...)',
    complianceCertificateName: 'Inbetriebnahmeprotokoll E.8 VDE-AR-N 4105',
    installerCertificationName: 'Eingetragener Elektro-Fachbetrieb Photovoltaik',
    contractTypeName: 'EEG-Vergütungsvertrag mit dem Netzbetreiber (20 Jahre)',
    regulatoryHighlights: [
      'TVA à 0% : économie immédiate de 19% sur l’ensemble de la facture (matériel et main-d’œuvre).',
      'Inscription obligatoire auprès du Registre fédéral Marktstammdatenregister (MaStR).',
      'Le prix élevé de l’électricité réseau (~0,38 €) rend l’autoconsommation particulièrement rentable.',
      'Raccordement standardisé selon la norme VDE-AR-N 4105.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Netzanschlussbegehren (NAB)',
        authority: 'Verteilnetzbetreiber (VNB)',
        delayWeeks: '2 à 4 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Demande préalable auprès du gestionnaire de réseau local pour vérifier la capacité d’injection.',
      },
      {
        step: 2,
        title: 'Inbetriebnahme durch Elektrofachkraft',
        authority: 'Électricien agréé (Innung)',
        delayWeeks: '1 semaine',
        mandatory: true,
        costEstimate: 'Inclus dans devis',
        description:
          'Mise en service technique et signature du protocole E.8 conforme aux normes VDE.',
      },
      {
        step: 3,
        title: 'Registrierung im Marktstammdatenregister (MaStR)',
        authority: 'Bundesnetzagentur',
        delayWeeks: '1 semaine (dans le mois suivant la pose)',
        mandatory: true,
        costEstimate: 'Gratuit en ligne',
        description:
          'Déclaration légale indispensable sous peine de suspension de la rémunération EEG.',
      },
      {
        step: 4,
        title: 'Zählertausch & Einspeisevergütung',
        authority: 'Messstellenbetreiber & Netzbetreiber',
        delayWeeks: '2 à 4 semaines',
        mandatory: true,
        costEstimate: 'Gratuit / Taxe annuelle de comptage',
        description:
          'Installation d’un compteur bidirectionnel moderne (mME / iMSys) et début du versement de la rente EEG.',
      },
    ],
  },

  GB: {
    code: 'GB',
    name: 'Royaume-Uni',
    flag: '🇬🇧',
    currency: {
      symbol: '£',
      code: 'GBP',
      position: 'before',
    },
    defaultElectricityPricePerKWh: 0.28,
    defaultFeedInTariffPerKWh: 0.08,
    gridCarbonIntensityGramsPerKWh: 200,
    defaultVatRate: 0.0, // 0% VAT on solar panels in the UK
    vatRuleLabel: '0% VAT relief on solar panels and batteries',
    subsidyName: 'Smart Export Guarantee (SEG) & 0% VAT Relief',
    subsidyAuthority: 'Ofgem / Department for Energy Security and Net Zero',
    subsidyDescription:
      '0% VAT rate on residential solar installations + export payments from licensed energy suppliers under SEG.',
    gridOperatorName: 'Distribution Network Operator (National Grid, UK Power Networks, SP Networks)',
    complianceCertificateName: 'MCS Certificate & Electrical Installation Certificate (BS 7671)',
    installerCertificationName: 'MCS (Microgeneration Certification Scheme) Certified Installer',
    contractTypeName: 'Smart Export Guarantee (SEG) Export Contract',
    regulatoryHighlights: [
      '0% VAT on purchase and installation of solar panels and domestic batteries.',
      'Permitted Development Rights allow roof-mounted solar installations without planning permission for most homes.',
      'MCS certification is mandatory to qualify for the Smart Export Guarantee export tariff.',
      'Fast-track G98 notification process for systems up to 3.68 kW single-phase.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Permitted Development Confirmation',
        authority: 'Local Planning Authority (LPA)',
        delayWeeks: '1 week',
        mandatory: false,
        costEstimate: 'Free for standard homes',
        description:
          'Most installations are Permitted Development unless the building is Listed or located in a Conservation Area.',
      },
      {
        step: 2,
        title: 'DNO Notification (Form G98 / G99)',
        authority: 'Distribution Network Operator (DNO)',
        delayWeeks: 'Within 28 days of commissioning',
        mandatory: true,
        costEstimate: 'Free for systems ≤ 3.68 kW',
        description:
          'Notification to the regional electricity distributor to confirm grid connection compliance.',
      },
      {
        step: 3,
        title: 'MCS Certification Issuance',
        authority: 'MCS (Microgeneration Certification Scheme)',
        delayWeeks: '1 to 2 weeks',
        mandatory: true,
        costEstimate: 'Included in installer quote',
        description:
          'Official certificate of compliance validating installer quality and equipment standards.',
      },
      {
        step: 4,
        title: 'SEG Tariff Registration',
        authority: 'Licensed Energy Supplier (Octopus, British Gas, OVO...)',
        delayWeeks: '2 to 4 weeks',
        mandatory: true,
        costEstimate: 'Free',
        description:
          'Signing of the export tariff contract to receive direct payments for exported electricity.',
      },
    ],
  },

  IT: {
    code: 'IT',
    name: 'Italie',
    flag: '🇮🇹',
    currency: {
      symbol: '€',
      code: 'EUR',
      position: 'after',
    },
    defaultElectricityPricePerKWh: 0.29,
    defaultFeedInTariffPerKWh: 0.1,
    gridCarbonIntensityGramsPerKWh: 230,
    defaultVatRate: 0.1, // IVA agevolata 10%
    vatRuleLabel: 'IVA agevolata al 10% (Detrazione fiscale 50% su 10 anni)',
    subsidyName: 'Detrazione Fiscale 50% (Bonus Ristrutturazioni Casa)',
    subsidyAuthority: 'Agenzia delle Entrate & GSE (Gestore Servizi Energetici)',
    subsidyDescription:
      'Déduction fiscale de 50% du coût de l’installation étalée sur 10 ans sur la déclaration de revenus IRPEF.',
    gridOperatorName: 'e-distribuzione / Areti / Unareti',
    complianceCertificateName: 'Dichiarazione di Conformità (DiCo ex D.M. 37/2008)',
    installerCertificationName: 'Abilitazione D.M. 37/08 & Patentino FER (Fonti Energetiche Rinnovabili)',
    contractTypeName: 'Convenzione Ritiro Dedicato (RID) o Scambio sul Posto (GSE)',
    regulatoryHighlights: [
      'Régime d’Edilizia Libera : aucune autorisation municipale lourde requise pour les toits résidentiels ordinaires.',
      'Déduction fiscale de 50% très puissante réduisant de moitié le coût net de l’installation.',
      'Contrat de rachat et gestion assurée par le GSE (Gestore dei Servizi Energetici).',
      'Ensoleillement très généreux particulièrement dans le centre et le sud de l’Italie.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Modello Unico / Comunicazione Comunale',
        authority: 'Comune (Sportello Unico Edilizia)',
        delayWeeks: '1 à 2 semaines',
        mandatory: true,
        costEstimate: 'Gratuit (Edilizia Libera)',
        description:
          'Transmission du Modello Unico pour les installations photovoltaïques simples sur toiture.',
      },
      {
        step: 2,
        title: 'Connessione e Contatore di Produzione',
        authority: 'Distributore Locale (e-distribuzione)',
        delayWeeks: '3 à 5 semaines',
        mandatory: true,
        costEstimate: 'Frais de raccordement réglementés ARERA',
        description:
          'Vérification de la ligne électrique et programmation du compteur de production bidirectionnel.',
      },
      {
        step: 3,
        title: 'Rilascio Dichiarazione di Conformità (DiCo)',
        authority: 'Installatore abilitato D.M. 37/08',
        delayWeeks: '1 semaine',
        mandatory: true,
        costEstimate: 'Inclus dans le devis',
        description:
          'Attestation légale certifiant la parfaite conformité des raccordements électriques aux normes CEI.',
      },
      {
        step: 4,
        title: 'Attivazione Convenzione GSE',
        authority: 'GSE (Gestore Servizi Energetici)',
        delayWeeks: '4 à 6 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Activation du compte GSE pour la valorisation du surplus (Ritiro Dedicato RID).',
      },
    ],
  },

  CA: {
    code: 'CA',
    name: 'Canada (Québec)',
    flag: '🇨🇦',
    currency: {
      symbol: '$ CAD',
      code: 'CAD',
      position: 'after',
    },
    defaultElectricityPricePerKWh: 0.085, // Tarif D résidentiel Hydro-Québec très avantageux
    defaultFeedInTariffPerKWh: 0.085, // Mesurage net : compensation à parité 1 pour 1 en kWh
    gridCarbonIntensityGramsPerKWh: 30, // Hydroélectricité propre à 99%
    defaultVatRate: 0.14975, // TPS 5% + TVQ 9.975%
    vatRuleLabel: 'TPS (5%) + TVQ (9,975%)',
    subsidyName: 'Programme LogisVert Hydro-Québec & Subventions Climat',
    subsidyAuthority: 'Hydro-Québec / Transition Énergétique Québec',
    subsidyDescription:
      'Aide financière jusqu’à 1 000 $ CAD par kWc installé pour favoriser l’autoproduction résidentielle.',
    gridOperatorName: 'Hydro-Québec',
    complianceCertificateName: 'Déclaration de conformité aux normes CSA / Code de construction du Québec',
    installerCertificationName: 'Maître électricien membre de la CMEQ (Licence RBQ)',
    contractTypeName: 'Option de Mesurage Net (Option G d’Hydro-Québec)',
    regulatoryHighlights: [
      'Option de Mesurage Net : tout surplus d’électricité est accumulé sous forme de crédits en kWh valables jusqu’à 24 mois.',
      'Énergie réseau extrêmement propre (30 g CO2/kWh grâce aux barrages hydroélectriques).',
      'Travaux obligatoirement exécutés par un maître électricien certifié CMEQ et titulaire d’une licence RBQ valide.',
      'Résistance accrue au gel et aux charges de neige requise pour les fixations de toit.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Permis Municipal de Rénovation',
        authority: 'Municipalité / Ville (Service de l’Urbanisme)',
        delayWeeks: '2 à 3 semaines',
        mandatory: true,
        costEstimate: '50 à 150 $ CAD selon municipalité',
        description:
          'Validation architecturale et conformité aux règlements municipaux d’aménagement.',
      },
      {
        step: 2,
        title: 'Demande d’Option de Mesurage Net',
        authority: 'Hydro-Québec (Guichet Autoproduction)',
        delayWeeks: '4 à 6 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Approbation technique du plan de raccordement pour autoriser l’injection bidirectionnelle.',
      },
      {
        step: 3,
        title: 'Attestation de Maître Électricien (CMEQ)',
        authority: 'Corporation des Maîtres Électriciens du Québec',
        delayWeeks: '1 semaine',
        mandatory: true,
        costEstimate: 'Inclus dans le devis de l’entrepreneur',
        description:
          'Certification des travaux selon le Chapitre V - Électricité du Code de construction du Québec.',
      },
      {
        step: 4,
        title: 'Installation du Compteur Bidirectionnel',
        authority: 'Hydro-Québec',
        delayWeeks: '2 à 3 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Pose du compteur intelligent et activation de votre compte en mesurage net pour créditer vos surplus.',
      },
    ],
  },

  MA: {
    code: 'MA',
    name: 'Maroc',
    flag: '🇲🇦',
    currency: {
      symbol: 'DH',
      code: 'MAD',
      position: 'after',
    },
    defaultElectricityPricePerKWh: 1.25, // Tarif résidentiel moyen en Dirham marocain
    defaultFeedInTariffPerKWh: 0.65, // Dispositions d'injection Loi 82-21
    gridCarbonIntensityGramsPerKWh: 600, // Mix électrique marocain
    defaultVatRate: 0.2, // TVA marocaine à 20%
    vatRuleLabel: 'TVA marocaine standard à 20%',
    subsidyName: 'Régime d’Autoproduction (Loi 82-21) & Soutien EnR',
    subsidyAuthority: 'Ministère de la Transition Énergétique / ONEE / AMEE',
    subsidyDescription:
      'Cadre légal de la Loi 82-21 autorisant l’injection et la cession d’excédents jusqu’à 20% de la production.',
    gridOperatorName: 'ONEE (Office National de l’Électricité) / Régies autonomes (Lydec, Redal, Amendis, Radeema)',
    complianceCertificateName: 'Certificat de conformité aux normes marocaines NM 06.3',
    installerCertificationName: 'Agrément Installateur d’Efficacité Énergétique et EnR',
    contractTypeName: 'Contrat de raccordement et d’autoproduction Loi 82-21',
    regulatoryHighlights: [
      'Ensoleillement parmi les plus élevés au monde (1 800 à 2 200 kWh/kWc/an).',
      'Loi 82-21 sur l’autoproduction d’énergie électrique ouvrant l’accès au réseau basse tension.',
      'Amortissement très rapide grâce au gisement solaire intense et aux économies sur les tranches supérieures ONEE.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Déclaration Locale d’Urbanisme',
        authority: 'Commune / Agence Urbaine',
        delayWeeks: '2 semaines',
        mandatory: true,
        costEstimate: 'Frais de dossier minimes',
        description:
          'Déclaration des travaux de toiture auprès des autorités municipales compétentes.',
      },
      {
        step: 2,
        title: 'Demande de Raccordement ONEE / Régie',
        authority: 'ONEE ou Régie distributrice (Lydec, Redal, Amendis)',
        delayWeeks: '4 à 6 semaines',
        mandatory: true,
        costEstimate: 'Gratuit / Étude de faisabilité',
        description:
          'Dépôt du dossier technique pour agrément de raccordement au réseau de distribution basse tension.',
      },
      {
        step: 3,
        title: 'Contrôle Technique de Conformité',
        authority: 'Bureau de contrôle agréé',
        delayWeeks: '1 à 2 semaines',
        mandatory: true,
        costEstimate: 'Inclus dans devis',
        description:
          'Attestation de conformité des protections de découplage et des circuits électriques aux normes marocaines.',
      },
      {
        step: 4,
        title: 'Mise en Service & Compteur Bidirectionnel',
        authority: 'ONEE / Régie',
        delayWeeks: '2 à 3 semaines',
        mandatory: true,
        costEstimate: 'Frais de compteur',
        description:
          'Raccordement physique et mise sous tension avec relevé de l’autoproduction.',
      },
    ],
  },

  TN: {
    code: 'TN',
    name: 'Tunisie',
    flag: '🇹🇳',
    currency: {
      symbol: 'DT',
      code: 'TND',
      position: 'after',
      name: 'Dinar Tunisien',
      exchangeRateFromEUR: 3.35,
    },
    defaultElectricityPricePerKWh: 0.32, // Tarif moyen STEG basse tension résidentiel (Dinar Tunisien / kWh)
    defaultFeedInTariffPerKWh: 0.20, // Tarif de valorisation / compensation nette STEG (Net-Metering)
    gridCarbonIntensityGramsPerKWh: 460, // Mix électrique national à dominante thermique gaz naturel
    defaultVatRate: 0.07, // TVA réduite à 7% pour les équipements d'énergies renouvelables (photovoltaïque)
    vatRuleLabel: 'TVA réduite à 7% pour le matériel photovoltaïque (Loi de Finances)',
    subsidyName: 'Programme PROSOL Élec (FNME / ANME & STEG)',
    subsidyAuthority: 'ANME (Agence Nationale pour la Maîtrise de l’Énergie) & STEG',
    subsidyDescription:
      'Subvention directe du FNME (500 DT/kWc plafonné à 1 500 DT) couplée à une facilité de crédit bancaire remboursable sur la facture STEG.',
    gridOperatorName: 'STEG (Société Tunisienne de l’Électricité et du Gaz)',
    complianceCertificateName: 'Attestation de réception technique & essai de découplage STEG',
    installerCertificationName: 'Installateur agréé ANME (Éligibilité PROSOL Élec)',
    contractTypeName: 'Convention d’autoproduction BT avec Net-Metering STEG',
    regulatoryHighlights: [
      'Loi n°2015-12 relative à la production d’électricité à partir des énergies renouvelables.',
      'Principe du Net-Metering : compensation de l’excédent d’énergie solaire injectée sur le réseau STEG.',
      'Programme national PROSOL Élec : prise en charge des démarches et crédit remboursé sur la facture d’électricité.',
      'Exonération et fiscalité douanière avantageuse sur les modules et onduleurs certifiés.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Dossier d’éligibilité PROSOL Élec & Accord ANME',
        authority: 'ANME (Agence Nationale pour la Maîtrise de l’Énergie)',
        delayWeeks: '2 à 3 semaines',
        mandatory: true,
        costEstimate: 'Inclus dans dossier installateur',
        description:
          'Dépôt de la demande d’adhésion au programme PROSOL Élec par l’installateur agréé auprès de l’ANME pour déblocage de la prime FNME.',
      },
      {
        step: 2,
        title: 'Étude technique & Accord de raccordement STEG',
        authority: 'District STEG local',
        delayWeeks: '3 à 5 semaines',
        mandatory: true,
        costEstimate: 'Gratuit / Frais de dossier',
        description:
          'Dépôt du schéma unifilaire et vérification de la capacité d’accueil du transformateur BT du quartier par les services techniques STEG.',
      },
      {
        step: 3,
        title: 'Installation & Contrôle de conformité de découplage',
        authority: 'Installateur agréé ANME & Bureau de contrôle',
        delayWeeks: '1 à 2 semaines',
        mandatory: true,
        costEstimate: 'Inclus dans devis',
        description:
          'Pose des panneaux, onduleur homologué et relais de protection de découplage conforme aux spécifications normatives de la STEG.',
      },
      {
        step: 4,
        title: 'Réception, pose du compteur bidirectionnel & Mise en service',
        authority: 'STEG (Société Tunisienne de l’Électricité et du Gaz)',
        delayWeeks: '2 à 4 semaines',
        mandatory: true,
        costEstimate: 'Frais de compteur STEG',
        description:
          'Contrôle technique contradictoire, pose du compteur électronique bidirectionnel et signature de la convention de raccordement.',
      },
    ],
  },

  OTHER: {
    code: 'OTHER',
    name: 'International (Standard)',
    flag: '🌐',
    currency: {
      symbol: '€',
      code: 'EUR',
      position: 'after',
    },
    defaultElectricityPricePerKWh: 0.25,
    defaultFeedInTariffPerKWh: 0.1,
    gridCarbonIntensityGramsPerKWh: 250,
    defaultVatRate: 0.2,
    vatRuleLabel: 'Taux de TVA standard (20%)',
    subsidyName: 'Subventions & Aides locales selon la législation nationale',
    subsidyAuthority: 'Autorités nationales compétentes',
    subsidyDescription:
      'Vérifiez auprès des autorités énergétiques ou de votre commune les crédits d’impôt ou primes applicables.',
    gridOperatorName: 'Gestionnaire de Réseau de Distribution local (DSO)',
    complianceCertificateName: 'Certificat de conformité électrique officiel (IEC / CE)',
    installerCertificationName: 'Installateur Photovoltaïque Agréé et Certifié',
    contractTypeName: 'Convention d’injection ou de rachat de surplus local',
    regulatoryHighlights: [
      'Respect des normes internationales CEI / IEC 62446 et exigences de sécurité électrique.',
      'Obligation générale d’accord de raccordement auprès du distributeur d’énergie local.',
      'Contrôle de sécurité des installations basse tension avant toute injection sur le réseau public.',
    ],
    administrativeSteps: [
      {
        step: 1,
        title: 'Autorisation Municipale ou Permis de Construire',
        authority: 'Service d’urbanisme local',
        delayWeeks: '2 à 4 semaines',
        mandatory: true,
        costEstimate: 'Selon législation locale',
        description:
          'Vérification des règles architecturales locales et autorisation de travaux.',
      },
      {
        step: 2,
        title: 'Accord de Raccordement au Réseau',
        authority: 'Distributeur local d’électricité',
        delayWeeks: '3 à 6 semaines',
        mandatory: true,
        costEstimate: 'Selon grille du distributeur',
        description:
          'Demande d’accès au réseau et validation des relais de découplage de sécurité.',
      },
      {
        step: 3,
        title: 'Inspection et Certification Électrique',
        authority: 'Organisme de contrôle accrédité',
        delayWeeks: '1 à 2 semaines',
        mandatory: true,
        costEstimate: 'Variable',
        description:
          'Contrôle de conformité de l’installation électrique par un inspecteur habilité.',
      },
      {
        step: 4,
        title: 'Activation du Contrat d’Énergie',
        authority: 'Fournisseur d’énergie',
        delayWeeks: '2 à 3 semaines',
        mandatory: true,
        costEstimate: 'Gratuit',
        description:
          'Signature de la convention de rachat ou de compensation nette de vos excédents solaires.',
      },
    ],
  },
};

/**
 * Récupère le profil de pays à partir du code pays ou du nom
 */
export function getCountryProfile(codeOrName?: string): CountryProfile {
  if (!codeOrName) return COUNTRIES.FR;
  const upper = codeOrName.trim().toUpperCase();

  if (COUNTRIES[upper]) {
    return COUNTRIES[upper];
  }

  // Recherche par nom
  for (const country of Object.values(COUNTRIES)) {
    if (
      country.name.toUpperCase().includes(upper) ||
      upper.includes(country.name.toUpperCase()) ||
      country.code === upper
    ) {
      return country;
    }
  }

  return COUNTRIES.FR;
}

/**
 * Détecte le pays à partir de coordonnées GPS ou des résultats de géocodage Google Maps
 */
export function detectCountryFromLocation(
  lat: number,
  lng: number,
  addressComponents?: Array<{ types: string[]; short_name: string; long_name: string }>
): CountryProfile {
  // 1. Vérification dans les composants d'adresse Google Maps (le plus précis)
  if (addressComponents && addressComponents.length > 0) {
    for (const comp of addressComponents) {
      if (comp.types.includes('country')) {
        const countryCode = comp.short_name.toUpperCase();
        if (COUNTRIES[countryCode]) {
          return COUNTRIES[countryCode];
        }
      }
    }
  }

  // 2. Heuristique par coordonnées GPS (Europe & voisinage)
  // Suisse : 45.8 <= lat <= 47.8 && 5.9 <= lng <= 10.5
  if (lat >= 45.8 && lat <= 47.85 && lng >= 5.95 && lng <= 10.5) {
    return COUNTRIES.CH;
  }
  // Belgique : 49.5 <= lat <= 51.55 && 2.5 <= lng <= 6.45
  if (lat >= 49.5 && lat <= 51.55 && lng >= 2.55 && lng <= 6.45) {
    return COUNTRIES.BE;
  }
  // Espagne : 35.9 <= lat <= 43.8 && -9.3 <= lng <= 3.3
  if (lat >= 35.9 && lat <= 43.8 && lng >= -9.3 && lng <= 3.3) {
    return COUNTRIES.ES;
  }
  // Allemagne : 47.25 <= lat <= 55.1 && 5.85 <= lng <= 15.1
  if (lat >= 47.25 && lat <= 55.1 && lng >= 5.85 && lng <= 15.1) {
    return COUNTRIES.DE;
  }
  // Royaume-Uni : 49.9 <= lat <= 60.9 && -8.6 <= lng <= 1.8
  if (lat >= 49.9 && lat <= 60.9 && lng >= -8.6 && lng <= 1.8) {
    return COUNTRIES.GB;
  }
  // Italie : 36.6 <= lat <= 47.1 && 6.6 <= lng <= 18.5
  if (lat >= 36.6 && lat <= 47.1 && lng >= 6.6 && lng <= 18.5) {
    return COUNTRIES.IT;
  }
  // Maroc : 21.0 <= lat <= 36.0 && -17.0 <= lng <= -1.0
  if (lat >= 21.0 && lat <= 36.0 && lng >= -17.0 && lng <= -1.0) {
    return COUNTRIES.MA;
  }
  // Tunisie : 30.0 <= lat <= 37.6 && 7.4 <= lng <= 11.8
  if (lat >= 30.0 && lat <= 37.6 && lng >= 7.4 && lng <= 11.8) {
    return COUNTRIES.TN;
  }
  // Canada (est / Québec) : 44.5 <= lat <= 62.0 && -80.0 <= lng <= -57.0
  if (lat >= 44.5 && lat <= 62.0 && lng >= -80.0 && lng <= -57.0) {
    return COUNTRIES.CA;
  }
  // France métropolitaine & Corse : 41.3 <= lat <= 51.1 && -5.2 <= lng <= 9.6
  if (lat >= 41.3 && lat <= 51.1 && lng >= -5.2 && lng <= 9.6) {
    return COUNTRIES.FR;
  }

  // Par défaut : France
  return COUNTRIES.FR;
}

/**
 * Formate un montant monétaire en fonction du pays et de la devise
 */
export function formatMoney(
  amount: number,
  currencyOrSymbol: string | { symbol: string; position?: 'before' | 'after' } = '€',
  positionOverride?: 'before' | 'after',
  decimals: number = 0
): string {
  const symbol = typeof currencyOrSymbol === 'string' ? currencyOrSymbol : (currencyOrSymbol?.symbol || '€');
  const position = positionOverride || (typeof currencyOrSymbol === 'object' ? currencyOrSymbol.position : 'after') || 'after';

  const formattedNumber = Math.round(amount).toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (position === 'before') {
    return `${symbol}${formattedNumber}`;
  }
  return `${formattedNumber} ${symbol}`;
}

/**
 * Calcule le taux de TVA applicable selon le pays et la puissance
 */
export function calculateVatRateForCountry(countryCode: string, systemPowerKWp: number): number {
  const profile = COUNTRIES[countryCode] || COUNTRIES.FR;
  if (countryCode === 'FR') {
    return systemPowerKWp <= 3 ? 0.1 : 0.2;
  }
  if (countryCode === 'DE') {
    return 0.0; // 0% Mehrwertsteuer en Allemagne
  }
  if (countryCode === 'GB') {
    return 0.0; // 0% VAT au Royaume-Uni
  }
  if (countryCode === 'CH') {
    return 0.081; // 8.1% TVA Suisse
  }
  if (countryCode === 'BE') {
    return 0.06; // 6% pour habitations
  }
  if (countryCode === 'TN') {
    return 0.07; // 7% TVA réduite sur les équipements photovoltaïques
  }
  return profile.defaultVatRate;
}

/**
 * Calcule les subventions officielles applicables selon le pays et la puissance
 */
export function calculateCountrySubsidies(
  countryCode: string,
  systemPowerKWp: number
): { id: string; label: string; amount: number; description: string; authority: string }[] {
  const subsidies: { id: string; label: string; amount: number; description: string; authority: string }[] = [];

  if (countryCode === 'FR') {
    let grantPerKWp = 0;
    if (systemPowerKWp <= 3) grantPerKWp = 300;
    else if (systemPowerKWp <= 9) grantPerKWp = 230;
    else if (systemPowerKWp <= 36) grantPerKWp = 160;

    const total = Math.round(systemPowerKWp * grantPerKWp);
    if (total > 0) {
      subsidies.push({
        id: 'fr_prime_autoconsommation',
        label: "Prime à l'autoconsommation de l'État (Arrêté S21)",
        amount: total,
        description: `${grantPerKWp} € / kWc versés pour une puissance de ${systemPowerKWp} kWc.`,
        authority: 'EDF OA / Ministère de la Transition Écologique',
      });
    }
  } else if (countryCode === 'CH') {
    // Rétribution unique Pronovo (PRU) : base fixe ~380 CHF + ~360 CHF/kWc
    const baseAmount = 380;
    const powerAmount = Math.round(systemPowerKWp * 360);
    const total = baseAmount + powerAmount;
    subsidies.push({
      id: 'ch_pronovo_pru',
      label: 'Rétribution Unique Pronovo (PRU)',
      amount: total,
      description: `Contribution de base de 380 CHF + 360 CHF/kWc (${powerAmount} CHF) versée directement par la Confédération.`,
      authority: 'Pronovo AG / Office Fédéral de l’Énergie',
    });
  } else if (countryCode === 'BE') {
    // Prime régionale (ex: Fluvius en Flandre ou soutien régional)
    const total = Math.round(Math.min(750, systemPowerKWp * 150));
    if (total > 0) {
      subsidies.push({
        id: 'be_regional_grant',
        label: 'Prime régionale au raccordement solaire',
        amount: total,
        description:
          'Prime accordée pour l’installation de panneaux solaires avec compteur communicant agréé.',
        authority: 'Gestionnaire régional (Fluvius / SPW)',
      });
    }
  } else if (countryCode === 'ES') {
    // Bonification IBI municipale estimée (moyenne 40% sur 3 ans d'une taxe foncière ~600 €)
    const total = 720;
    subsidies.push({
      id: 'es_ibi_bonificacion',
      label: 'Bonificación IBI Municipal (Impôt Foncier)',
      amount: total,
      description:
        'Réduction d’impôt foncier de 30% à 50% accordée par la plupart des mairies espagnoles (env. 240 €/an sur 3 ans).',
      authority: 'Ayuntamiento / Hacienda Local',
    });
  } else if (countryCode === 'DE') {
    // En Allemagne, la subvention majeure est la TVA à 0% (déjà déduite)
    subsidies.push({
      id: 'de_eeg_benefit',
      label: 'Avantage fiscal fédéral TVA 0% (Nullsteuersatz)',
      amount: 0,
      description:
        'Économie immédiate de 19% de TVA appliquée directement sur l’ensemble du matériel et de la main-d’œuvre (loi EEG 2023).',
      authority: 'Finanzamt / Bundesfinanzministerium',
    });
  } else if (countryCode === 'CA') {
    // Programme LogisVert Hydro-Québec : jusqu'à 800 $ CAD/kWc
    const total = Math.round(systemPowerKWp * 450);
    subsidies.push({
      id: 'ca_logisvert',
      label: 'Subvention Programme LogisVert Hydro-Québec',
      amount: total,
      description:
        'Aide financière provinciale versée pour soutenir l’autoproduction résidentielle au Québec.',
      authority: 'Hydro-Québec / ÉcoPerformance',
    });
  } else if (countryCode === 'TN') {
    // Programme PROSOL Élec ANME : 500 DT/kWc plafonné à 1 500 DT
    const total = Math.min(1500, Math.round(systemPowerKWp * 500));
    if (total > 0) {
      subsidies.push({
        id: 'tn_prosol_elec',
        label: 'Prime Programme PROSOL Élec (FNME / ANME)',
        amount: total,
        description: `Subvention officielle du Fonds National de Maîtrise de l'Énergie (500 DT/kWc, max 1 500 DT) pour ${systemPowerKWp} kWc installés.`,
        authority: 'ANME (Agence Nationale pour la Maîtrise de l’Énergie)',
      });
    }
  }

  return subsidies;
}

/**
 * Génère une décomposition détaillée poste par poste des coûts d'installation (« Volet Coûts »)
 */
export function generateInstallationCostBreakdown(
  config: SolarConfig,
  countryProfile: CountryProfile
): InstallationCostBreakdown {
  const kwp = config.systemPowerKWp;
  const panelsCount = Math.max(1, Math.round((kwp * 1000) / config.panelWattage));
  const isMicro = config.inverterType === 'micro';
  const customCost = config.customInstallationCost;

  // Calcul du taux de TVA applicable
  const vatRate =
    config.customVatRate !== null && config.customVatRate !== undefined
      ? config.customVatRate
      : calculateVatRateForCountry(countryProfile.code, kwp);

  // Prix unitaires standards du marché certifié HT (en € ou équivalent devise locale)
  // Facteur de parité locale (Suisse a des coûts de main d'œuvre un peu plus élevés en CHF, Maroc en DH)
  let currencyScale = 1.0;
  if (countryProfile.code === 'CH') currencyScale = 1.15; // en CHF
  if (countryProfile.code === 'MA') currencyScale = 10.5; // en DH
  if (countryProfile.code === 'TN') currencyScale = 2.45; // en DT (Dinar Tunisien)
  if (countryProfile.code === 'CA') currencyScale = 1.45; // en $ CAD
  if (countryProfile.code === 'GB') currencyScale = 0.86; // en £

  // Coefficient technologique des panneaux
  let techMultiplier = 1.05; // TOPCon par défaut
  let techLabel = 'N-Type TOPCon demi-cellules';
  let techDesc = 'modules photovoltaïques haute performance N-Type TOPCon';
  if (config.panelTechnology === 'hjt') {
    techMultiplier = 1.22;
    techLabel = 'HJT Hétérojonction Bi-verre';
    techDesc = 'modules photovoltaïques ultra-haute performance HJT Hétérojonction';
  } else if (config.panelTechnology === 'mono_perc') {
    techMultiplier = 0.95;
    techLabel = 'Monocristallin PERC standard';
    techDesc = 'modules photovoltaïques monocristallins PERC éprouvés';
  } else if (config.panelTechnology === 'poly') {
    techMultiplier = 0.78;
    techLabel = 'Polycristallin classique';
    techDesc = 'modules solaires polycristallins économiques';
  }

  // Option Bifaciale (+7% coût verre-verre trempé)
  const bifacialMultiplier = config.isBifacial ? 1.08 : 1.0;
  const wattageRatio = Math.max(0.85, Math.min(1.25, (config.panelWattage || 430) / 430));

  const panelUnitPriceHT = Math.round(145 * currencyScale * techMultiplier * bifacialMultiplier * wattageRatio);
  const microInverterUnitPriceHT = Math.round(155 * currencyScale);
  const centralInverterPriceHT = Math.round((950 + kwp * 85) * currencyScale);
  const mountingUnitPriceHT = Math.round(48 * currencyScale);
  const electricalBoxPriceHT = Math.round(420 * currencyScale);
  const wiringAndGroundPriceHT = Math.round((180 + kwp * 25) * currencyScale);
  const laborRoofingPriceHT = Math.round((1100 + kwp * 160) * currencyScale);
  const laborElectricalPriceHT = Math.round((750 + kwp * 80) * currencyScale);
  const administrativeAndCompliancePriceHT = Math.round(380 * currencyScale);

  const items: CostPostItem[] = [];

  // 1. Modules Photovoltaïques
  const totalPanelsHT = panelsCount * panelUnitPriceHT;
  items.push({
    id: 'post_panels',
    category: 'panels',
    label: `Modules solaires ${techLabel}${config.isBifacial ? ' Bifaciaux' : ''} (${config.panelWattage} Wc)`,
    description: `${panelsCount} ${techDesc}${config.isBifacial ? ' à captation bifaciale recto-verso (gain albédo toiture/sol)' : ''} (Garantie 25-30 ans).`,
    quantity: panelsCount,
    unit: 'panneaux',
    unitPriceHT: panelUnitPriceHT,
    totalHT: totalPanelsHT,
  });

  // 2. Onduleur ou Micro-onduleurs
  if (config.inverterType === 'micro') {
    const microCount = Math.ceil(panelsCount / 2); // Micro-onduleur duo standard (ex: Enphase IQ8 ou Hoymiles HMS)
    const totalMicroHT = microCount * microInverterUnitPriceHT * 2;
    items.push({
      id: 'post_inverters',
      category: 'inverter',
      label: 'Micro-onduleurs individuels avec passerelle de communication',
      description: `${microCount} micro-onduleurs haute fréquence avec optimisation MPPT indépendante par panneau et passerelle WiFi (garantie constructeur 25 ans).`,
      quantity: microCount,
      unit: 'unités',
      unitPriceHT: microInverterUnitPriceHT * 2,
      totalHT: totalMicroHT,
    });
  } else if (config.inverterType === 'string_opt') {
    const optPriceHT = Math.round((920 + kwp * 80 + panelsCount * 45) * currencyScale);
    items.push({
      id: 'post_inverters',
      category: 'inverter',
      label: 'Onduleur central avec optimiseurs de puissance individuels',
      description: `1 onduleur mural hybride avec ${panelsCount} optimiseurs DC/DC (ex: SolarEdge) sous chaque panneau pour monitoring individuel et atténuation des ombrages.`,
      quantity: 1,
      unit: 'ensemble',
      unitPriceHT: optPriceHT,
      totalHT: optPriceHT,
    });
  } else {
    // 'string_central' : Onduleur unique pour tous les panneaux
    const singleInverterPriceHT = Math.round((780 + kwp * 75) * currencyScale);
    items.push({
      id: 'post_inverters',
      category: 'inverter',
      label: 'Onduleur unique pour tous les panneaux (Onduleur central de chaîne)',
      description: `1 onduleur centralisé MPPT haute efficacité (ex: Fronius, SMA, Huawei, Sungrow) pour l'ensemble des ${panelsCount} panneaux câblés en série (string). Solution robuste et la plus économique.`,
      quantity: 1,
      unit: 'onduleur',
      unitPriceHT: singleInverterPriceHT,
      totalHT: singleInverterPriceHT,
    });
  }

  // 3. Système de fixation toiture
  const totalMountingHT = panelsCount * mountingUnitPriceHT;
  items.push({
    id: 'post_mounting',
    category: 'mounting',
    label: 'Structure de fixation toiture en surimposition étanche',
    description: `Rails en aluminium renforcé, crochets inoxydables réglables selon couverture (tuiles/ardoises) et abergement coupe-vent.`,
    quantity: panelsCount,
    unit: 'emplacements',
    unitPriceHT: mountingUnitPriceHT,
    totalHT: totalMountingHT,
  });

  // 4. Coffrets de protection et sécurité électrique
  items.push({
    id: 'post_electrical_boxes',
    category: 'electrical',
    label: 'Coffrets de protection DC et AC avec parafoudres',
    description: `Coffret DC (sectionneur et parafoudre Type II) + Coffret AC (disjoncteur différentiel 30mA, parafoudre réseau).`,
    quantity: 1,
    unit: 'ensemble',
    unitPriceHT: electricalBoxPriceHT,
    totalHT: electricalBoxPriceHT,
  });

  // 5. Câblage solaire & Terre
  items.push({
    id: 'post_wiring',
    category: 'electrical',
    label: 'Câblage solaire 6 mm² résistant UV & liaison équipotentielle',
    description: `Câbles solaires double isolation H1Z2Z2-K 6mm², connecteurs MC4 étanches IP68, piquet de terre et câblette cuivre.`,
    quantity: 1,
    unit: 'lot',
    unitPriceHT: wiringAndGroundPriceHT,
    totalHT: wiringAndGroundPriceHT,
  });

  // 6. Main d'œuvre couverture & pose toiture
  items.push({
    id: 'post_labor_roof',
    category: 'labor',
    label: `Pose en toiture par couvreurs certifiés (${countryProfile.installerCertificationName})`,
    description: `Sécurisation du chantier (échafaudage, harnais), fixation des crochets de toit, pose des rails et câblage des modules.`,
    quantity: 1,
    unit: 'chantier',
    unitPriceHT: laborRoofingPriceHT,
    totalHT: laborRoofingPriceHT,
  });

  // 7. Raccordement électrique & mise en service
  items.push({
    id: 'post_labor_electric',
    category: 'labor',
    label: `Raccordement au tableau électrique par électricien certifié`,
    description: `Cheminement des câbles vers le TGBT, pose des coffrets, raccordement au disjoncteur général, paramétrage de l’application.`,
    quantity: 1,
    unit: 'forfait',
    unitPriceHT: laborElectricalPriceHT,
    totalHT: laborElectricalPriceHT,
  });

  // 8. Démarches administratives & Contrôle officiel
  items.push({
    id: 'post_admin',
    category: 'administrative',
    label: `Dossier administratif & Contrôle de conformité (${countryProfile.complianceCertificateName})`,
    description: `Déclaration préalable d’urbanisme, dossier de raccordement réseau et obtention du visa de conformité officiel.`,
    quantity: 1,
    unit: 'dossier',
    unitPriceHT: administrativeAndCompliancePriceHT,
    totalHT: administrativeAndCompliancePriceHT,
  });

  // Options : Routeur solaire chauffe-eau
  if (config.hasSolarRouter) {
    const routerPriceHT = Math.round(410 * currencyScale);
    items.push({
      id: 'post_opt_router',
      category: 'options',
      label: 'Routeur solaire d’eau chaude sanitaire (Zéro injection)',
      description: `Boîtier électronique modulant la puissance envoyée vers la résistance du ballon selon le surplus solaire instantané.`,
      quantity: 1,
      unit: 'appareil',
      unitPriceHT: routerPriceHT,
      totalHT: routerPriceHT,
      isOptional: true,
    });
  }

  // Options : Batterie de stockage
  if (config.batteryCapacityKWh > 0) {
    const batteryUnitPriceHT = Math.round(590 * currencyScale);
    const totalBatteryHT = config.batteryCapacityKWh * batteryUnitPriceHT;
    items.push({
      id: 'post_opt_battery',
      category: 'options',
      label: `Batterie de stockage Lithium Fer Phosphate (${config.batteryCapacityKWh} kWh)`,
      description: `Module batterie LFP sécurisé haute durée de vie (> 6 000 cycles) avec système de gestion BMS et armoire de sécurité.`,
      quantity: config.batteryCapacityKWh,
      unit: 'kWh',
      unitPriceHT: batteryUnitPriceHT,
      totalHT: totalBatteryHT,
      isOptional: true,
    });
  }

  // Calcul des sous-totaux
  let totalEquipmentHT = 0;
  let totalLaborHT = 0;
  let totalAdministrativeHT = 0;
  let totalOptionsHT = 0;

  for (const item of items) {
    if (item.category === 'panels' || item.category === 'inverter' || item.category === 'mounting' || item.category === 'electrical') {
      totalEquipmentHT += item.totalHT;
    } else if (item.category === 'labor') {
      totalLaborHT += item.totalHT;
    } else if (item.category === 'administrative') {
      totalAdministrativeHT += item.totalHT;
    } else if (item.category === 'options') {
      totalOptionsHT += item.totalHT;
    }
  }

  let totalHT = totalEquipmentHT + totalLaborHT + totalAdministrativeHT + totalOptionsHT;

  // Si l'utilisateur a saisi un devis personnalisé global, on ajuste proportionnellement
  if (customCost !== null && customCost > 0) {
    const targetTTC = customCost;
    const targetHT = Math.round(targetTTC / (1 + vatRate));
    const factor = totalHT > 0 ? targetHT / totalHT : 1;

    for (const item of items) {
      item.unitPriceHT = Math.round(item.unitPriceHT * factor);
      item.totalHT = Math.round(item.unitPriceHT * item.quantity);
    }
    totalEquipmentHT = Math.round(totalEquipmentHT * factor);
    totalLaborHT = Math.round(totalLaborHT * factor);
    totalAdministrativeHT = Math.round(totalAdministrativeHT * factor);
    totalOptionsHT = Math.round(totalOptionsHT * factor);
    totalHT = targetHT;
  }

  const vatAmount = Math.round(totalHT * vatRate);
  const totalTTC = totalHT + vatAmount;

  // Subventions applicables selon le pays ou saisies par l'utilisateur
  let subsidies = calculateCountrySubsidies(countryProfile.code, kwp);
  if (config.customSubsidiesMode === 'none') {
    subsidies = [];
  } else if (
    config.customSubsidiesMode === 'custom' &&
    config.customSubsidiesAmount !== null &&
    config.customSubsidiesAmount !== undefined
  ) {
    subsidies = [
      {
        id: 'custom_subsidy',
        label: 'Aide financière personnalisée (facture ou subvention locale)',
        amount: Math.round(config.customSubsidiesAmount),
        description: `Montant d'aide personnalisé saisi selon votre facture ou vos aides locales réelles (${formatMoney(config.customSubsidiesAmount, countryProfile.currency)}).`,
        authority: 'Personnalisée par l’utilisateur',
      },
    ];
  }

  const totalSubsidies = subsidies.reduce((acc, s) => acc + s.amount, 0);
  const netCostAfterSubsidies = Math.max(0, totalTTC - totalSubsidies);

  const pricePerWpTTC = Math.round((totalTTC / (kwp * 1000)) * 100) / 100;

  return {
    items,
    totalEquipmentHT,
    totalLaborHT,
    totalAdministrativeHT,
    totalOptionsHT,
    totalHT,
    vatRate,
    vatAmount,
    totalTTC,
    subsidies,
    totalSubsidies,
    netCostAfterSubsidies,
    pricePerWpTTC,
  };
}
