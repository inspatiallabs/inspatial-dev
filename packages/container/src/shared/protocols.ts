/**
 * InSpatial Container System - Communication Protocols
 *
 * This file defines the message protocol used for communication between
 * client and server container environments.
 */

import { type } from "@inspatial/type"
import {
  ContainerConfigType,
  ContainerEventType,
  ContainerRuntimeInfoType,
} from "./types.ts"

/**
 * Base message type for all protocol messages
 */
export const BaseMessageType = type({
  id: "string", // Unique message identifier
  timestamp: "number", // Unix timestamp in milliseconds
  type: "string", // Message type identifier
})

/**
 * Container lifecycle message types
 */
export const MessageTypeEnum = type({
  value: [
    // Container lifecycle messages
    "'container.create'",
    "'container.start'",
    "'container.suspend'",
    "'container.resume'",
    "'container.terminate'",

    // Command execution
    "'container.execute'",

    // Information and status
    "'container.info'",
    "'container.list'",
    "'container.event'",

    // State synchronization
    "'state.initialize'",
    "'state.update'",
    "'state.get'",
    "'state.conflict'",
    "'state.terminate'",

    // File system operations
    "'fs.read'",
    "'fs.write'",
    "'fs.delete'",
    "'fs.readdir'",
    "'fs.mkdir'",
    "'fs.exists'",
    "'fs.sync'",

    // Connection management
    "'connection.ping'",
    "'connection.pong'",
    "'connection.error'",

    // Security messages
    "'security.validate'",
    "'security.config'",
    "'security.analyze'",
  ],
})

/**
 * Request message structure
 */
export const RequestMessageType = type({
  ...BaseMessageType.schema,
  requestId: "string", // Unique request identifier for correlation
  "payload?": "Record<string, unknown>", // Request-specific payload
})

/**
 * Response message structure
 */
export const ResponseMessageType = type({
  ...BaseMessageType.schema,
  requestId: "string", // Matching request identifier
  success: "boolean", // Whether the request was successful
  "error?": { // Error information if success is false
    code: "string",
    message: "string",
    "details?": "Record<string, unknown>",
  },
  "payload?": "Record<string, unknown>", // Response-specific payload
})

/**
 * Event notification message structure
 */
export const EventMessageType = type({
  ...BaseMessageType.schema,
  event: ContainerEventType, // Event details
  "payload?": "Record<string, unknown>", // Additional event information
})

/**
 * Container creation request payload
 */
export const CreateContainerRequestType = type({
  config: ContainerConfigType,
  securityContext: {
    userId: "string",
    "permissions?": "string[]",
    "securityTokens?": "Record<string, string>",
    "isolationLevel?": "'standard' | 'enhanced' | 'maximum'",
  },
})

/**
 * Container creation response payload
 */
export const CreateContainerResponseType = type({
  containerId: "string",
})

/**
 * Container operation request payload (start, suspend, resume, terminate)
 */
export const ContainerOperationRequestType = type({
  containerId: "string",
  "force?": "boolean", // For terminate operation
})

/**
 * Container execution request payload
 */
export const ExecuteCommandRequestType = type({
  containerId: "string",
  command: "string",
  "args?": "string[]",
  "env?": "Record<string, string>",
  "timeout?": "number", // Execution timeout in milliseconds
})

/**
 * Container execution response payload
 */
export const ExecuteCommandResponseType = type({
  success: "boolean",
  containerId: "string",
  "output?": "string",
  "error?": "string",
  "exitCode?": "number",
  stats: {
    "executionTime?": "number",
    "cpuTime?": "number",
    "peakMemoryUsage?": "number",
  },
})

/**
 * Container information request payload
 */
export const ContainerInfoRequestType = type({
  containerId: "string",
})

/**
 * Container information response payload
 */
export const ContainerInfoResponseType = type({
  containerInfo: ContainerRuntimeInfoType,
})

/**
 * Container listing request payload
 */
export const ListContainersRequestType = type({
  "filters?": {
    "states?": [
      "'creating' | 'running' | 'suspended' | 'resuming' | 'terminating' | 'terminated' | 'failed'",
    ],
    "namePattern?": "string",
  },
})

/**
 * Container listing response payload
 */
export const ListContainersResponseType = type({
  containers: [ContainerRuntimeInfoType],
})

/**
 * State synchronization initialization payload
 */
export const StateInitRequestType = type({
  containerId: "string",
  stateConfig: {
    "states?": [
      {
        stateId: "string",
        priority: "'critical' | 'high' | 'normal' | 'low'",
        direction: "'clientToServer' | 'serverToClient' | 'bidirectional'",
        "conflictStrategy?":
          "'clientWins' | 'serverWins' | 'lastWriteWins' | 'manual'",
      },
    ],
  },
})

/**
 * State update request payload
 */
export const StateUpdateRequestType = type({
  containerId: "string",
  stateId: "string",
  version: "number", // Incremental version number
  patch: "Record<string, unknown>", // Delta patch to apply
})

