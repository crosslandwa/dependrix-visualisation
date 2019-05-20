export const clearModelFromDom = () => {
  document.getElementsByTagName('html')[0].innerHTML = ''
}

export const injectModelIntoDom = model => {
  document.body.innerHTML = `<script id="modelled-dependencies">${JSON.stringify(model)}</script>`
}

export const project = (id, version, ...dependencies) => ({
  id,
  version,
  dependencies: dependencies.reduce((acc, { id, scope, version }) => ({
    ...acc,
    [id]: { version, scope }
  }), {})
})

export const dependency = (id, version, scope) => ({ id, version, scope })

export const model = (...artifacts) => artifacts.reduce((acc, artifact) => ({
  artifacts: {
    ...acc.artifacts,
    [artifact.id]: { version: artifact.version, dependencies: artifact.dependencies }
  }
}), { artifacts: {} })
