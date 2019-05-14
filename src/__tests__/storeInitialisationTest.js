import createStore from '../store'

describe('Store', () => {
  const store = createStore()

  it('initialises with an empty state', () => {
    expect(store.getState()).toEqual({})
  })
})
