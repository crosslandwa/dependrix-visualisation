import createStore from '../../store'
import {
  filteredDependencyMap,
  libraryIds,
  loadTree,
  projectIds,
  projectVersion
} from '../interactions'
import { clearModelFromDom, injectModelIntoDom, project, dependency, model } from './helpers'

const dependencies = (store, projectId, libraryId) => {
  const map = filteredDependencyMap(store.getState(), [projectId])
  return map[projectId][libraryId]
}

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
          expect(projectVersion(store.getState(), 'a1')).toEqual('1.2.3')
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
          expect(dependencies(store, 'a1', 'd1')).toEqual([
            { id: 'd1', version: '1.0.0', scope: 'real-scope', versionLag: '' }
          ])
          expect(dependencies(store, 'a1', 'd2')).toEqual([
            { id: 'd2', version: '2.0.0', scope: 'test-scope', versionLag: '' }
          ])
          expect(dependencies(store, 'a1', 'nonsenseDependencyId')).not.toBeDefined()
        })
        .then(done, done.fail)
    })

    it('describes where dependencies exist on multiple versions of the same library', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.2.3', dependency('d1', '1.0.0', 'real-scope'), dependency('d1', '2.0.0', 'test-scope'))
      ))
      store.dispatch(loadTree())
        .then(() => {
          expect(dependencies(store, 'a1', 'd1')).toEqual([
            { id: 'd1', version: '1.0.0', scope: 'real-scope', versionLag: 'major' },
            { id: 'd1', version: '2.0.0', scope: 'test-scope', versionLag: '' }
          ])
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
