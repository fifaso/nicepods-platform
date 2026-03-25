// tailwind.config.ts
// VERSIÓN: 2.0 (NicePod Style Core - Visual Materialization Edition)
// Misión: Registrar los activos de animación para la Malla de Madrid y evitar la purga en Vercel.
// [ESTABILIZACIÓN]: Registro de nicepod-pulse, shimmer y spin-slow.

import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"*.{js,ts,jsx,tsx,mdx}"
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
        // [MANDATO V2.7]: Materialización del Voyager (Anillos GPS)
        'nicepod-pulse': {
          '0%': { transform: 'scale(0.1)', opacity: '0' },
          '30%': { opacity: '0.6' },
          '100%': { transform: 'scale(3.5)', opacity: '0' },
        },
        // Levitación de Ecos (Puntos de Interés)
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-12px)' },
				},
        // Sincronía de Sombras en el asfalto 3D
				shadowPulse: {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
					'50%': { transform: 'scale(0.8)', opacity: '0.3' },
				},
        // Barrido de luz para botones táctiles
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        // Rotación cinemática para el Radar
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
			},
			animation: {
        'nicepod-pulse': 'nicepod-pulse 4s cubic-bezier(0, 0.45, 0.15, 1) infinite',
				float: 'float 4s ease-in-out infinite',
				shadowPulse: 'shadowPulse 4s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("tailwind-scrollbar"),
	],
};

export default config;