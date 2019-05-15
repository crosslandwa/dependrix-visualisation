// HELPERS for use in tests only

export const clearModelFromDom = () => {
  document.getElementsByTagName('html')[0].innerHTML = ''
}

export const injectModelIntoDom = model => {
  document.body.innerHTML = `<script id="modelled-dependencies">${JSON.stringify(model)}</script>`
}

export const artifact = (id, version, ...dependencies) => ({
  id,
  version,
  dependencies: dependencies.reduce((acc, dep) => ({
    ...acc,
    [dep.id]: { version: dep.version, scope: dep.scope }
  }), {})
})

export const dependency = (id, version, scope = 'some-scope') => ({ id, version, scope })

export const model = (...artifacts) => artifacts.reduce((acc, artifact) => ({
  artifacts: {
    ...acc.artifacts,
    [artifact.id]: { version: artifact.version, dependencies: artifact.dependencies }
  },
  dependencies: Object.keys(artifact.dependencies).reduce((deps, id) => ({
    ...deps,
    [id]: [...(new Set((deps[id] || []).concat(artifact.dependencies[id].version)))]
  }), acc.dependencies)
}), { artifacts: {}, dependencies: {} })