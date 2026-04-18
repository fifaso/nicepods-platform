/**
 * ARCHIVO: lib/workers/resonance-physics.worker.ts
 * VERSIÓN: 5.0 (NicePod Physics Worker - Sovereign Memory Protocol Edition)
 * PROTOCOLO: MADRID RESONANCE V4.9
 * MISIÓN: Ejecutar la simulación de fuerzas gravitatorias en un hilo secundario aislado.
 * [THERMIC V1.0]: Sincronización nominal ZAP y optimización de transferencia de memoria.
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
 * Misión: Representar un nodo de conocimiento dentro del motor D3.
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
  | { action: "RESUME_SIMULATION" };

// --- I. ESTADO GLOBAL DEL TRABAJADOR ---
let activeForceSimulation: Simulation<PhysicsNodePayload, undefined> | null = null;

/**
 * self.onmessage:
 * Receptor de comandos de autoridad desde el Hilo Principal.
 */
self.onmessage = (messageEvent: MessageEvent<ResonancePhysicsSimulationRequest>) => {
  const simulationRequest = messageEvent.data;

  switch (simulationRequest.action) {
    case "START_SIMULATION":
      executeSimulationInitialization(
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
  }
};

/**
 * executeSimulationInitialization:
 * Configura y arranca el motor de fuerzas con transferencia de memoria optimizada.
 */
function executeSimulationInitialization(
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
      const positionsBuffer = new Float32Array(nodesCountMagnitude * 3);

      for (let itemIndex = 0; itemIndex < nodesCountMagnitude; itemIndex++) {
        const currentNode = nodesCollection[itemIndex];
        const offsetIndex = itemIndex * 3;

        positionsBuffer[offsetIndex] = currentNode.identification;
        positionsBuffer[offsetIndex + 1] = currentNode.x || 0;
        positionsBuffer[offsetIndex + 2] = currentNode.y || 0;
      }

      // [BSS]: Uso de Transferable Objects sin cast 'as any' mediante cumplimiento de interfaz.
      self.postMessage({
        type: "TICK",
        positionsBuffer: positionsBuffer
      }, { transfer: [positionsBuffer.buffer] });
    })

    .on("end", () => {
      const nodesCountMagnitude = nodesCollection.length;
      const finalPositionsBuffer = new Float32Array(nodesCountMagnitude * 3);

      for (let itemIndex = 0; itemIndex < nodesCountMagnitude; itemIndex++) {
        const currentNode = nodesCollection[itemIndex];
        const offsetIndex = itemIndex * 3;

        finalPositionsBuffer[offsetIndex] = currentNode.identification;
        finalPositionsBuffer[offsetIndex + 1] = currentNode.x || 0;
        finalPositionsBuffer[offsetIndex + 2] = currentNode.y || 0;
      }

      self.postMessage({
        type: "STABILITY_REACHED",
        positionsBuffer: finalPositionsBuffer
      }, { transfer: [finalPositionsBuffer.buffer] });
    });
}
