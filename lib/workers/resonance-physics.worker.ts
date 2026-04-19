/**
 * ARCHIVO: lib/workers/resonance-physics.worker.ts
 * VERSIÓN: 6.0 (NicePod Physics Worker - Sovereign Memory Protocol Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISIÓN: Ejecutar la simulación de fuerzas gravitatorias en un hilo secundario aislado.
 * [THERMIC V2.0]: Implementación de Reutilización de Buffers (Memory Recycling Protocol).
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 */

import {
  forceCollide,
  forceManyBody,
  forceRadial,
  forceSimulation,
  Simulation,
  SimulationNodeDatum
} from "d3-force";

/**
 * INTERFAZ: PhysicsNodePayload
 * Misión: Representar un nodo de conocimiento dentro del motor de física D3.
 */
interface PhysicsNodePayload extends SimulationNodeDatum {
  identification: number;
  horizontalCoordinate?: number;
  verticalCoordinate?: number;
}

/**
 * TYPE: ResonancePhysicsSimulationRequest
 * Misión: Contrato de mando desde el hilo principal con unión discriminada para BSS.
 */
type ResonancePhysicsSimulationRequest =
  | { action: "START_SIMULATION"; nodesCollection: PhysicsNodePayload[]; centerXCoordinate: number; centerYCoordinate: number; exclusionZoneRadius: number; }
  | { action: "STOP_SIMULATION" }
  | { action: "UPDATE_DIMENSIONS"; centerXCoordinate: number; centerYCoordinate: number; exclusionZoneRadius: number; }
  | { action: "PAUSE_SIMULATION" }
  | { action: "RESUME_SIMULATION" }
  | { action: "RETURN_BUFFER"; positionsBuffer: Float32Array; };

/**
 * INTERFAZ: ResonancePhysicsSimulationResponse
 * Misión: Definir el contrato de respuesta hacia el Hilo Principal.
 */
interface ResonancePhysicsSimulationResponse {
  type: "TICK" | "STABILITY_REACHED";
  positionsBuffer: Float32Array;
}

// --- I. ESTADO GLOBAL DEL TRABAJADOR (Hardened Memory State) ---
let activeForceSimulation: Simulation<PhysicsNodePayload, undefined> | null = null;
let recycledPositionsBufferInstance: Float32Array | null = null;

/**
 * self.onmessage:
 * Receptor de comandos de autoridad desde el Hilo Principal (MainThreadIsolation).
 */
self.onmessage = (messageEvent: MessageEvent<ResonancePhysicsSimulationRequest>) => {
  const simulationRequest = messageEvent.data;

  switch (simulationRequest.action) {
    case "START_SIMULATION":
      executeSimulationInitializationAction(
        simulationRequest.nodesCollection,
        simulationRequest.centerXCoordinate,
        simulationRequest.centerYCoordinate,
        simulationRequest.exclusionZoneRadius
      );
      break;

    case "STOP_SIMULATION":
      if (activeForceSimulation) {
        activeForceSimulation.stop();
        activeForceSimulation = null;
      }
      break;

    case "UPDATE_DIMENSIONS":
      if (activeForceSimulation) {
        activeForceSimulation
          .force("radial", forceRadial<PhysicsNodePayload>(
            simulationRequest.exclusionZoneRadius,
            simulationRequest.centerXCoordinate,
            simulationRequest.centerYCoordinate
          ).strength(0.6));
        activeForceSimulation.alpha(0.3).restart();
      }
      break;

    case "PAUSE_SIMULATION":
      if (activeForceSimulation) {
        activeForceSimulation.stop();
      }
      break;

    case "RESUME_SIMULATION":
      if (activeForceSimulation) {
        activeForceSimulation.alpha(0.1).restart();
      }
      break;

    case "RETURN_BUFFER":
      recycledPositionsBufferInstance = simulationRequest.positionsBuffer;
      break;
  }
};

/**
 * executeSimulationInitializationAction:
 * Configura y arranca el motor de fuerzas con transferencia de memoria optimizada.
 */
function executeSimulationInitializationAction(
  nodesCollection: PhysicsNodePayload[],
  centerXCoordinate: number,
  centerYCoordinate: number,
  exclusionZoneRadius: number
) {
  if (activeForceSimulation) {
    activeForceSimulation.stop();
  }

  activeForceSimulation = forceSimulation<PhysicsNodePayload>(nodesCollection)
    .force("charge", forceManyBody().strength(50))
    .force("radial", forceRadial<PhysicsNodePayload>(exclusionZoneRadius, centerXCoordinate, centerYCoordinate).strength(0.6))
    .force("collision", forceCollide<PhysicsNodePayload>().radius(65))
    .alphaDecay(0.022)

    .on("tick", () => {
      const nodesCountMagnitude = nodesCollection.length;
      const bufferSizeRequiredMagnitude = nodesCountMagnitude * 3;

      // [Memory Recycling Protocol]: Reutilizar buffer si existe y tiene el tamaño adecuado
      let positionsBuffer: Float32Array;
      if (recycledPositionsBufferInstance && recycledPositionsBufferInstance.length === bufferSizeRequiredMagnitude) {
        positionsBuffer = recycledPositionsBufferInstance;
        recycledPositionsBufferInstance = null;
      } else {
        positionsBuffer = new Float32Array(bufferSizeRequiredMagnitude);
      }

      for (let itemIndex = 0; itemIndex < nodesCountMagnitude; itemIndex++) {
        const currentNode = nodesCollection[itemIndex];
        const offsetIndex = itemIndex * 3;

        positionsBuffer[offsetIndex] = currentNode.identification;
        positionsBuffer[offsetIndex + 1] = currentNode.x || 0;
        positionsBuffer[offsetIndex + 2] = currentNode.y || 0;
      }

      // [BSS]: Transferencia de Soberanía de Memoria sin 'as any'
      const tickResponse: ResonancePhysicsSimulationResponse = {
        type: "TICK",
        positionsBuffer: positionsBuffer
      };

      self.postMessage(tickResponse, { transfer: [positionsBuffer.buffer] });
    })

    .on("end", () => {
      const nodesCountMagnitude = nodesCollection.length;
      const bufferSizeRequiredMagnitude = nodesCountMagnitude * 3;
      const finalPositionsBuffer = new Float32Array(bufferSizeRequiredMagnitude);

      for (let itemIndex = 0; itemIndex < nodesCountMagnitude; itemIndex++) {
        const currentNode = nodesCollection[itemIndex];
        const offsetIndex = itemIndex * 3;

        finalPositionsBuffer[offsetIndex] = currentNode.identification;
        finalPositionsBuffer[offsetIndex + 1] = currentNode.x || 0;
        finalPositionsBuffer[offsetIndex + 2] = currentNode.y || 0;
      }

      const endResponse: ResonancePhysicsSimulationResponse = {
        type: "STABILITY_REACHED",
        positionsBuffer: finalPositionsBuffer
      };

      self.postMessage(endResponse, { transfer: [finalPositionsBuffer.buffer] });
    });
}
