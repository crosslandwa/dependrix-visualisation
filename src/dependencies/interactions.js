import { makeGETRequest } from '../make-request'

const apply = (x, f) => f(x)

// ------ ACTIONS ------
export const loadTree = () => ({ type: 'LOAD_TREE' })
const treeLoadedSuccessfully = data => ({ type: 'TREE_LOAD_SUCCESS', data })
const treeLoadFailed = () => ({ type: 'TREE_LOAD_FAILED' })

// ------ SELECTORS ------
export const hasTreeLoadBeenAttempted = state => !!state.tree.loadStatus
export const hasTreeLoadedSuccessfully = state => state.tree.loadStatus === 'success'

export const artifactIds = state => Object.keys(state.artifacts)
export const artifactVersion = (state, id) => state.artifacts[id].version
export const artifactDependencyVersion = (state, id, dependencyId) => apply(
  state.artifacts[id].dependencies[dependencyId],
  dep => (dep && dep.version) || ''
)
export const artifactDependencyScope = (state, id, dependencyId) => apply(
  state.artifacts[id].dependencies[dependencyId],
  dep => (dep && dep.scope) || ''
)
export const dependencyIds = state => Object.keys(state.dependencies)

// ------ REDUCERS ------
export const treeLoadReducer = (state = { loadStatus: false }, action) => {
  switch (action.type) {
    case 'TREE_LOAD_SUCCESS':
      return { ...state, loadStatus: 'success' }
    case 'TREE_LOAD_FAILED':
      return { ...state, loadStatus: 'failed' }
  }
  return state
}

export const artifactsReducer = (state = {}, action) => {
  switch (action.type) {
    case 'TREE_LOAD_SUCCESS':
      return action.data.artifacts
  }
  return state
}

export const dependenciesReducer = (state = {}, action) => {
  switch (action.type) {
    case 'TREE_LOAD_SUCCESS':
      return action.data.dependencies
  }
  return state
}

// ------ MIDDLEWARE ------
export function treeLoadMiddleware (store) {
  return (next) => (action) => {
    switch (action.type) {
      case 'LOAD_TREE':
        const dispatchLoadedTree = data => {
          next(treeLoadedSuccessfully(data))
        }
        const dispatchLoadFailure = (error) => {
          console.error(error.message)
          next(treeLoadFailed())
        }

        return new Promise((resolve, reject) => apply(
          document.getElementById('modelled-dependencies'),
          element => element
            ? resolve(JSON.parse(element.innerHTML))
            : reject(new Error('Could not find modelled-dependencies in DOM'))
        ))
          .catch(e => makeGETRequest('modelled-dependencies.json').then(JSON.parse)) // load from server if not in DOM
          .then(dispatchLoadedTree, dispatchLoadFailure)
    }
    return next(action)
  }
}
