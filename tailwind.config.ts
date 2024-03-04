import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      typography: {
        DEFAULT: {
          css: {
            article: {
              width: '100%',
            },
            h1: {
              marginBottom: '1em',
              marginTop: '1em',
            },
            h2: {
              marginBottom: '1em',
              marginTop: '1em',
            },
            p: {
              marginBottom: '1rem',
              marginTop: '1rem',
            },
            hr: {
              marginTop: '1rem',
            },
            pre: {
              backgroundColor: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
            },
            a: {
              textDecoration: 'none',
            },
            li: {
              marginTop: '0',
              marginBottom: '0',
            },
            'li>div': {
              marginTop: '0.2rem',
              marginBottom: '0.2rem',
            },
          },
        },
      },
      screens: {
        md: '768px', // tablet
        lg: '1024px', // laptop
        xl: '1280px', // large desktop
        piano: '416px',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        wave: {
          '0%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(12deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        greet: {
          '0%': {
            opacity: '0',
            transform: 'translateY(2.5rem) translateX(0px) rotate(-12deg)',
          },
          '25%': {
            opacity: '100',
            transform: 'translateY(-3.5rem) translateX(4rem) rotate(6deg)',
          },
          '75%': {
            opacity: '100',
            transform: 'translateY(-3.5rem) translateX(4rem) rotate(6deg)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(2.5rem) translateX(0px) rotate(-12deg)',
          },
        },
        'fade-in-from-right-and-fade-out': {
          '0%': {
            opacity: '0',
            transform: 'translateX(2rem)',
          },
          '25%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
          '75%': {
            opacity: '1',
            transform: 'translateX(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(0)',
          },
        },
        'fade-in-float-up-wiggle': {
          '0%': {
            opacity: '0',
            transform: 'translateY(0) rotate(-6deg)',
          },
          '20%': {
            opacity: '1',
            transform: 'translateY(-10px) rotate(18deg)',
          },
          '40%': {
            opacity: '1',
            transform: 'translateY(-20px) rotate(-12deg)',
          },
          '60%': {
            opacity: '1',
            transform: 'translateY(-30px) rotate(15deg)',
          },
          '80%': {
            opacity: '0.5',
            transform: 'translateY(-40px) rotate(-16deg)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(-50px) rotate(8deg)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        wave: 'wave 400ms 2 ease-out',
        greet: 'greet 1200ms ease-out',
        'fade-in-from-right-and-fade-out':
          'fade-in-from-right-and-fade-out 2s ease-out',
        'fade-in-float-up-wiggle': 'fade-in-float-up-wiggle 2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;

export default config;
