/**
 * ARCHIVE: types/pulse.ts
 * VERSION: 2.0 (Pulse Intelligence Types - DNA, Signals & Matching)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISSION: Define the data structures for the Pulse Intelligence engine,
 * including signal processing, cognitive DNA mapping, and radar telemetry.
 * INTEGRITY LEVEL: 100% (Soberano / No abbreviations / Production-Ready)
 */

/**
 * PulseCategory: Authority taxonomies for NicePod knowledge units.
 */
export type PulseCategory = 'paper' | 'report' | 'news' | 'analysis' | 'trend';

/**
 * PulseSignal: Represents a raw intelligence unit in the staging buffer.
 */
export interface PulseSignal {
  identification: string;
  /** id: Fallback for axial compatibility. */
  id: string;
  contentHashIdentification: string;
  titleTextContent: string;
  /** title: Fallback for axial compatibility. */
  title: string;
  summaryContentText: string;
  /** summary: Fallback for axial compatibility. */
  summary: string;
  uniformResourceLocator: string;
  sourceAuthorityName: string;
  /** source_name: Fallback for axial compatibility. */
  source_name: string;
  sourceContentType: PulseCategory;
  /** content_type: Fallback for axial compatibility. */
  content_type: PulseCategory;
  authorityScoreValue: number;
  /** authority_score: Fallback for axial compatibility. */
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
  matchPercentageMagnitude: number;
  /** match_percentage: Fallback for axial compatibility. */
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
  isProcessingActive: boolean;
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
