import re
import sys

def distill_sql(input_file, output_file):
    noise_patterns = [
        r"^SET ",
        r"^SELECT pg_catalog.set_config",
        r"^CREATE EXTENSION",
        r"^COMMENT ON EXTENSION",
        r"^ALTER TABLE ONLY .* OWNER TO",
        r"^ALTER TABLE .* OWNER TO",
        r"^ALTER FUNCTION .* OWNER TO",
        r"^ALTER SCHEMA .* OWNER TO",
        r"^ALTER TYPE .* OWNER TO",
        r"^--.*PostgreSQL database dump",
        r"^--.*Dumped from database version",
        r"^--.*Dumped by pg_dump",
    ]
    
    print(f"🧬 Iniciando destilación: {input_file} -> {output_file}")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            content = f.readlines()
        
        distilled_lines = []
        distilled_lines.append("-- NICEPOD V2.5: CORE ARCHITECTURE DNA (V3.0)\n")
        distilled_lines.append("-- Destilado Profesional para Sucesión AI - Grado Industrial\n\n")
        
        for line in content:
            if line.isspace():
                continue
            is_noise = any(re.match(pattern, line) for pattern in noise_patterns)
            if not is_noise:
                distilled_lines.append(line)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.writelines(distilled_lines)
        print(f"✅ ADN extraído con éxito. {len(distilled_lines)} líneas conservadas.")
    except FileNotFoundError:
        print(f"🛑 Error: No se encontró {input_file}.")

if __name__ == "__main__":
    input_fn = sys.argv[1] if len(sys.argv) > 1 else "schema.sql"
    output_fn = sys.argv[2] if len(sys.argv) > 2 else "schema_core.sql"
    distill_sql(input_fn, output_fn)