/**
 * State update response payload
 */
export const StateUpdateResponseType = type({
  containerId: "string",
  stateId: "string",
  success: "boolean",
  version: "number", // Confirmed version number
  "conflict?": "boolean", // Whether a conflict was detected
})

/**
 * State retrieval request payload
 */
export const StateGetRequestType = type({
  containerId: "string",
  stateId: "string",
})

/**
 * State retrieval response payload
 */
export const StateGetResponseType = type({
  containerId: "string",
  stateId: "string",
  version: "number",
  state: "Record<string, unknown>",
})

/**
 * State conflict resolution request payload
 */
export const StateConflictRequestType = type({
  containerId: "string",
  stateId: "string",
  resolution: "'clientWins' | 'serverWins'",
  "explicitState?": "Record<string, unknown>", // Used when resolution requires manual merge
})

/**
 * File system read request payload
 */
export const FileReadRequestType = type({
  path: "string",
})

/**
 * File system read response payload
 */
export const FileReadResponseType = type({
  path: "string",
  content: "string", // Base64 encoded content
  "encoding?": "'utf8' | 'base64'",
  "contentType?": "string",
  "modified?": "number", // Last modified timestamp
})

/**
 * File system write request payload
 */
export const FileWriteRequestType = type({
  path: "string",
  content: "string", // Base64 encoded content
  "encoding?": "'utf8' | 'base64'",
  "createPath?": "boolean", // Whether to create parent directories
})

/**
 * File system directory read request payload
 */
export const DirReadRequestType = type({
  path: "string",
})

/**
 * File system directory read response payload
 */
export const DirReadResponseType = type({
  path: "string",
  entries: [
    {
      name: "string",
      isDirectory: "boolean",
      "size?": "number",
      "modified?": "number",
    },
  ],
})

/**
 * Security validation request payload
 */
export const SecurityValidationRequestType = type({
  securityContext: {
    userId: "string",
    "permissions?": "string[]",
    "securityTokens?": "Record<string, string>",
  },
  operation:
    "'create' | 'start' | 'suspend' | 'resume' | 'terminate' | 'execute'",
  "containerId?": "string",
})

/**
 * Security validation response payload
 */
export const SecurityValidationResponseType = type({
  allowed: "boolean",
  "reason?": "string",
})

/**
 * Security behavior analysis request payload
 */
export const SecurityAnalysisRequestType = type({
  containerId: "string",
  "timeWindow?": "number", // Analysis window in milliseconds
})

/**
 * Security behavior analysis response payload
 */
export const SecurityAnalysisResponseType = type({
  containerId: "string",
  anomalyScore: "number", // 0.0 to 1.0, higher means more anomalous
  findings: [
    {
      type: "string",
      severity: "'low' | 'medium' | 'high' | 'critical'",
      description: "string",
      "timestamp?": "number",
      "evidence?": "Record<string, unknown>",
    },
  ],
})

// Export TypeScript types derived from the validators
export type BaseMessage = typeof BaseMessageType.infer
export type MessageType = typeof MessageTypeEnum.infer
export type RequestMessage = typeof RequestMessageType.infer
export type ResponseMessage = typeof ResponseMessageType.infer
export type EventMessage = typeof EventMessageType.infer
export type CreateContainerRequest = typeof CreateContainerRequestType.infer
export type CreateContainerResponse = typeof CreateContainerResponseType.infer
export type ContainerOperationRequest =
  typeof ContainerOperationRequestType.infer
export type ExecuteCommandRequest = typeof ExecuteCommandRequestType.infer
export type ExecuteCommandResponse = typeof ExecuteCommandResponseType.infer
export type ContainerInfoRequest = typeof ContainerInfoRequestType.infer
export type ContainerInfoResponse = typeof ContainerInfoResponseType.infer
export type ListContainersRequest = typeof ListContainersRequestType.infer
export type ListContainersResponse = typeof ListContainersResponseType.infer
export type StateInitRequest = typeof StateInitRequestType.infer
export type StateUpdateRequest = typeof StateUpdateRequestType.infer
export type StateUpdateResponse = typeof StateUpdateResponseType.infer
export type StateGetRequest = typeof StateGetRequestType.infer
export type StateGetResponse = typeof StateGetResponseType.infer
export type StateConflictRequest = typeof StateConflictRequestType.infer
export type FileReadRequest = typeof FileReadRequestType.infer
export type FileReadResponse = typeof FileReadResponseType.infer
export type FileWriteRequest = typeof FileWriteRequestType.infer
export type DirReadRequest = typeof DirReadRequestType.infer
export type DirReadResponse = typeof DirReadResponseType.infer
export type SecurityValidationRequest =
  typeof SecurityValidationRequestType.infer
export type SecurityValidationResponse =
  typeof SecurityValidationResponseType.infer
export type SecurityAnalysisRequest = typeof SecurityAnalysisRequestType.infer
export type SecurityAnalysisResponse = typeof SecurityAnalysisResponseType.infer
