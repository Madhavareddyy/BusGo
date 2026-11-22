/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#D84E55',       // Primary red
          darkred: '#C73540',   // Dark red / hover
          navy: '#1F2937',      // Dark navy
          text: '#344054',      // Text
          muted: '#667085',     // Muted text
          bg: '#F7F8FA',        // Background
          border: '#E5E7EB',    // Border
          success: '#159957',   // Success green
          warning: '#F59E0B',   // Warning amber
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -1px rgba(0, 0, 0, 0.08), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.06)',
        'search': '0 10px 30px -5px rgba(216, 78, 85, 0.15), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'card': '12px',
        'card-lg': '16px',
      }
    },
  },
  plugins: [],
}
