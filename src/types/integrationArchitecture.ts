/**
 * Integration Adapter & API-Ready Architecture Types
 * 
 * Enterprise specification for integrating academic affairs systems without assuming
 * that live external APIs already exist. Supports progressive adaptation:
 * Batch Files (Excel/CSV) -> Staging DB Views -> API-Ready Contracts -> Live REST/Webhooks / SSO.
 */

export type IntegrationMode =
  | 'LIVE_API'
  | 'API_READY_CONTRACT'
  | 'STAGING_DB_VIEW'
  | 'BATCH_FILE_EXCEL_CSV'
  | 'SFTP_BATCH'
  | 'SSO_FEDERATED'
  | 'QUEUE_BUFFER_OUTBOX';

export type AdapterReadinessStatus =
  | 'LIVE_CONNECTED'
  | 'API_READY_CONTRACT'
  | 'STAGING_VIEW_ACTIVE'
  | 'BATCH_FILE_ACTIVE'
  | 'FEDERATED_ACTIVE'
  | 'STANDBY';

export type SystemCategory =
  | 'hr_personnel'
  | 'curriculum'
  | 'registrar_sis'
  | 'credit_bank'
  | 'qa_accreditation'
  | 'edocument_saraban'
  | 'email_gateway'
  | 'sso_identity'
  | 'external_university_gov';

export interface FieldMappingRule {
  sourceField: string;
  targetField: string;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  transformRule?: 'uppercase' | 'trim' | 'parse_number' | 'format_thai_date' | 'mask_cid' | 'none';
  description: string;
  exampleValue: string;
}

export interface DataContractDefinition {
  contractVersion: string;
  endpointStub: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  authMethod:
    | 'OAuth 2.0 / Bearer Token'
    | 'API Key (HMAC SHA-256)'
    | 'mTLS X.509 Certificate'
    | 'SAML 2.0 / OIDC Token'
    | 'SMTP TLS / OAuth'
    | 'Staging DB Credentials'
    | 'Manual Batch Auth';
  headers: Record<string, string>;
  sampleRequestPayload: string;
  sampleResponsePayload: string;
  fieldMappings: FieldMappingRule[];
}

export interface FallbackStrategy {
  primary: string;
  secondary: string;
  offlineBehavior: string;
  syncRecovery: string;
}

export interface TransitionRoadmap {
  shortTerm: string;
  midTerm: string;
  longTerm: string;
}

export interface StagingTemplateColumn {
  key: string;
  label: string;
  example: string;
  required: boolean;
  dataType: string;
}

export interface StagingTemplate {
  filename: string;
  columns: StagingTemplateColumn[];
  sampleCsv: string;
}

export interface AdapterSyncStats {
  lastSyncAt: string;
  totalRecordsProcessed: number;
  successCount: number;
  errorCount: number;
  outboxPendingCount: number;
  healthRate: number; // e.g. 99.4%
}

export interface IntegrationAdapterDefinition {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  category: SystemCategory;
  targetSystem: string;
  externalAgency: string;
  hasLiveApi: boolean;
  currentMode: IntegrationMode;
  supportedModes: IntegrationMode[];
  readinessStatus: AdapterReadinessStatus;
  whyNoApiReason: string;
  transitionRoadmap: TransitionRoadmap;
  dataContract: DataContractDefinition;
  fallbackStrategy: FallbackStrategy;
  stagingTemplate: StagingTemplate;
  syncStats: AdapterSyncStats;
}

export interface OutboxQueueItem {
  id: string;
  adapterId: string;
  adapterCode: string;
  targetSystem: string;
  action: string;
  payload: Record<string, any>;
  createdAt: string;
  status: 'queued' | 'processing' | 'dispatched' | 'failed';
  retryCount: number;
  errorMessage?: string;
}

export interface BatchIngestionRowResult {
  rowNumber: number;
  isValid: boolean;
  rawData: Record<string, any>;
  mappedData?: Record<string, any>;
  errors: string[];
  warnings: string[];
}

export interface BatchIngestionJob {
  id: string;
  adapterId: string;
  adapterName: string;
  filename: string;
  fileType: 'csv' | 'excel' | 'json';
  uploadedAt: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  status: 'validated' | 'committed' | 'failed';
  dryRunSummary: string[];
  rows: BatchIngestionRowResult[];
}
