module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#60efff', // accent blue
        secondary: '#0061ff', // deep blue
        background: '#000428', // dark background
        surface: '#1e293b', // card background
        accent: '#fbbf24', // yellow accent
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'title-shimmer': 'title-shimmer 5s infinite linear',
        'rotate': 'rotate 15s linear infinite',
        'stars-parallax': 'stars-parallax 100s linear infinite',
        'float': 'float 20s infinite ease-in-out',
        'float-slow': 'float 35s infinite ease-in-out',
        'float-delay-5': 'float 25s infinite ease-in-out -5s',
        'float-delay-10': 'float 30s infinite ease-in-out -10s',
        'float-delay-7': 'float 22s infinite ease-in-out -7s',
        'float-delay-3': 'float 28s infinite ease-in-out -3s',
        'float-delay-12': 'float 20s infinite ease-in-out -12s',
        'pulse': 'pulse 1.5s infinite ease-in-out',
        'pulse-slow': 'pulse 3s infinite ease-in-out',
        'pulse-warning': 'pulse-warning 1.5s infinite ease-in-out',
        'float-particle-1': 'float-particle 20s infinite ease-in-out',
        'float-particle-2': 'float-particle 26s infinite ease-in-out -5s',
        'float-particle-3': 'float-particle 22s infinite ease-in-out -8s',
        'float-particle-4': 'float-particle 30s infinite ease-in-out -12s',
      },
      keyframes: {
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'title-shimmer': {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        rotate: {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
        },
        'stars-parallax': {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '50%': { transform: 'translateX(-25%) translateY(-15%)' },
          '100%': { transform: 'translateX(0) translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(-50px, 25px) rotate(5deg)' },
          '50%': { transform: 'translate(25px, -50px) rotate(-5deg)' },
          '75%': { transform: 'translate(50px, 25px) rotate(3deg)' },
        },
        'float-particle': {
          '0%, 100%': { transform: 'translate(0, 0)', opacity: '0.4' },
          '25%': { transform: 'translate(-100px, 50px)', opacity: '0.8' },
          '50%': { transform: 'translate(40px, -70px)', opacity: '0.6' },
          '75%': { transform: 'translate(80px, 40px)', opacity: '0.9' },
        },
        'pulse-warning': {
          '0%': { boxShadow: '0 0 0 0 rgba(255, 153, 102, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(255, 153, 102, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255, 153, 102, 0)' },
        },
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-to))',
        'gradient-radial': 'radial-gradient(circle, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
} 