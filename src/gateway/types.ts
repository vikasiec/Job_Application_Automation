export interface GatewayConfig {
  rateLimits: RateLimitConfig;
  piiRedaction: PIIConfig;
  loopDetection: LoopDetectorConfig;
  vault: VaultConfig;
  mcpServers: MCPServerConfig[];
  controlPlane: ControlPlaneConfig;
}

export interface RateLimitConfig {
  defaultTPM: number;
  defaultRPM: number;
  perConsumer?: Record<string, { tpm: number; rpm: number }>;
}

export interface PIIConfig {
  enabled: boolean;
  patterns: PIIPattern[];
}

export interface PIIPattern {
  name: string;
  regex: RegExp;
  replacement: string;
}

export interface LoopDetectorConfig {
  windowMs: number;
  maxOccurrences: number;
}

export interface VaultConfig {
  secrets: Record<string, string>;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  namespace: string;
  url: string;
  transport: 'websocket' | 'sse' | 'http';
  authHeader?: string;
}

export interface ControlPlaneConfig {
  port: number;
  adminKey?: string;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export interface GatewayMetrics {
  totalRequests: number;
  blockedRequests: number;
  rateLimitedRequests: number;
  loopsDetected: number;
  piiRedactions: number;
  activeConnections: number;
  requestsPerConsumer: Record<string, number>;
  toolExecutions: Record<string, number>;
  uptimeMs: number;
}

export interface OpenAPISpec {
  openapi: string;
  info: { title: string; version: string; description?: string };
  paths: Record<string, PathItem>;
  components?: { schemas?: Record<string, unknown> };
  servers?: { url: string }[];
}

export interface PathItem {
  get?: OperationObject;
  post?: OperationObject;
  put?: OperationObject;
  patch?: OperationObject;
  delete?: OperationObject;
}

export interface OperationObject {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: ParameterObject[];
  requestBody?: RequestBodyObject;
  responses?: Record<string, unknown>;
  'x-mcp-description'?: string;
}

export interface ParameterObject {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema?: { type: string; enum?: string[]; format?: string };
  'x-mcp-hint'?: string;
}

export interface RequestBodyObject {
  required?: boolean;
  content?: Record<string, { schema?: unknown }>;
  description?: string;
}

export interface ConsumerContext {
  consumerId: string;
  consumerType?: 'llm' | 'agent' | 'human';
  metadata?: Record<string, string>;
}

export interface GatewayRequest {
  consumer: ConsumerContext;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  rawBody?: string;
  estimatedTokens?: number;
}

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
  retryAfterMs?: number;
  modified?: boolean;
}
