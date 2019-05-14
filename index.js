const fs = require('fs')

const readFile = filename => new Promise((resolve, reject) => fs.readFile(
  filename,
  (err, data) => err ? reject(err) : resolve(data.toString('utf-8'))
))

export default () => readFile(`${__dirname}/dist/index.html`)
