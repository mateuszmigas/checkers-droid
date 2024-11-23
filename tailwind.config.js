/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./index.html",
		"./src/**/*.{ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				"background-light": "#E4EFF0",
				"background-dark": "#002439",
				"primary": "#78CCE2",
				"secondary": "#4F7988",
				"tertiary": "#005066",
			},
		},
	},
};

