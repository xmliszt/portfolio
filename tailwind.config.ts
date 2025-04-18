import type { Config } from 'tailwindcss';

const config = {
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
              marginBottom: '1.5em',
              marginTop: '1em',
              fontSize: '20px',
            },
            h2: {
              marginBottom: '1em',
              marginTop: '1.5em',
              fontSize: '16px',
              fontWeight: '600',
            },
            h3: {
              marginBottom: '1em',
              marginTop: '1.5em',
              fontSize: '16px',
              fontWeight: '600',
              color: 'hsl(var(--muted-foreground))',
            },
            h4: {
              marginBottom: '1em',
              marginTop: '1.5em',
              fontSize: '14px',
              fontWeight: '600',
              color: 'hsl(var(--muted-foreground))',
            },
            p: {
              marginBottom: '1rem',
              marginTop: '1rem',
              fontSize: '14px',
              lineHeight: '20px',
            },
            hr: {
              marginTop: '1rem',
              marginBottom: '1rem',
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
              fontSize: '14px',
            },
            'li>div': {
              marginTop: '0.2rem',
              marginBottom: '0.2rem',
            },
            'input[type="checkbox"]': {
              margin: 0,
              marginRight: '0.5rem',
            },
          },
        },
      },
      screens: {
        xs: '480px', // mobile
        sm: '640px', // mobile
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
        'float-up-and-down': {
          '0%': {
            transform: 'translateY(0rem) rotate(0deg) scale(1)',
            opacity: '1',
          },
          '50%': {
            transform: 'translateY(-0.5rem) rotate(180deg) scale(1.05)',
            opacity: '0.3',
          },
          '100%': {
            transform: 'translateY(0rem) rotate(360deg) scale(1)',
            opacity: '1',
          },
        },
        'fade-in-float-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(1rem)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'fade-out-float-down': {
          '0%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateY(1rem)',
          },
        },
        'wobble-horizontal': {
          '0%': {
            transform: 'translateX(0%)',
          },
          '15%': {
            transform: 'translateX(-15%)',
          },
          '30%': {
            transform: 'translateX(10%)',
          },
          '45%': {
            transform: 'translateX(-10%)',
          },
          '60%': {
            transform: 'translateX(5%)',
          },
          '75%': {
            transform: 'translateX(-5%)',
          },
          '100%': {
            transform: 'translateX(0%)',
          },
        },
        'car-wobble': {
          '0%': {
            transform: 'translate(0)',
          },
          '20%': {
            transform: 'translate(0.5px, -0.5px)',
          },
          '40%': {
            transform: 'translate(0.5px, 0.5px)',
          },
          '60%': {
            transform: 'translate(-0.5px, 0.5px)',
          },
          '80%': {
            transform: 'translate(-0.5px, -0.5px)',
          },
          '100%': {
            transform: 'translate(0)',
          },
        },
        'smoke-rise-up-and-fade-out': {
          '0%': {
            transform: 'translateY(0) translateX(0) scale(0.2)',
            opacity: '0',
          },
          '20': {
            transform: 'translateY(-2px) translateX(-4px) scale(0.4)',
            opacity: '0.4',
          },
          '40%': {
            transform: 'translateY(-4px) translateX(0px) scale(0.6)',
            opacity: '0.5',
          },
          '60%': {
            transform: 'translateY(-6px) translateX(-4px) scale(0.8)',
            opacity: '0.6',
          },
          '80%': {
            transform: 'translateY(-8px) translateX(0px) scale(1.4)',
            opacity: '0.3',
          },
          '100%': {
            transform: 'translateY(-10px) translateX(-4px) scale(2)',
            opacity: '0',
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
        'float-up-and-down': 'float-up-and-down 6s ease-in-out infinite',
        'fade-in-float-up': 'fade-in-float-up 1s ease-out',
        'fade-out-float-down': 'fade-out-float-down 1s ease-out',
        'wobble-horizontal': 'wobble-horizontal 1s ease-out infinite',
        'car-wobble': 'car-wobble 0.5s linear infinite both',
        smoke: 'smoke-rise-up-and-fade-out 1s linear',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;

export default config;
