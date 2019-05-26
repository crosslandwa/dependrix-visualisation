const fs = require('fs')
const Ajv = require('ajv')

const readFile = filename => new Promise((resolve, reject) => fs.readFile(
  filename,
  (err, data) => err ? reject(err) : resolve(data.toString('utf-8'))
))

const buildStandaloneHTML = (model) => validateModel(model)
  .then(() => Promise.all([
    readFile(`${__dirname}/dist/index.html`),
    readFile(`${__dirname}/dist/bundle.min.js`)
  ]))
  .then(insertBundleJsInline)
  .then(stripSourceMapping)
  .then(injectModelAsJSON(model))

const insertBundleJsInline = ([html, js]) => html
  .replace("<script src='bundle.min.js'></script>", '')
  .replace(
    '</body>',
    `<script>\n${js}\n</script>\n</body>`
  )
const stripSourceMapping = html => html.replace('//# sourceMappingURL=bundle.min.js.map', '')
const injectModelAsJSON = model => html => html.replace(
  '</head>',
  `<script type="application/json" id="modelled-dependencies">\n${JSON.stringify(model, null, 2)}\n</script>\n</head>`
)

const validateModel = (model) => readFile(`${__dirname}/schema.json`)
  .then(JSON.parse)
  .then(schema => new Ajv().compile(schema))
  .then(validateAgainstSchema => validateAgainstSchema(model)
    ? Promise.resolve(model)
    : Promise.reject(new Error(`Supplied model failed validation: ${JSON.stringify(validateAgainstSchema.errors)}`))
  )

module.exports = { buildStandaloneHTML, validateModel }
