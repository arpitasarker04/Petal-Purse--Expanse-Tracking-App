# Petal Purse 🌸

A soft, girly expense tracker built with plain HTML, CSS, and JavaScript — no frameworks, no backend, no build step. Everything is stored in the browser's local storage.

Live demo: http://arpitasarker04.github.io/Petal-Purse--Expanse-Tracking-App/

## Features

- Log expenses with an amount, category, note, and date
- Pill-shaped category picker (Food & drink, Shopping, Beauty, Travel, Bills, Fun, Other)
- Hero header showing this month's total against an editable monthly goal, with a progress bar
- Donut chart breakdown of spending by category, built with a single CSS conic-gradient (no charting library)
- Receipt-style ledger of every expense with one-tap delete
- Fully responsive, keyboard-accessible, and respects reduced-motion preferences

## Tech and concepts

- Semantic HTML5
- CSS custom properties (variables) for a maintainable design system
- Vanilla JavaScript: state management, event delegation, localStorage persistence
- No dependencies, no build step — open `index.html` and it runs

## Files

\```
petal-purse/
├── index.html      # page structure
├── css/style.css   # all styling (design tokens at the top)
├── js/app.js       # state, storage, and rendering logic
└── README.md
\```

## Running it locally

Open `index.html` directly in a browser, or serve it:

\```bash
cd petal-purse
python3 -m http.server 8000
# visit http://localhost:8000
\```

## Notes on data

Expenses and the monthly goal are saved with `localStorage`, scoped to the browser/domain. There's no server, so data won't sync across devices.