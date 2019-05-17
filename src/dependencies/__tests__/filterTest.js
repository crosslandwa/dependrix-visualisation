import createStore from '../../store'
import {
  artifactIds,
  availableScopes,
  dependencyIds,
  loadTree,
  updateArtifactFilter,
  updateDependencyFilter,
  updateDependencyScopeFilter
} from '../interactions'
import { clearModelFromDom, injectModelIntoDom, artifact, dependency, model } from './helpers'

describe('Filtering', () => {
  beforeEach(() => {
    clearModelFromDom()
  })

  it('of artifacts is done with a fuzzy matching comma separated string', done => {
    const store = createStore()
    injectModelIntoDom(model(
      artifact('a1', '1.0.0'),
      artifact('a2', '2.0.0'),
      artifact('a3', '2.0.0')
    ))

    store.dispatch(loadTree())
      .then(() => {
        expect(artifactIds(store.getState())).toEqual(['a1', 'a2', 'a3'])

        store.dispatch(updateArtifactFilter('a1'))
        expect(artifactIds(store.getState())).toEqual(['a1'])

        store.dispatch(updateArtifactFilter('a'))
        expect(artifactIds(store.getState())).toEqual(['a1', 'a2', 'a3'])

        store.dispatch(updateArtifactFilter('a1, , 3')) // note empty search terms and additional whitespace
        expect(artifactIds(store.getState())).toEqual(['a1', 'a3'])
      })
      .then(done, done.fail)
  })

  it('of dependencies is done with a fuzzy matching comma separated string', done => {
    const store = createStore()
    injectModelIntoDom(model(
      artifact('a1', '1.0.0', dependency('d1', '1.0.0'), dependency('d2', '1.0.0'), dependency('d3', '1.0.0'))
    ))

    store.dispatch(loadTree())
      .then(() => {
        expect(dependencyIds(store.getState())).toEqual(['d1', 'd2', 'd3'])

        store.dispatch(updateDependencyFilter('d1'))
        expect(dependencyIds(store.getState())).toEqual(['d1'])

        store.dispatch(updateDependencyFilter('d'))
        expect(dependencyIds(store.getState())).toEqual(['d1', 'd2', 'd3'])

        store.dispatch(updateDependencyFilter('d1, , 3')) // note empty search terms and additional whitespace
        expect(dependencyIds(store.getState())).toEqual(['d1', 'd3'])
      })
      .then(done, done.fail)
  })

  describe('dependencies by scope', () => {
    it('is possible for the available dependency scopes', done => {
      const store = createStore()
      injectModelIntoDom(model(
        artifact('a1', '1.0.0', dependency('d1', '1.0.0', 'scope1'), dependency('d2', '1.0.0', 'scope2')),
        artifact('a2', '1.0.0', dependency('d1', '1.0.0', 'scope3'), dependency('d3', '2.0.0'/* no scope */))
      ))

      store.dispatch(loadTree())
        .then(() => {
          expect(availableScopes(store.getState())).toEqual(['scope1', 'scope2', 'scope3'])
        })
        .then(done, done.fail)
    })

    it('is supported', done => {
      const store = createStore()
      injectModelIntoDom(model(
        artifact('a1', '1.0.0', dependency('d1', '1.0.0', 'scope1'), dependency('d2', '1.0.0', 'scope2'), dependency('d3', '1.0.0', 'scope3')),
        artifact('a2', '1.0.0', dependency('d1', '1.0.0', 'scope2'))
      ))

      store.dispatch(loadTree())
        .then(() => {
          expect(dependencyIds(store.getState())).toEqual(['d1', 'd2', 'd3'])

          store.dispatch(updateDependencyScopeFilter(['scope1']))
          expect(dependencyIds(store.getState())).toEqual(['d1'])

          store.dispatch(updateDependencyScopeFilter(['scope2']))
          expect(dependencyIds(store.getState())).toEqual(['d1', 'd2'])

          store.dispatch(updateDependencyScopeFilter())
          expect(dependencyIds(store.getState())).toEqual(['d1', 'd2', 'd3'])

          store.dispatch(updateDependencyScopeFilter(['scope1', 'scope2']))
          expect(dependencyIds(store.getState())).toEqual(['d1', 'd2'])
        })
        .then(done, done.fail)
    })
  })
})
