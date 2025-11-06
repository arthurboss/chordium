export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
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
				// ===== Foundation palette (mirrors CSS tokens for designers) =====
				palette: {
					neutral: {
						'0': 'oklch(var(--neutral-0))',
						'5': 'oklch(var(--neutral-5))',
						'20': 'oklch(var(--neutral-20))',
						'40': 'oklch(var(--neutral-40))',
						'70': 'oklch(var(--neutral-70))',
						'85': 'oklch(var(--neutral-85))',
						'90': 'oklch(var(--neutral-90))'
					},
					brand: {
						'50': 'oklch(var(--brand-50))',
						contrast: 'oklch(var(--brand-contrast))'
					},
					accent: {
						'50': 'oklch(var(--accent-50))',
						contrast: 'oklch(var(--accent-contrast))'
					},
					feedback: {
						error: 'oklch(var(--error-60))',
						'error-contrast': 'oklch(var(--error-contrast))'
					}
				},
				// ===== Semantic aliases used across the UI =====
				background: 'oklch(var(--background))',
				foreground: 'oklch(var(--foreground))',
				card: {
					DEFAULT: 'oklch(var(--card))',
					foreground: 'oklch(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'oklch(var(--popover))',
					foreground: 'oklch(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'oklch(var(--primary))',
					foreground: 'oklch(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'oklch(var(--secondary))',
					foreground: 'oklch(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'oklch(var(--muted))',
					foreground: 'oklch(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'oklch(var(--accent))',
					foreground: 'oklch(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'oklch(var(--destructive))',
					foreground: 'oklch(var(--destructive-foreground))'
				},
				border: 'oklch(var(--border))',
				input: 'oklch(var(--input))',
				ring: 'oklch(var(--ring))',
				// ===== Component-specific palettes =====
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
				// Legacy chord palette still used in utilities
				chord: {
					DEFAULT: '#9b87f5',
					light: '#e5deff',
					dark: '#6E59A5'
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
				'fade-in': {
					from: {
						opacity: 0
					},
					to: {
						opacity: 1
					}
				}
			},
			animation: {
				'spin': 'spin 1s linear infinite',
				'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'bounce': 'bounce 1s infinite',
				'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out'
			},
			fontFamily: {
				sans: [
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'"Helvetica Neue"',
					'Arial',
					'"Noto Sans"',
					'sans-serif',
					'"Apple Color Emoji"',
					'"Segoe UI Emoji"',
					'"Segoe UI Symbol"',
					'"Noto Color Emoji"',
				],
				mono: [
					'ui-monospace',
					'SFMono-Regular',
					'Menlo',
					'Monaco',
					'Consolas',
					'"Liberation Mono"',
					'"Courier New"',
					'monospace',
				],
			}
		}
	}
};

