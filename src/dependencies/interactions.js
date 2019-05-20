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

export const artifactIds = state => Object.keys(state.artifacts).filter(bySearchTerms(state.filters.artifacts)).sort()
export const artifactVersion = (state, id) => state.artifacts[id].version
const dependencies = (state, projectId) => state.artifacts[projectId].dependencies
export const artifactDependencyVersion = (state, projectId, libraryId) => apply(
  dependencies(state, projectId)[libraryId],
  dependency => (dependency && dependency.version) || ''
)
export const artifactDependencyScope = (state, projectId, libraryId) => apply(
  dependencies(state, projectId)[libraryId],
  dependency => (dependency && dependency.scope) || ''
)
export const isScopeAllowedByFilter = (state, scope) => state.filters.scope.length
  ? state.filters.scope.includes(scope)
  : true
export const dependencyIds = state => {
  const scope = state.filters.scope
  const filteredDependenciesForProject = (acc, projectId) => acc.concat(
    Object.keys(dependencies(state, projectId))
      .filter(libraryId => !scope.length || scope.includes(artifactDependencyScope(state, projectId, libraryId)))
      .filter(bySearchTerms(state.filters.dependencies))
  )

  return uniques(artifactIds(state).reduce(filteredDependenciesForProject, [])).sort()
}

const bySearchTerms = (filters) => filters.length
  ? id => filters.some(term => id.toLowerCase().includes(term))
  : () => true

export const availableScopes = (state) => artifactIds(state).reduce(
  (acc, projectId) => uniques(acc.concat(
    Object.keys(dependencies(state, projectId)).map(libraryId => artifactDependencyScope(state, projectId, libraryId))
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
