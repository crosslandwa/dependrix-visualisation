import createStore from '../../store'
import { dependencies, loadTree } from '../interactions'
import { clearModelFromDom, injectModelIntoDom, project, dependency, model } from './helpers'

describe('Dependency version comparison', () => {
  beforeEach(() => {
    clearModelFromDom()
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
        expect(dependencies(store.getState(), 'a1', 'd1')).toEqual([
          { id: 'd1', version: '1.0.0', versionLag: 'major', scope: '' }
        ])
        expect(dependencies(store.getState(), 'a2', 'd1')).toEqual([
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
        expect(dependencies(store.getState(), 'a1', 'd1')).toEqual([
          { id: 'd1', version: '1.0.0', versionLag: 'minor', scope: '' }
        ])
        expect(dependencies(store.getState(), 'a2', 'd1')).toEqual([
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
        expect(dependencies(store.getState(), 'a1', 'd1')).toEqual([
          { id: 'd1', version: '1.0.0', versionLag: 'patch', scope: '' }
        ])
        expect(dependencies(store.getState(), 'a2', 'd1')).toEqual([
          { id: 'd1', version: '1.0.1', versionLag: '', scope: '' }
        ])
      })
      .then(done, done.fail)
  })
})
