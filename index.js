const fs = require('fs')

const readFile = filename => new Promise((resolve, reject) => fs.readFile(
  filename,
  (err, data) => err ? reject(err) : resolve(data.toString('utf-8'))
))

export default () => Promise.all([
  readFile(`${__dirname}/dist/index.html`),
  readFile(`${__dirname}/dist/bundle.min.js`),
]).then(([content, js]) => content.replace("<script src='bundle.min.js'></script>", `<script>\n${js.replace('//# sourceMappingURL=bundle.min.js.map', '')}\n<script>`))
