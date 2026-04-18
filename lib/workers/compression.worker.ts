/**
 * ARCHIVO: lib/workers/compression.worker.ts
 * VERSIÓN: 1.1
 * PROTOCOLO: MADRID RESONANCE V3.0
 * MISIÓN: Ejecución de compresión de imágenes fuera del hilo principal con cumplimiento ZAP.
 * [THERMIC V1.0]: Refuerzo de higiene de RAM y soberanía nominal (ZAP).
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 */

/// <reference lib="webworker" />

/**
 * INTERFAZ: CompressionPayload
 * Contrato de entrada de datos transmitido desde el Main Thread.
 */
interface CompressionPayload {
  file: File;
  maxWidth: number;
  quality: number;
}

/**
 * Event Listener del Worker
 * Se ejecuta de forma aislada cada vez que el Orquestador le envía un paquete.
 */
self.onmessage = async (messageEvent: MessageEvent<CompressionPayload>) => {
  const { file, maxWidth, quality: compressionQualityFactor } = messageEvent.data;

  try {
    /**
     * 1. LECTURA DE PÍXELES (No-Bloqueante)
     * createImageBitmap es una API nativa diseñada para decodificar imágenes 
     * asíncronamente fuera del hilo principal.
     */
    const bitmap = await createImageBitmap(file);

    let targetWidth = bitmap.width;
    let targetHeight = bitmap.height;

    /**
     * 2. MATEMÁTICA DE ESCALADO (Aspect Ratio Guard)
     * Limitamos el tamaño físico para no perforar el umbral de Vercel.
     */
    if (targetWidth > maxWidth) {
      targetHeight = Math.round((maxWidth / targetWidth) * targetHeight);
      targetWidth = maxWidth;
    }

    /**
     * 3. INSTANCIACIÓN DE LIENZO AISLADO (OffscreenCanvas)
     * Este lienzo existe exclusivamente en la VRAM/RAM asignada al Worker.
     */
    const offscreen = new OffscreenCanvas(targetWidth, targetHeight);
    const renderingContext = offscreen.getContext('2d');

    if (!renderingContext) {
      throw new Error("UNSUPPORTED_OFFSCREEN_CONTEXT: Fallo al adquirir motor 2D en Worker.");
    }

    // Configuración de Alta Fidelidad para peritaje de OCR
    renderingContext.imageSmoothingEnabled = true;
    renderingContext.imageSmoothingQuality = 'high';

    // Dibujado escalar
    renderingContext.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    /**
     * 4. COMPRESIÓN FÍSICA (Transmutación a WebP)
     * Convertimos el mapa de píxeles a un Blob binario.
     */
    const compressedBlob = await offscreen.convertToBlob({
      type: 'image/webp',
      quality: compressionQualityFactor
    });

    /**
     * 5. RETORNO SOBERANO (Structured Clone Transfer)
     * Devolvemos el binario al Main Thread.
     */
    self.postMessage({
      success: true,
      blob: compressedBlob
    });

    // Higiene de RAM: Liberar memoria del bitmap original explícitamente.
    bitmap.close();

  } catch (operationalException: unknown) {
    // Si algo falla, avisamos al Main Thread para que active su "Paracaídas de Fallback".
    self.postMessage({
      success: false,
      exceptionMessageInformation: (operationalException instanceof Error) ? operationalException.message : "WORKER_COMPRESSION_FAILURE"
    });
  }
};

/**
 * NOTA TÉCNICA DEL ARCHITECT (V1.0):
 * 1. CPU Shield: Al procesar createImageBitmap y convertToBlob en un Worker, 
 *    garantizamos que las animaciones CSS (spinners) del componente ScannerUI 
 *    jamás pierdan frames durante la captura (Stuttering-Free).
 * 2. RAM Hygiene: La llamada a bitmap.close() al final del proceso es crítica 
 *    en dispositivos móviles para evitar fugas de memoria (Memory Leaks) al 
 *    procesar múltiples fotos OCR consecutivas.
 * 3. Fallback Contract: El Worker responde con un objeto predecible { success, blob/error }
 *    que el archivo lib/utils.ts consume para decidir si usa el Blob o el Main Thread.
 */