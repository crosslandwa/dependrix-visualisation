import createStore from '../../store'
import {
  artifactIds,
  artifactVersion,
  artifactDependencyScope,
  artifactDependencyVersion,
  loadTree
} from '../interactions'

describe('Dependency analysis', () => {
  beforeEach(() => {
    clearModelFromDom()
  })

  describe('for each loaded artifact', () => {
    it('is presented', done => {
      const store = createStore()
      expect(artifactIds(store.getState())).toHaveLength(0)

      injectModelIntoDom(model(
        artifact('a1', '1.0.0'),
        artifact('a2', '2.0.0')
      ))
      store.dispatch(loadTree())
        .then(() => {
          expect(artifactIds(store.getState())).toHaveLength(2)
        })
        .then(done, done.fail)
    })

    it('describes the artifact version', done => {
      const store = createStore()
      injectModelIntoDom(model(
        artifact('a1', '1.2.3')
      ))
      store.dispatch(loadTree())
        .then(() => {
          expect(artifactVersion(store.getState(), 'a1')).toEqual('1.2.3')
        })
        .then(done, done.fail)
    })

    it('describes version and scope of each dependency', done => {
      const store = createStore()
      injectModelIntoDom(model(
        artifact('a1', '1.2.3', dependency('d1', '1.0.0', 'real-scope'), dependency('d2', '2.0.0', 'test-scope'))
      ))
      store.dispatch(loadTree())
        .then(() => {
          expect(artifactDependencyVersion(store.getState(), 'a1', 'd1')).toEqual('1.0.0')
          expect(artifactDependencyScope(store.getState(), 'a1', 'd1')).toEqual('real-scope')
          expect(artifactDependencyVersion(store.getState(), 'a1', 'd2')).toEqual('2.0.0')
          expect(artifactDependencyScope(store.getState(), 'a1', 'd2')).toEqual('test-scope')
          expect(artifactDependencyVersion(store.getState(), 'a1', 'nonsenseDependencyId')).toEqual('')
          expect(artifactDependencyScope(store.getState(), 'a1', 'nonsenseDependencyId')).toEqual('')
        })
        .then(done, done.fail)
    })
  })
})

const clearModelFromDom = () => {
  document.getElementsByTagName('html')[0].innerHTML = ''
}

const injectModelIntoDom = model => {
  document.body.innerHTML = `<script id="modelled-dependencies">${JSON.stringify(model)}</script>`
}

const artifact = (id, version, ...dependencies) => ({
  id,
  version,
  dependencies: dependencies.reduce((acc, dep) => ({
    ...acc,
    [dep.id]: { version: dep.version, scope: dep.scope }
  }), {})
})

const dependency = (id, version, scope = 'some-scope') => ({ id, version, scope })

const model = (...artifacts) => artifacts.reduce((acc, artifact) => ({
  artifacts: {
    ...acc.artifacts,
    [artifact.id]: { version: artifact.version, dependencies: artifact.dependencies }
  },
  dependencies: Object.keys(artifact.dependencies).reduce((deps, id) => ({
    ...deps,
    [id]: [...(new Set((deps[id] || []).concat(artifact.dependencies[id].version)))]
  }), acc.dependencies)
}), { artifacts: {}, dependencies: {} })
