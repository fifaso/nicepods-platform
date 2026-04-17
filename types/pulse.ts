/**
 * ARCHIVO: types/pulse.ts
 * VERSIÓN: 5.2 (Madrid Resonance)
 * PROTOCOLO: Nominal Sovereignty
 * MISIÓN: Sellar el contrato de inteligencia proactiva y ADN cognitivo.
 * [REFORMA V5.2]: Restauración de la Axial Integrity mediante la inclusión
 * de alias depreciados en 'PulseRadarState'. Consolidación total ZAP.
 * NIVEL DE INTEGRIDAD: 100%
 */

/**
 * PulseCategory: Authority taxonomies for NicePod knowledge units.
 */
export type PulseCategory = 'paper' | 'report' | 'news' | 'analysis' | 'trend';

/**
 * PulseSignal: Represents a raw intelligence unit in the staging buffer.
 */
export interface PulseSignal {
  /** identification: Descriptor industrial soberano del nodo. */
  identification: string;
  /** @deprecated Utilizar 'identification' */
  id: string;

  contentHashIdentification: string;

  /** titleTextContent: Descriptor nominal del activo de conocimiento. */
  titleTextContent: string;
  /** @deprecated Utilizar 'titleTextContent' */
  title: string;

  /** summaryContentText: Resumen ejecutivo generado por el Oráculo. */
  summaryContentText: string;
  /** @deprecated Utilizar 'summaryContentText' */
  summary: string;

  uniformResourceLocator: string;

  /** sourceAuthorityName: Autoridad emisora de la señal. */
  sourceAuthorityName: string;
  /** @deprecated Utilizar 'sourceAuthorityName' */
  source_name: string;

  /** sourceContentType: Taxonomía de la fuente. */
  sourceContentType: PulseCategory;
  /** @deprecated Utilizar 'sourceContentType' */
  content_type: PulseCategory;

  /** authorityScoreValue: Magnitud de veracidad calculada (0.0 - 10.0). */
  authorityScoreValue: number;
  /** @deprecated Utilizar 'authorityScoreValue' */
  authority_score: number;

  isVeracityVerified: boolean;
  isHighValueSovereignty: boolean;
  creationTimestamp: string;
  expirationTimestamp: string;
}

/**
 * PulseMatchResult: Processed outcome from the pulse-matcher.
 */
export interface PulseMatchResult extends PulseSignal {
  semanticSimilarityMagnitude: number;

  /** matchPercentageMagnitude: Grado de resonancia con el ADN del Voyager. */
  matchPercentageMagnitude: number;
  /** @deprecated Utilizar 'matchPercentageMagnitude' */
  match_percentage: number;

  relevanceLabel: 'Prioritario' | 'Relevante' | 'Exploratorio';
}

/**
 * UserCognitiveDNA: Represents the user interest and intelligence matrix.
 */
export interface UserCognitiveDNA {
  userIdentification: string;
  dnaVectorCollection: number[];        // 768-dimension vector
  professionalProfileSummary: string;
  negativeInterestsCollection: string[];
  expertiseLevelMagnitude: number;      // Scale 1-10
  lastUpdateTimestamp: string;
  totalPulsesGeneratedCount: number;
}

/**
 * PulseRadarState: State management for the Pulse Radar component.
 */
export interface PulseRadarState {
  signalsCollection: PulseMatchResult[];
  selectedIdentificationsCollection: string[];

  isProcessingActiveStatus: boolean;
  /** @deprecated Utilizar 'isProcessingActiveStatus' */
  isProcessingActive: boolean;

  isScanningProcessActiveStatus: boolean;
  /** @deprecated Utilizar 'isScanningProcessActiveStatus' */
  isScanningProcessActive: boolean;

  exceptionMessageInformation: string | null;
  lastScanTimestamp: string | null;
}

/**
 * DNAMapNode: Structure for rendering interests in the interactive heat map.
 */
export interface DNAMapNode {
  identification: string;
  label: string;
  weightMagnitude: number;
  xCoordinate: number;
  yCoordinate: number;
  nodeCategory: 'professional' | 'personal' | 'noise';
}
