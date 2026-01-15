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
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				border: 'hsl(var(--border))',
				ring: 'hsl(var(--ring))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				"aurora-flow": {
					"0%, 100%": { "background-position": "0% 50%" },
					"50%": { "background-position": "100% 50%" }
				},
				"float": {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-20px)" }
				}
			},
			animation: {
				"aurora": "aurora-flow 8s ease infinite",
				"float": "float 6s ease-in-out infinite",
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require("tailwind-scrollbar"),
	],
};
export default config;