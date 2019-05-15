import createStore from '../../store'
import { hasTreeLoadBeenAttempted, hasTreeLoadedSuccessfully, loadTree } from '../interactions'
import { makeGETRequest as mockGETRequest } from '../../make-request'
import { clearModelFromDom, injectModelIntoDom, model } from './helpers'

jest.mock('../../make-request')

describe('Tree loading', () => {
  beforeEach(() => {
    mockGETRequest.mockImplementation(() => Promise.reject(new Error('(mock) GET request failed')))
    clearModelFromDom()
  })

  it('initialises with no tree loaded', () => {
    const store = createStore()
    expect(hasTreeLoadBeenAttempted(store.getState())).toEqual(false)
    expect(hasTreeLoadedSuccessfully(store.getState())).toEqual(false)
  })

  it('reports successful tree loading when model is in the DOM', done => {
    const store = createStore()

    injectModelIntoDom(model())

    store.dispatch(loadTree())
      .then(() => {
        expect(hasTreeLoadBeenAttempted(store.getState())).toEqual(true)
        expect(hasTreeLoadedSuccessfully(store.getState())).toEqual(true)
      })
      .then(done, done.fail)
  })

  it('reports successful tree loading when model is available over HTTP', done => {
    const store = createStore()

    mockGETRequest.mockImplementation(() => Promise.resolve('{"artifacts":{}, "dependencies":{}}'))

    store.dispatch(loadTree())
      .then(() => {
        expect(hasTreeLoadBeenAttempted(store.getState())).toEqual(true)
        expect(hasTreeLoadedSuccessfully(store.getState())).toEqual(true)
      })
      .then(done, done.fail)
  })

  it('reports unsuccessful tree loading when model is not in DOM or available over HTTP', done => {
    const store = createStore()
    store.dispatch(loadTree())
      .then(() => {
        expect(hasTreeLoadBeenAttempted(store.getState())).toEqual(true)
        expect(hasTreeLoadedSuccessfully(store.getState())).toEqual(false)
      })
      .then(done, done.fail)
  })
})
