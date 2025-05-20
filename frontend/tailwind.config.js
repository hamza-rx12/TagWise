/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'custom-green': {
                    300: 'oklch(87.1% 0.15 154.449)',
                    400: 'oklch(79.2% 0.209 151.711)',
                    500: 'oklch(72.3% 0.219 149.579)',
                },
                'custom-teal': {
                    500: 'oklch(70.4% 0.14 182.503)',
                    600: 'oklch(60% 0.118 184.704)',
                },
            },
        },
    },
    plugins: [],
} 