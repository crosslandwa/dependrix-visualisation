import createStore from '../../store'
import { hasTreeLoadBeenAttempted, hasTreeLoadedSuccessfully, loadTree } from '../interactions'

describe('Tree loading', () => {
  it('initialises with no tree loaded', () => {
    const store = createStore()
    expect(hasTreeLoadBeenAttempted(store.getState())).toEqual(false)
    expect(hasTreeLoadedSuccessfully(store.getState())).toEqual(false)
  })

  it('reports successful tree loading', () => {
    const store = createStore()
    store.dispatch(loadTree())

    expect(hasTreeLoadBeenAttempted(store.getState())).toEqual(true)
    expect(hasTreeLoadedSuccessfully(store.getState())).toEqual(true)
  })
})
