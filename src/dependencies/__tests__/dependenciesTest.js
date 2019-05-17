import createStore from '../../store'
import {
  artifactIds,
  artifactVersion,
  artifactDependencyScope,
  artifactDependencyVersion,
  dependencyIds,
  loadTree
} from '../interactions'
import { clearModelFromDom, injectModelIntoDom, artifact, dependency, model } from './helpers'

describe('Dependency analysis', () => {
  beforeEach(() => {
    clearModelFromDom()
  })

  describe('for each loaded artifact', () => {
    it('is presented in alphabetic order', done => {
      const store = createStore()
      expect(artifactIds(store.getState())).toHaveLength(0)

      injectModelIntoDom(model(
        artifact('a2', '2.0.0'),
        artifact('a1', '1.0.0')
      ))
      store.dispatch(loadTree())
        .then(() => {
          expect(artifactIds(store.getState())).toEqual(['a1', 'a2'])
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

  describe('for each loaded dependency', () => {
    it('is presented in alphabetic order', done => {
      const store = createStore()
      expect(dependencyIds(store.getState())).toHaveLength(0)
      injectModelIntoDom(model(
        artifact('a1', '1.2.3', dependency('d2', '1.0.0'), dependency('d1', '2.0.0')),
        artifact('a2', '1.2.3', dependency('d3', '1.0.0'), dependency('d2', '2.0.0'))
      ))
      store.dispatch(loadTree())
        .then(() => {
          expect(dependencyIds(store.getState())).toEqual(['d1', 'd2', 'd3'])
        })
        .then(done, done.fail)
    })
  })
})
