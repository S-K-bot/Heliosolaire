import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Camera,
  Image as ImageIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Zap,
  ArrowRight,
  RotateCcw,
  RefreshCw,
  ShieldCheck,
  Check,
  Info,
} from 'lucide-react';
import { SolarConfig, CountryProfile, BillExtractionData } from '../types';

interface BillScannerCardProps {
  config: SolarConfig;
  countryProfile: CountryProfile;
  onChange: (updates: Partial<SolarConfig>) => void;
}

export const BillScannerCard: React.FC<BillScannerCardProps> = ({
  config,
  countryProfile,
  onChange,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<BillExtractionData | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [lastImagePayload, setLastImagePayload] = useState<{ base64: string; mimeType: string } | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Field selection toggles for applying
  const [applyPrice, setApplyPrice] = useState(true);
  const [applyConsumption, setApplyConsumption] = useState(true);
  const [applyBillAmount, setApplyBillAmount] = useState(true);
  const [applyVat, setApplyVat] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const parseFriendlyErrorMessage = (rawError: string): string => {
    if (!rawError) return "Une erreur inattendue est survenue. Veuillez réessayer.";
    
    // Check if error is serialized JSON
    if (rawError.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawError);
        if (parsed.error?.message) {
          return parseFriendlyErrorMessage(parsed.error.message);
        }
      } catch {
        // ignore JSON parse error
      }
    }

    if (
      rawError.includes('503') ||
      rawError.includes('high demand') ||
      rawError.includes('Spikes in demand') ||
      rawError.includes('UNAVAILABLE')
    ) {
      return "Les serveurs d'intelligence artificielle Gemini connaissent une forte affluence temporaire mondiale. Notre système a automatiquement tenté des modèles de secours. Vous pouvez relancer l'analyse immédiatement d'un simple clic ou saisir vos données ci-dessous.";
    }

    if (rawError.includes('429') || rawError.includes('RESOURCE_EXHAUSTED')) {
      return "Quota de requêtes momentanément atteint. Veuillez patienter 5 secondes puis cliquer sur Réessayer.";
    }

    return rawError;
  };

  // Process file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    // Limit to 15MB
    if (file.size > 15 * 1024 * 1024) {
      setError("L'image est trop volumineuse. Veuillez choisir une photo de moins de 15 Mo.");
      return;
    }

    setError(null);
    setAppliedSuccess(false);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      setLastImagePayload({ base64, mimeType: file.type });
      sendImageToAI(base64, file.type);
    };
    reader.onerror = () => {
      setError("Impossible de lire le fichier sélectionné.");
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Quick sample bills
  const handleLoadSample = async (sampleId: string) => {
    setError(null);
    setIsScanning(true);
    setScanStep('Chargement de la facture exemple...');
    setAppliedSuccess(false);
    setPreviewImage(null);
    setLastImagePayload(null);

    try {
      const res = await fetch('/api/scan-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId, countryCode: countryProfile.code }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erreur lors de l’analyse de la facture');
      }

      setExtractedData(json.data);
    } catch (err: any) {
      setError(parseFriendlyErrorMessage(err?.message || 'Erreur lors du traitement de la facture exemple'));
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  // Retry previous scan
  const handleRetry = () => {
    if (lastImagePayload) {
      sendImageToAI(lastImagePayload.base64, lastImagePayload.mimeType);
    } else {
      setError(null);
    }
  };

  // Use country defaults as fallback if desired
  const handleUseCountryDefaults = () => {
    setError(null);
    const defaultData: BillExtractionData = {
      detected: true,
      supplierName: `${countryProfile.gridOperatorName} / Fournisseur de référence`,
      contractType: `Tarif standard réglementé (${countryProfile.name})`,
      powerSubscribedKVA: 6,
      tariffOption: "Base",
      pricePerKWhTTC: countryProfile.defaultElectricityPricePerKWh,
      pricePerKWhHT: Math.round(countryProfile.defaultElectricityPricePerKWh * (1 - countryProfile.defaultVatRate) * 1000) / 1000,
      annualConsumptionKWh: Math.round(config.annualBillEuros / countryProfile.defaultElectricityPricePerKWh) || 4800,
      periodConsumptionKWh: 800,
      periodMonths: 2,
      totalBillAmountTTC: Math.round((config.annualBillEuros / 6) * 10) / 10 || 200,
      estimatedAnnualBillTTC: config.annualBillEuros || 1200,
      vatRate: countryProfile.defaultVatRate,
      currency: countryProfile.currency.symbol,
      confidenceScore: 80,
      keyHighlights: [
        `Barème officiel moyen du pays appliqué (${countryProfile.defaultElectricityPricePerKWh} ${countryProfile.currency.symbol}/kWh)`,
        `Taux de TVA national de référence (${Math.round(countryProfile.defaultVatRate * 100)}%)`,
        "Données prêtes à être ajustées librement selon votre situation",
      ],
      analysisNotes: `Données de référence configurées pour ${countryProfile.name}. Vous pouvez les ajuster directement.`,
    };
    setExtractedData(defaultData);
  };

  // Call API with base64 image
  const sendImageToAI = async (imageBase64: string, mimeType: string) => {
    setIsScanning(true);
    setScanStep('Transmission de la photo au modèle Gemini...');
    setExtractedData(null);
    setError(null);

    try {
      setTimeout(() => {
        setScanStep("Lecture OCR & recherche du fournisseur d'énergie...");
      }, 900);

      setTimeout(() => {
        setScanStep('Extraction des tarifs du kWh, de la TVA et de la consommation...');
      }, 2200);

      const res = await fetch('/api/scan-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          countryCode: countryProfile.code,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Erreur lors de l’analyse du document');
      }

      setExtractedData(json.data);
    } catch (err: any) {
      const friendlyMsg = parseFriendlyErrorMessage(err?.message || '');
      setError(friendlyMsg);
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  // Apply extracted data to configuration
  const handleApplyToConfig = () => {
    if (!extractedData) return;

    const updates: Partial<SolarConfig> = {};

    // 1. Prix du kWh
    if (applyPrice && extractedData.pricePerKWhTTC && extractedData.pricePerKWhTTC > 0) {
      updates.gridElectricityCostPerKWh = Math.round(extractedData.pricePerKWhTTC * 10000) / 10000;
      updates.isCustomGridTariff = true;
    }

    // 2. Consommation annuelle
    if (applyConsumption && extractedData.annualConsumptionKWh && extractedData.annualConsumptionKWh > 0) {
      updates.annualConsumptionKWh = Math.round(extractedData.annualConsumptionKWh);
    }

    // 3. Montant annuel de la facture
    if (applyBillAmount) {
      if (extractedData.estimatedAnnualBillTTC && extractedData.estimatedAnnualBillTTC > 0) {
        updates.annualBillEuros = Math.round(extractedData.estimatedAnnualBillTTC);
      } else if (updates.annualConsumptionKWh && (updates.gridElectricityCostPerKWh || config.gridElectricityCostPerKWh)) {
        const rate = updates.gridElectricityCostPerKWh || config.gridElectricityCostPerKWh;
        updates.annualBillEuros = Math.round(updates.annualConsumptionKWh * rate);
      }
    }

    // 4. Taux de TVA si détecté
    if (applyVat && extractedData.vatRate !== null && extractedData.vatRate !== undefined && extractedData.vatRate > 0) {
      updates.customVatRate = extractedData.vatRate;
    }

    onChange(updates);
    setAppliedSuccess(true);
  };

  const handleResetScan = () => {
    setExtractedData(null);
    setPreviewImage(null);
    setError(null);
    setAppliedSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div
      id="bill-scanner-card"
      className="bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-neutral-50 rounded-2xl border-2 border-amber-300/80 p-4 sm:p-5 shadow-sm space-y-4 relative overflow-hidden"
    >
      {/* Top background aesthetic */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                Scan IA de votre Facture d'Électricité
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-700" />
                Gemini Vision OCR
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Téléversez ou photographiez votre facture d'électricité avant installation. L'IA extrait automatiquement votre <strong>coût réel du kWh</strong>, votre <strong>consommation annuelle</strong>, votre <strong>montant TTC</strong> et la <strong>TVA</strong>.
            </p>
          </div>
        </div>

        {extractedData && (
          <button
            type="button"
            onClick={handleResetScan}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 rounded-lg text-xs font-semibold self-start shrink-0 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
            Nouveau scan
          </button>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Zone (Visible if no extraction done or during new scan) */}
      {!extractedData && !isScanning && (
        <div className="space-y-3 relative z-10">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center transition-all ${
              isDragging
                ? 'border-amber-500 bg-amber-100/50 scale-[1.01]'
                : 'border-amber-300/80 bg-white/90 hover:border-amber-400 hover:bg-white'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-full mb-1">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs sm:text-sm font-bold text-neutral-900">
                Glissez votre facture ici, ou sélectionnez une option :
              </div>
              <div className="text-[11px] text-neutral-500 max-w-md">
                Formats acceptés : Photos (JPG, PNG, WebP) de votre facture papier ou capture d'écran de votre espace client (EDF, Total, Engie, Enedis...)
              </div>

              {/* Action buttons: Camera vs Gallery */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 mt-3">
                <button
                  type="button"
                  id="btn-scan-camera"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Prendre une photo (Appareil)
                </button>

                <button
                  type="button"
                  id="btn-scan-gallery"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-300 hover:border-amber-400 hover:bg-amber-50/60 text-neutral-800 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-amber-600" />
                  Choisir dans la galerie / Fichier
                </button>
              </div>
            </div>
          </div>

          {/* Quick test samples */}
          <div className="bg-white/80 border border-neutral-200/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-neutral-700 font-medium">
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Pas de facture sous la main ? Testez avec un exemple :</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadSample('edf_tarif_bleu')}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                ⚡ EDF 6 kVA (0,2516 €)
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('totalenergies_hphc')}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                🔥 TotalEnergies HP/HC
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('engie_elec')}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                🌿 Engie Référence
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading & Scanning State */}
      {isScanning && (
        <div className="bg-white/95 rounded-xl border border-amber-300 p-6 text-center space-y-3 relative z-10 shadow-sm">
          <div className="inline-flex p-3 bg-amber-100 text-amber-800 rounded-full animate-bounce">
            <Sparkles className="w-7 h-7 text-amber-600 animate-spin" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-bold text-neutral-900 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              Analyse de votre facture en cours...
            </div>
            <p className="text-xs text-neutral-600 font-medium">{scanStep}</p>
          </div>
          <div className="w-48 mx-auto bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full animate-pulse w-3/4" />
          </div>
          <p className="text-[11px] text-neutral-500">
            Extraction sécurisée sans conservation des données nominatives.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50/90 border border-red-200 text-red-900 rounded-xl p-4 text-xs space-y-3 relative z-10 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm text-red-900">Analyse temporairement ralentie</div>
              <div className="text-xs mt-1 text-red-800 leading-relaxed">{error}</div>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs text-red-500 hover:text-red-800 font-bold p-1"
              title="Fermer ce message"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-red-200/70">
            {lastImagePayload && (
              <button
                type="button"
                id="btn-retry-scan"
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Réessayer l'analyse maintenant
              </button>
            )}

            <button
              type="button"
              id="btn-use-defaults"
              onClick={handleUseCountryDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
            >
              <span>Utiliser les barèmes officiels moyens ({countryProfile.name})</span>
            </button>

            <span className="text-[11px] text-neutral-500 italic ml-auto">
              Ou saisissez manuellement chaque valeur ci-dessous.
            </span>
          </div>
        </div>
      )}

      {/* Extracted Data Preview & Confirmation */}
      {extractedData && (
        <div className="bg-white rounded-xl border border-amber-300/90 p-4 sm:p-5 space-y-4 relative z-10 shadow-xs">
          {/* Header of results */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900">
                  {extractedData.supplierName || "Fournisseur d'électricité identifié"}
                </h4>
                <p className="text-[11px] text-neutral-500">
                  {extractedData.contractType || 'Contrat résidentiel'} {extractedData.powerSubscribedKVA ? `• ${extractedData.powerSubscribedKVA} kVA` : ''} {extractedData.tariffOption ? `• Option ${extractedData.tariffOption}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                Fiabilité {extractedData.confidenceScore}%
              </span>
            </div>
          </div>

          {/* Grid of Extracted Parameters with Selection Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Coût du kWh */}
            <label
              className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all ${
                applyPrice
                  ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                  : 'border-neutral-200 bg-neutral-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-neutral-700">
                  Prix du kWh TTC
                </span>
                <input
                  type="checkbox"
                  checked={applyPrice}
                  onChange={(e) => setApplyPrice(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </div>
              <div className="text-xl font-extrabold text-neutral-900">
                {extractedData.pricePerKWhTTC
                  ? `${extractedData.pricePerKWhTTC} ${countryProfile.currency.symbol}`
                  : 'Non spécifié'}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                {extractedData.pricePerKWhHT ? `HT: ${extractedData.pricePerKWhHT} ${countryProfile.currency.symbol}` : 'Toutes taxes incluses'}
              </div>
            </label>

            {/* 2. Consommation annuelle */}
            <label
              className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all ${
                applyConsumption
                  ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                  : 'border-neutral-200 bg-neutral-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-neutral-700">
                  Consommation annuelle
                </span>
                <input
                  type="checkbox"
                  checked={applyConsumption}
                  onChange={(e) => setApplyConsumption(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </div>
              <div className="text-xl font-extrabold text-neutral-900">
                {extractedData.annualConsumptionKWh
                  ? `${extractedData.annualConsumptionKWh.toLocaleString('fr-FR')} kWh`
                  : 'Non spécifiée'}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                {extractedData.periodConsumptionKWh
                  ? `Facture : ${extractedData.periodConsumptionKWh} kWh (${extractedData.periodMonths || 2} mois)`
                  : 'Consommation annuelle Linky'}
              </div>
            </label>

            {/* 3. Facture annuelle estimée */}
            <label
              className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all ${
                applyBillAmount
                  ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                  : 'border-neutral-200 bg-neutral-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-neutral-700">
                  Facture annuelle TTC
                </span>
                <input
                  type="checkbox"
                  checked={applyBillAmount}
                  onChange={(e) => setApplyBillAmount(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </div>
              <div className="text-xl font-extrabold text-neutral-900">
                {extractedData.estimatedAnnualBillTTC
                  ? `${Math.round(extractedData.estimatedAnnualBillTTC).toLocaleString('fr-FR')} ${countryProfile.currency.symbol}`
                  : extractedData.totalBillAmountTTC
                  ? `${extractedData.totalBillAmountTTC} ${countryProfile.currency.symbol}`
                  : 'Non spécifié'}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                {extractedData.totalBillAmountTTC ? `Facture période : ${extractedData.totalBillAmountTTC} ${countryProfile.currency.symbol}` : 'Estimation sur 12 mois'}
              </div>
            </label>

            {/* 4. Taux de TVA */}
            <label
              className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all ${
                applyVat
                  ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                  : 'border-neutral-200 bg-neutral-50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-neutral-700">
                  Taux de TVA relevé
                </span>
                <input
                  type="checkbox"
                  checked={applyVat}
                  onChange={(e) => setApplyVat(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </div>
              <div className="text-xl font-extrabold text-neutral-900">
                {extractedData.vatRate !== null && extractedData.vatRate !== undefined
                  ? `${(extractedData.vatRate * 100).toFixed(1)}%`
                  : '20.0%'}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1">
                Réglementation fiscale applicable
              </div>
            </label>
          </div>

          {/* Highlights & Notes */}
          {extractedData.keyHighlights && extractedData.keyHighlights.length > 0 && (
            <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-200/80 text-xs">
              <span className="font-bold text-neutral-900 block mb-1.5">
                Détails détectés par l'intelligence artificielle :
              </span>
              <ul className="space-y-1 text-neutral-600 text-[11px]">
                {extractedData.keyHighlights.map((hl, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
              {extractedData.analysisNotes && (
                <p className="mt-2 pt-2 border-t border-neutral-200/60 text-[11px] text-neutral-500 italic">
                  Note : {extractedData.analysisNotes}
                </p>
              )}
            </div>
          )}

          {/* Apply Button & Confirmation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Ces données pré-rempliront les champs ci-dessous. <strong>Vous pourrez toujours les ajuster ou les modifier manuellement.</strong>
              </span>
            </div>

            <button
              type="button"
              id="btn-apply-bill-data"
              onClick={handleApplyToConfig}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-xs ${
                appliedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              {appliedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Données appliquées à votre simulation !
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  Appliquer à la configuration
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success alert banner when applied */}
      {appliedSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl p-3 text-xs flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Les valeurs de votre facture ont été injectées avec succès dans votre simulateur. <strong>Les saisies manuelles ci-dessous restent actives et libres de toute modification.</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAppliedSuccess(false)}
            className="text-[11px] text-emerald-800 hover:underline font-bold"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
