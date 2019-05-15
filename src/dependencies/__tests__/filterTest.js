import createStore from '../../store'
import { artifactIds, dependencyIds, loadTree, updateArtifactFilter, updateDependencyFilter } from '../interactions'
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
})
