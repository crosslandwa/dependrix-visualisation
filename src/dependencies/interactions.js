import { makeGETRequest } from '../make-request'

const apply = (x, f) => f(x)

// ------ ACTIONS ------
export const loadTree = () => ({ type: 'LOAD_TREE' })
const treeLoadedSuccessfully = data => ({ type: 'TREE_LOAD_SUCCESS', data })
const treeLoadFailed = () => ({ type: 'TREE_LOAD_FAILED' })
export const updateArtifactFilter = (search) => ({
  type: 'UPDATE_ARTIFACT_FILTER',
  search: sanitiseSearch(search)
})
export const updateDependencyFilter = (search) => ({
  type: 'UPDATE_DEPENDENCY_FILTER',
  search: sanitiseSearch(search)
})
export const updateDependencyScopeFilter = (scope = []) => ({
  type: 'UPDATE_DEPENDENCY_SCOPE_FILTER',
  scope
})

const sanitiseSearch = search => search.toLowerCase().split(',').map(x => x.trim()).filter(x => x)

// ------ SELECTORS ------
export const hasTreeLoadBeenAttempted = state => !!state.tree.loadStatus
export const hasTreeLoadedSuccessfully = state => state.tree.loadStatus === 'success'

export const artifactIds = state => filterBySearchTerms(Object.keys(state.artifacts), state.filters.artifacts).sort()
export const artifactVersion = (state, id) => state.artifacts[id].version
export const artifactDependencyVersion = (state, id, dependencyId) => apply(
  state.artifacts[id].dependencies[dependencyId],
  dep => (dep && dep.version) || ''
)
export const artifactDependencyScope = (state, id, dependencyId) => apply(
  state.artifacts[id].dependencies[dependencyId],
  dep => (dep && dep.scope) || ''
)
export const dependencyIds = state => filterByScope(
  state,
  filterBySearchTerms(Object.keys(state.dependencies), state.filters.dependencies)
).sort()

const filterBySearchTerms = (ids, search) => search.length
  ? ids.filter(id => search.some(term => id.toLowerCase().includes(term)))
  : ids

const filterByScope = (state, ids) => apply(
  state.filters.scope,
  scope => scope.length
    ? ids.filter(dependencyId => artifactIds(state).some(id => scope.includes(artifactDependencyScope(state, id, dependencyId))))
    : ids
)

export const availableScopes = (state) => artifactIds(state).reduce(
  (acc, id) => uniques(acc.concat(
    Object.keys(state.artifacts[id].dependencies).map(depId => artifactDependencyScope(state, id, depId))
  )).filter(x => x),
  []
)

const uniques = (arr = []) => [...(new Set(arr))]

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

export const filtersReducer = (state = { artifacts: [], dependencies: [], scope: [] }, action) => {
  switch (action.type) {
    case 'UPDATE_ARTIFACT_FILTER':
      return { ...state, artifacts: action.search }
    case 'UPDATE_DEPENDENCY_FILTER':
      return { ...state, dependencies: action.search }
    case 'UPDATE_DEPENDENCY_SCOPE_FILTER':
      return { ...state, scope: action.scope }
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
