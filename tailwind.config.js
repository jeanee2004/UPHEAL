/** @type {import('tailwindcss').Config} */
// Colours are CSS variables (space-separated RGB) so the whole site can switch theme at runtime — see src/index.css.
// Tailwind passes var(--tw-*-opacity) when no /modifier is used → fall back to the token's own default alpha (glass)
const c = (name, alpha) => ({ opacityValue }) => {
  const explicit = opacityValue !== undefined && !String(opacityValue).startsWith('var(--tw')
  return `rgb(var(--${name}) / ${explicit ? opacityValue : (alpha ?? 1)})`
}

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: c('ink'),                    // primary text
        paper: c('paper'),                // page
        card: c('card', 'var(--card-a)'), // glass surface (translucent in the light theme)
        surface: c('surface', 'var(--surface-a)'),
        mute: c('mute'),
        line: c('ink', 'var(--line-a)'),
        fg: c('fg'), onfg: c('onfg'),     // inverse fill (active pills, primary buttons) + text on it
        keydeep: c('keydeep'),            // key yellow used as TEXT
        rust: c('rust'), ok: c('ok'),
        sand: c('sand'), mist: c('mist'),
        deep: '#0b0b0c',                  // always-dark panels (footer, player) and text on yellow
        key: '#EDB021',                   // brand yellow
        amber: '#c98a2b',
        cream: '#f3efe6',                 // light text on always-dark surfaces
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Hanken Grotesk"', 'system-ui', 'sans-serif'],
        display: ['"Big Shoulders Display"', 'Impact', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
}
