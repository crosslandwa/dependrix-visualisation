import createStore from '../../store'
import { analysisTitle, loadTree } from '../interactions'
import { clearModelFromDom, injectModelIntoDom, project, modelWithTitle } from './helpers'

describe('Analysis title', () => {
  beforeEach(() => {
    clearModelFromDom()
  })

  it('has a default value of Dependrix', () => {
    const store = createStore()
    expect(analysisTitle(store.getState())).toEqual('Dependrix')
  })

  it('can be provided by the injected model', done => {
    const store = createStore()
    injectModelIntoDom(modelWithTitle(
      'A title',
      project('a1', '1.2.3')
    ))
    store.dispatch(loadTree())
      .then(() => {
        expect(analysisTitle(store.getState())).toEqual('A title')
      })
      .then(done, done.fail)
  })
})
