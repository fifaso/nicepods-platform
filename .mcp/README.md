/** 
 * ARCHIVO: .mcp/README.md 
 * VERSIÓN: 5.0 (Madrid Resonance - Pro Edition) 
 * PROTOCOLO: MCP INFRASTRUCTURE GOVERNANCE 
 * MISIÓN: Gestión y Orquestación de Herramientas de Inteligencia 
 * NIVEL DE INTEGRIDAD: 100% (Soberano)
 */

# 🏗️ MCP Infrastructure Overview

Esta carpeta constituye el núcleo de conectividad de la Workstation NicePod con el ecosistema externo. Permite a los agentes interactuar directamente con el **Metal (Supabase)** y el **Crystal (GitHub)**.

## 🛡️ Seguridad y Secretos

1. **env.json**: Este archivo contiene las credenciales reales. Está estrictamente prohibido subirlo a control de versiones.
2. **Inyección de Variables**: El archivo `mcp-servers.json` utiliza la sintaxis `${VARIABLE}` para referenciar secretos inyectados en tiempo de ejecución.
3. **Jerarquía de Acceso**: Solo agentes con el nivel de autoridad `Strategist` o superior pueden solicitar acceso a las herramientas de escritura en el servidor de Supabase.

## ⚙️ Inicialización del Sistema

Para activar la infraestructura MCP, siga estos pasos:
1. Copie `env.json.example` a `env.json`.
2. Llene los valores con tokens válidos de la organización.
3. Valide la configuración ejecutando:
   ```bash
   # Si utiliza AJV para validación de schemas
   ajv validate -s .mcp/config.schema.json -d .mcp/mcp-servers.json