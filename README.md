# dependrix-visualisation
Visual and compare library usage across multiple projects

## Setup your own dependrix visualisation

Document intended usage here...

1] Use as part of build and inject JSON (into DOM)
2] Use `dist/index.html` and `dist/bundle.min.js` directly and provide your own `modelled-dependencies.json`

## Local development

### Build

```bash
npm run build
# or
npm run build -- --watch #automatically re-build whenever changes are made
```

### Run

Open `dist/index.html` in your browser

### Tests

```bash
npm test
```
Tests are run with [Jest](https://facebook.github.io/jest/)

### Linting

```bash
npm run lint
```

Linting is done with [ESLint](https://eslint.org/) and is configured to conform code to https://standardjs.com/
