/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: '#7c3aed', // Violet-600
                secondary: '#db2777', // Pink-600
                dark: '#0f172a', // Slate-900
                card: '#1e293b', // Slate-800
            }
        },
    },
    plugins: [],
}