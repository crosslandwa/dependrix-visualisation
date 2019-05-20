import createStore from '../../store'
import {
  projectIds,
  artifactVersion,
  artifactDependencyScope,
  artifactDependencyVersion,
  libraryIds,
  loadTree
} from '../interactions'
import { clearModelFromDom, injectModelIntoDom, project, dependency, model } from './helpers'

describe('Dependency analysis', () => {
  beforeEach(() => {
    clearModelFromDom()
  })

  describe('for each loaded project', () => {
    it('is presented in alphabetic order', done => {
      const store = createStore()
      expect(projectIds(store.getState())).toHaveLength(0)

      injectModelIntoDom(model(
        project('a2', '2.0.0'),
        project('a1', '1.0.0')
      ))
      store.dispatch(loadTree())
        .then(() => {
          expect(projectIds(store.getState())).toEqual(['a1', 'a2'])
        })
        .then(done, done.fail)
    })

    it('describes the project version', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.2.3')
      ))
      store.dispatch(loadTree())
        .then(() => {
          expect(artifactVersion(store.getState(), 'a1')).toEqual('1.2.3')
        })
        .then(done, done.fail)
    })

    it('describes version and scope of each dependent library', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.2.3', dependency('d1', '1.0.0', 'real-scope'), dependency('d2', '2.0.0', 'test-scope'))
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

  describe('for each dependent library', () => {
    it('is presented in alphabetic order', done => {
      const store = createStore()
      expect(libraryIds(store.getState())).toHaveLength(0)
      injectModelIntoDom(model(
        project('a1', '1.2.3', dependency('d2', '1.0.0'), dependency('d1', '2.0.0')),
        project('a2', '1.2.3', dependency('d3', '1.0.0'), dependency('d2', '2.0.0'))
      ))
      store.dispatch(loadTree())
        .then(() => {
          expect(libraryIds(store.getState())).toEqual(['d1', 'd2', 'd3'])
        })
        .then(done, done.fail)
    })
  })
})
