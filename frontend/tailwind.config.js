export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cyber: '#00ff9f',
        cyberDark: '#020617',
        cyberBg: 'rgba(0, 255, 159, 0.05)',
      },
      animation: {
        glow: 'glow 2s infinite alternate',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 5px #00ff9f, inset 0 0 5px #00ff9f' },
          to: { boxShadow: '0 0 20px #00ff9f, inset 0 0 15px #00ff9f' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};