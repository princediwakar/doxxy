import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			border: 'hsl(var(--border) / <alpha-value>)',
    			input: 'hsl(var(--input) / <alpha-value>)',
    			ring: 'hsl(var(--ring) / <alpha-value>)',
    			background: 'hsl(var(--background) / <alpha-value>)',
    			foreground: 'hsl(var(--foreground) / <alpha-value>)',
    			primary: {
    				DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
    				foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
    				50: 'hsl(var(--primary-50))',
    				100: 'hsl(var(--primary-100))',
    				200: 'hsl(var(--primary-200))',
    				300: 'hsl(var(--primary-300))',
    				400: 'hsl(var(--primary-400))',
    				500: 'hsl(var(--primary-500))',
    				600: 'hsl(var(--primary-600))',
    				700: 'hsl(var(--primary-700) / <alpha-value>)',
    				800: 'hsl(var(--primary-800))',
    				900: 'hsl(var(--primary-900))',
    				950: 'hsl(var(--primary-950))',
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
    				foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
    				50: 'hsl(var(--secondary-50))',
    				100: 'hsl(var(--secondary-100))',
    				200: 'hsl(var(--secondary-200))',
    				300: 'hsl(var(--secondary-300))',
    				400: 'hsl(var(--secondary-400))',
    				500: 'hsl(var(--secondary-500))',
    				600: 'hsl(var(--secondary-600))',
    				700: 'hsl(var(--secondary-700) / <alpha-value>)',
    				800: 'hsl(var(--secondary-800))',
    				900: 'hsl(var(--secondary-900))',
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
    				foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
    				50: 'hsl(var(--destructive-50))',
    				100: 'hsl(var(--destructive-100))',
    				200: 'hsl(var(--destructive-200))',
    				300: 'hsl(var(--destructive-300))',
    				400: 'hsl(var(--destructive-400))',
    				500: 'hsl(var(--destructive-500))',
    				600: 'hsl(var(--destructive-600))',
    				700: 'hsl(var(--destructive-700) / <alpha-value>)',
    				800: 'hsl(var(--destructive-800))',
    				900: 'hsl(var(--destructive-900))',
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
    				foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
    				50: 'hsl(var(--muted-50))',
    				100: 'hsl(var(--muted-100))',
    				200: 'hsl(var(--muted-200))',
    				300: 'hsl(var(--muted-300))',
    				400: 'hsl(var(--muted-400))',
    				500: 'hsl(var(--muted-500))',
    				600: 'hsl(var(--muted-600))',
    				700: 'hsl(var(--muted-700))',
    				800: 'hsl(var(--muted-800))',
    				900: 'hsl(var(--muted-900))',
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
    				foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
    				50: 'hsl(var(--accent-50))',
    				100: 'hsl(var(--accent-100))',
    				200: 'hsl(var(--accent-200))',
    				300: 'hsl(var(--accent-300))',
    				400: 'hsl(var(--accent-400))',
    				500: 'hsl(var(--accent-500))',
    				600: 'hsl(var(--accent-600))',
    				700: 'hsl(var(--accent-700) / <alpha-value>)',
    				800: 'hsl(var(--accent-800))',
    				900: 'hsl(var(--accent-900))',
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
    				foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card) / <alpha-value>)',
    				foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar-background))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			},
    			// Healthcare-specific colors
    			success: {
    				DEFAULT: 'hsl(var(--success) / <alpha-value>)',
    				foreground: 'hsl(var(--success-foreground) / <alpha-value>)',
    				50: 'hsl(var(--success-50))',
    				100: 'hsl(var(--success-100))',
    				200: 'hsl(var(--success-200))',
    				300: 'hsl(var(--success-300))',
    				400: 'hsl(var(--success-400))',
    				500: 'hsl(var(--success-500))',
    				600: 'hsl(var(--success-600))',
    				700: 'hsl(var(--success-700) / <alpha-value>)',
    				800: 'hsl(var(--success-800))',
    				900: 'hsl(var(--success-900))',
    			},
    			warning: {
    				DEFAULT: 'hsl(var(--warning) / <alpha-value>)',
    				foreground: 'hsl(var(--warning-foreground) / <alpha-value>)',
    				50: 'hsl(var(--warning-50))',
    				100: 'hsl(var(--warning-100))',
    				200: 'hsl(var(--warning-200))',
    				300: 'hsl(var(--warning-300))',
    				400: 'hsl(var(--warning-400))',
    				500: 'hsl(var(--warning-500))',
    				600: 'hsl(var(--warning-600))',
    				700: 'hsl(var(--warning-700))',
    				800: 'hsl(var(--warning-800))',
    				900: 'hsl(var(--warning-900))',
    			},
    			info: {
    				DEFAULT: 'hsl(var(--info))',
    				foreground: 'hsl(var(--info-foreground))',
    				50: 'hsl(var(--info-50))',
    				100: 'hsl(var(--info-100))',
    				200: 'hsl(var(--info-200))',
    				300: 'hsl(var(--info-300))',
    				400: 'hsl(var(--info-400))',
    				500: 'hsl(var(--info-500))',
    				600: 'hsl(var(--info-600))',
    				700: 'hsl(var(--info-700))',
    				800: 'hsl(var(--info-800))',
    				900: 'hsl(var(--info-900))',
    			},
    			// Medical specialty colors
    			medical: {
    				blue: 'hsl(210 100% 56%)',
    				teal: 'hsl(180 84% 39%)',
    				green: 'hsl(160 84% 39%)',
    				amber: 'hsl(43 96% 56%)',
    				red: 'hsl(0 93% 73%)',
    				purple: 'hsl(270 95% 75%)',
    				pink: 'hsl(330 81% 60%)',
    				indigo: 'hsl(230 95% 75%)'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)'
    				},
    				to: {
    					height: '0'
    				}
    			},
    			'pulse-slow': {
    				'0%, 100%': {
    					opacity: '1'
    				},
    				'50%': {
    					opacity: '0.5'
    				}
    			},
    			'fade-in': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(10px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
    			'fade-in': 'fade-in 0.3s ease-out'
    		},
    		fontFamily: {
    			sans: ['Inter', 'system-ui', 'sans-serif'],
    			mono: ['JetBrains Mono', 'Consolas', 'monospace']
    		},
    		boxShadow: {
    			'medical': '0 2px 8px -2px rgba(16, 185, 129, 0.1), 0 4px 16px -4px rgba(59, 130, 246, 0.1)',
    			'medical-lg': '0 8px 24px -4px rgba(16, 185, 129, 0.15), 0 16px 32px -8px rgba(59, 130, 246, 0.15)',
    		}
    	}
    },
	plugins: [tailwindcssAnimate],
} satisfies Config;
