import Ajv from 'ajv'
import fs from 'fs'

const validateAgainstSchema = new Ajv().compile(JSON.parse(fs.readFileSync(`${__dirname}/../../../schema.json`, 'utf8')))

export const clearModelFromDom = () => {
  document.getElementsByTagName('html')[0].innerHTML = ''
}

export const injectModelIntoDom = model => {
  document.body.innerHTML = `<script id="modelled-dependencies">${JSON.stringify(model)}</script>`
}

export const project = (id, version, ...dependencies) => ({ id, version, dependencies })
export const dependency = (id, version, scope) => ({ id, version, scope })
export const model = (...projects) => {
  const model = projects.reduce(
    (acc, { id, dependencies, version }) => ({ projects: { ...acc.projects, [id]: { version, dependencies } } }),
    { projects: {} }
  )
  if (!validateAgainstSchema(model)) {
    throw new Error(`Supplied model failed validation: ${JSON.stringify(validateAgainstSchema.errors)}`)
  }
  return model
}
