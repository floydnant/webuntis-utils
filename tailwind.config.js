/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,ts,scss}"],
    purge: [],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            colors: {
                untis: "#FE6033",
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
