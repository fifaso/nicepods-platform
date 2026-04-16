/** ARCHIVO: .nicepod/mcp-policy.md VERSIÓN: 1.0 PROTOCOLO: MCP SECURITY MANIFEST MISIÓN: Definición de Privilegios de Infraestructura MCP NIVEL DE INTEGRIDAD: 100% */

# MCP Security Policy Manifest

## Introduction
This manifest defines the authority and limitations of the Model Context Protocol (MCP) infrastructure within the NicePod ecosystem.

## Persona Authorities

### Strategist ⚡
- **Authority**: Read-only access to `.mcp/mcp-servers.json` for infrastructure discovery.
- **Constraint**: Prohibited from modifying MCP server configurations or credentials.
- **Constraint**: May suggest new MCP integrations but cannot implement them directly.

### Sentinel 🛡️
- **Authority**: Audit of the `.mcp/` directory to ensure compliance with security standards.
- **Authority**: Verification of JSON schema integrity in `.mcp/config.schema.json`.
- **Constraint**: No direct write access to sensitive credentials within `mcp-servers.json`.

## Infrastructure Constraints
1. **Credential Sequestration**: No real credentials shall be committed to version control. Use environment variables or secret management systems.
2. **Schema Enforcement**: All MCP server configurations must be validated against `.mcp/config.schema.json`.
3. **Audit Trail**: Every modification to the MCP infrastructure must be documented in this manifest or associated security journals.
