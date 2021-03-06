import createStore from '../../store'
import {
  availableScopes,
  filteredDependencyMap,
  filteredLibraryIds,
  filteredProjectIds,
  loadTree,
  toggleDependencyScopeFilter,
  updateLibraryFilter,
  updateProjectFilter
} from '../interactions'
import { clearModelFromDom, injectModelIntoDom, project, dependency, model } from './helpers'

const dependencies = (store, projectId, libraryId) => {
  const map = filteredDependencyMap(store.getState(), [projectId])
  return map[projectId][libraryId]
}

describe('Filtering', () => {
  beforeEach(() => {
    clearModelFromDom()
  })

  it('of projects is done with a fuzzy matching comma separated string', done => {
    const store = createStore()
    injectModelIntoDom(model(
      project('a1', '1.0.0'),
      project('a2', '2.0.0'),
      project('a3', '2.0.0')
    ))

    store.dispatch(loadTree())
      .then(() => {
        expect(filteredProjectIds(store.getState())).toEqual(['a1', 'a2', 'a3'])

        store.dispatch(updateProjectFilter('a1'))
        expect(filteredProjectIds(store.getState())).toEqual(['a1'])

        store.dispatch(updateProjectFilter('a'))
        expect(filteredProjectIds(store.getState())).toEqual(['a1', 'a2', 'a3'])

        store.dispatch(updateProjectFilter('a1, , 3')) // note empty search terms and additional whitespace
        expect(filteredProjectIds(store.getState())).toEqual(['a1', 'a3'])
      })
      .then(done, done.fail)
  })

  describe('of libraries', () => {
    it('is done with a fuzzy matching comma separated string', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.0.0', dependency('d1', '1.0.0'), dependency('d2', '1.0.0'), dependency('d3', '1.0.0'))
      ))

      store.dispatch(loadTree())
        .then(() => {
          expect(filteredLibraryIds(store.getState(), ['a1'])).toEqual(['d1', 'd2', 'd3'])

          store.dispatch(updateLibraryFilter('d1'))
          expect(filteredLibraryIds(store.getState(), ['a1'])).toEqual(['d1'])

          store.dispatch(updateLibraryFilter('d'))
          expect(filteredLibraryIds(store.getState(), ['a1'])).toEqual(['d1', 'd2', 'd3'])

          store.dispatch(updateLibraryFilter('d1, , 3')) // note empty search terms and additional whitespace
          expect(filteredLibraryIds(store.getState(), ['a1'])).toEqual(['d1', 'd3'])
        })
        .then(done, done.fail)
    })

    it('causes projects with no dependencies to be excluded', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.0.0', dependency('d1', '1.0.0')),
        project('a2', '1.0.0')
      ))

      store.dispatch(loadTree())
        .then(() => {
          expect(filteredProjectIds(store.getState())).toEqual(['a1', 'a2'])

          store.dispatch(updateLibraryFilter('d1'))
          expect(filteredProjectIds(store.getState())).toEqual(['a1'])
        })
        .then(done, done.fail)
    })
  })

  describe('libraries by dependency scope', () => {
    it('is possible for all the existing scopes', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.0.0', dependency('d1', '1.0.0', 'scope1'), dependency('d2', '1.0.0', 'scope2')),
        project('a2', '1.0.0', dependency('d1', '1.0.0', 'scope3'), dependency('d3', '2.0.0'/* no scope */))
      ))

      store.dispatch(loadTree())
        .then(() => {
          expect(availableScopes(store.getState())).toEqual(['scope1', 'scope2', 'scope3'])
        })
        .then(done, done.fail)
    })

    it('is supported for a single scope', done => {
      const { dispatch, getState } = createStore()
      injectModelIntoDom(model(
        project('a1', '1.0.0', dependency('d1', '1.0.0', 'scope1'), dependency('d2', '1.0.0', 'scope2'), dependency('d3', '1.0.0', 'scope2'))
      ))

      dispatch(loadTree())
        .then(() => {
          dispatch(toggleDependencyScopeFilter('scope2')) // turn on scope2 filtering
          expect(filteredLibraryIds(getState(), ['a1'])).toEqual(['d2', 'd3'])

          dispatch(toggleDependencyScopeFilter('scope2')) // turn off scope2 filtering
          expect(filteredLibraryIds(getState(), ['a1'])).toEqual(['d1', 'd2', 'd3'])
        })
        .then(done, done.fail)
    })

    it('is supported for a multiple scopes at the same time', done => {
      const { dispatch, getState } = createStore()
      injectModelIntoDom(model(
        project('a1', '1.0.0', dependency('d1', '1.0.0', 'scope1'), dependency('d2', '1.0.0', 'scope2'), dependency('d3', '1.0.0', 'scope3')),
        project('a2', '1.0.0', dependency('d4', '1.0.0', 'scope2'))
      ))

      dispatch(loadTree())
        .then(() => {
          dispatch(toggleDependencyScopeFilter('scope1')) // turn on 'scope1' filtering
          dispatch(toggleDependencyScopeFilter('scope2')) // turn on 'scope1' filtering
          expect(filteredLibraryIds(getState(), ['a1', 'a2'])).toEqual(['d1', 'd2', 'd4'])

          dispatch(toggleDependencyScopeFilter('scope1')) // remove 'scope1' from filters
          expect(filteredLibraryIds(getState(), ['a1', 'a2'])).toEqual(['d2', 'd4'])

          dispatch(toggleDependencyScopeFilter('scope1')) // add 'scope1' back into filters
          expect(filteredLibraryIds(getState(), ['a1', 'a2'])).toEqual(['d1', 'd2', 'd4'])
        })
        .then(done, done.fail)
    })

    it('prevents dependencies being reported that do not meet the filter criteria', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.0.0', dependency('d1', '1.0.0', 'scope1'), dependency('d2', '1.0.0', 'scope2'), dependency('d3', '1.0.0', 'scope3')),
        project('a2', '1.0.0', dependency('d4', '1.0.0', 'scope2'))
      ))

      store.dispatch(loadTree())
        .then(() => {
          expect(dependencies(store, 'a1', 'd1')).toHaveLength(1)
          expect(dependencies(store, 'a1', 'd3')).toHaveLength(1)
          expect(dependencies(store, 'a2', 'd4')).toHaveLength(1)

          store.dispatch(toggleDependencyScopeFilter('scope1'))
          store.dispatch(toggleDependencyScopeFilter('scope2'))
          expect(dependencies(store, 'a1', 'd1')).toHaveLength(1)
          expect(dependencies(store, 'a1', 'd3')).toHaveLength(0)
          expect(dependencies(store, 'a2', 'd4')).toHaveLength(1)
        })
        .then(done, done.fail)
    })
  })
})
