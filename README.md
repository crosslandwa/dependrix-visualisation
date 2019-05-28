# dependrix-visualisation
Visual and compare library usage across multiple projects

## Setup your own dependrix visualisation

Dependrix visualises cross-project dependencies using a model as described by `schema.json`. You can generate a model yourself, or make use of the following:
- [dependrix-maven](https://github.com/crosslandwa/dependrix-maven)
- [dependrix-npm](https://github.com/crosslandwa/dependrix-npm)

### Build a standalone HTML file

Use the `buildStandaloneHTML` function exposed by `dependrix-visualisation` to generate a single HTML file

```js
const fs = require('fs')
const { buildStandaloneHTML } = require('.')

const writeFile = (filename, content) => new Promise((resolve, reject) => fs.writeFile(
  filename,
  content,
  'utf8',
  (err, data) => err ? reject(err) : resolve(content)
))

const model = { projects: {}, analysis: { title: 'An example analysis' } }
buildStandaloneHTML(model)
  .then(html => writeFile('./dependrix-example.html', html))
  .catch(console.error)
```

### Supply your own modelled-dependencies.json

Use the HTML files included in `dependrix-visualisation` and place them alongside a JSON file containing your model in a location where your webserver can serve them:

```bash
mkdir webserver
npm install dependrix-visualisation --save-dev
cp node_modules/dependrix-visualisation/dist/index.html webserver/
cp node_modules/dependrix-visualisation/dist/bundle.min.js webserver/
cp yourDependrixModel.json webserver/modelled-dependencies.json
```

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
