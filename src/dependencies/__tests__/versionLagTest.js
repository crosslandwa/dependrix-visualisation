import createStore from '../../store'
import { filteredDependencyMap, filteredProjectIds, latestLibraryVersions, loadTree, updateVersionLagFilter } from '../interactions'
import { clearModelFromDom, injectModelIntoDom, project, dependency, model } from './helpers'

const dependencies = (store, projectId, libraryId) => {
  const map = filteredDependencyMap(store.getState(), [projectId])
  return map[projectId][libraryId]
}

describe('Dependency version comparison', () => {
  beforeEach(() => {
    clearModelFromDom()
  })

  it('identifies the latest version of each dependent library', done => {
    const store = createStore()
    injectModelIntoDom(model(
      project('a1', '1.2.3', dependency('d1', '1.0.0'), dependency('d1', '2.0.0'), dependency('d2', '3.0.0'))
    ))
    store.dispatch(loadTree())
      .then(() => {
        expect(latestLibraryVersions(store.getState())).toEqual({
          d1: '2.0.0',
          d2: '3.0.0'
        })
      })
      .then(done, done.fail)
  })

  it('identifies when a dependent library is a major version behind the version used in another project', done => {
    const store = createStore()
    injectModelIntoDom(model(
      project('a1', '1.2.3', dependency('d1', '1.0.0')),
      project('a2', '1.2.3', dependency('d1', '2.0.0')),
      project('a3', '1.2.3', dependency('d1', '1.1.0')),
      project('a4', '1.2.3', dependency('d1', '1.0.1'))
    ))
    store.dispatch(loadTree())
      .then(() => {
        expect(dependencies(store, 'a1', 'd1')).toEqual([
          { id: 'd1', version: '1.0.0', versionLag: 'major', scope: '' }
        ])
        expect(dependencies(store, 'a2', 'd1')).toEqual([
          { id: 'd1', version: '2.0.0', versionLag: '', scope: '' }
        ])
      })
      .then(done, done.fail)
  })

  it('identifies when a dependent library is a minor version behind the version used in another project', done => {
    const store = createStore()
    injectModelIntoDom(model(
      project('a1', '1.2.3', dependency('d1', '1.0.0')),
      project('a2', '1.2.3', dependency('d1', '1.1.0')),
      project('a3', '1.2.3', dependency('d1', '1.0.1'))
    ))
    store.dispatch(loadTree())
      .then(() => {
        expect(dependencies(store, 'a1', 'd1')).toEqual([
          { id: 'd1', version: '1.0.0', versionLag: 'minor', scope: '' }
        ])
        expect(dependencies(store, 'a2', 'd1')).toEqual([
          { id: 'd1', version: '1.1.0', versionLag: '', scope: '' }
        ])
      })
      .then(done, done.fail)
  })

  it('identifies when a dependent library is a patch version behind the version used in another project', done => {
    const store = createStore()
    injectModelIntoDom(model(
      project('a1', '1.2.3', dependency('d1', '1.0.0')),
      project('a2', '1.2.3', dependency('d1', '1.0.1'))
    ))
    store.dispatch(loadTree())
      .then(() => {
        expect(dependencies(store, 'a1', 'd1')).toEqual([
          { id: 'd1', version: '1.0.0', versionLag: 'patch', scope: '' }
        ])
        expect(dependencies(store, 'a2', 'd1')).toEqual([
          { id: 'd1', version: '1.0.1', versionLag: '', scope: '' }
        ])
      })
      .then(done, done.fail)
  })

  describe('supports filtering', () => {
    it('and shows all libraries and projects by default', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.2.3', dependency('d1', '2.1.1'), dependency('d1', '1.0.0'), dependency('d1', '2.0.0'), dependency('d1', '2.1.0')),
        project('a2', '1.2.3')
      ))
      store.dispatch(loadTree())
        .then(() => {
          expect(dependencies(store, 'a1', 'd1')).toHaveLength(4)
          expect(filteredProjectIds(store.getState())).toHaveLength(2)
        })
        .then(done, done.fail)
    })

    it('to only show projects with dependencis on libraries that have the specified version lag', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.2.3', dependency('d1', '2.1.1')),
        project('a2', '1.2.3', dependency('d1', '1.1.1')),
        project('a3', '1.2.3', dependency('d1', '1.1.1'))
      ))
      store.dispatch(loadTree())
        .then(() => {
          store.dispatch(updateVersionLagFilter(['major']))
          expect(filteredProjectIds(store.getState())).toEqual(['a2', 'a3'])
        })
        .then(done, done.fail)
    })

    it('to only show libraries with specified version lag', done => {
      const store = createStore()
      injectModelIntoDom(model(
        project('a1', '1.2.3', dependency('d1', '2.1.1'), dependency('d1', '1.0.0'), dependency('d1', '2.0.0'), dependency('d1', '2.1.0'))
      ))
      store.dispatch(loadTree())
        .then(() => {
          store.dispatch(updateVersionLagFilter(['major']))
          expect(dependencies(store, 'a1', 'd1')).toEqual([
            { id: 'd1', version: '1.0.0', versionLag: 'major', scope: '' }
          ])

          store.dispatch(updateVersionLagFilter(['major', 'minor']))
          expect(dependencies(store, 'a1', 'd1')).toEqual([
            { id: 'd1', version: '1.0.0', versionLag: 'major', scope: '' },
            { id: 'd1', version: '2.0.0', versionLag: 'minor', scope: '' }
          ])
        })
        .then(done, done.fail)
    })
  })
})
