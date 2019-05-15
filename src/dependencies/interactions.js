// ------ ACTIONS ------
export const loadTree = () => ({ type: 'LOAD_TREE' })
const treeLoadedSuccessfully = () => ({ type: 'TREE_LOAD_SUCCESS' })

// ------ SELECTORS ------
export const hasTreeLoadBeenAttempted = state => state.tree.loadAttempted
export const hasTreeLoadedSuccessfully = state => state.tree.loadAttempted

// ------ REDUCERS ------
export const treeLoadReducer = (state = { loadAttempted: false }, action) => {
  switch (action.type) {
    case 'TREE_LOAD_SUCCESS':
      return { ...state, loadAttempted: true }
  }
  return state
}

// ------ MIDDLEWARE ------
export function treeLoadMiddleware (store) {
  return (next) => (action) => {
    switch (action.type) {
      case 'LOAD_TREE':
        return next(treeLoadedSuccessfully())
    }
    return next(action)
  }
}
