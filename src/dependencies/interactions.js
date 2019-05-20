import { makeGETRequest } from '../make-request'

const apply = (x, f) => f(x)

// ------ ACTIONS ------
export const loadTree = () => ({ type: 'LOAD_TREE' })
const treeLoadedSuccessfully = data => ({ type: 'TREE_LOAD_SUCCESS', data })
const treeLoadFailed = () => ({ type: 'TREE_LOAD_FAILED' })
export const updateProjectFilter = (search) => ({
  type: 'UPDATE_PROJECT_FILTER',
  search: sanitiseSearch(search)
})
export const updateLibraryFilter = (search) => ({
  type: 'UPDATE_LIBRARY_FILTER',
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

export const projectIds = state => Object.keys(state.projects).filter(bySearchTerms(state.filters.projectSearch)).sort()
export const projectVersion = (state, projectId) => state.projects[projectId].version
const dependencies = (state, projectId) => state.projects[projectId].dependencies
export const dependencyVersion = (state, projectId, libraryId) => apply(
  dependencies(state, projectId)[libraryId],
  dependency => (dependency && dependency.version) || ''
)
export const dependencyScope = (state, projectId, libraryId) => apply(
  dependencies(state, projectId)[libraryId],
  dependency => (dependency && dependency.scope) || ''
)
export const isScopeAllowedByFilter = (state, scope) => state.filters.scope.length
  ? state.filters.scope.includes(scope)
  : true
export const libraryIds = state => {
  const scope = state.filters.scope
  const filteredDependenciesForProject = (acc, projectId) => acc.concat(
    Object.keys(dependencies(state, projectId))
      .filter(libraryId => !scope.length || scope.includes(dependencyScope(state, projectId, libraryId)))
      .filter(bySearchTerms(state.filters.librarySearch))
  )

  return uniques(projectIds(state).reduce(filteredDependenciesForProject, [])).sort()
}

const bySearchTerms = (filters) => filters.length
  ? id => filters.some(term => id.toLowerCase().includes(term))
  : () => true

export const availableScopes = (state) => projectIds(state).reduce(
  (acc, projectId) => uniques(acc.concat(
    Object.keys(dependencies(state, projectId)).map(libraryId => dependencyScope(state, projectId, libraryId))
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

export const projectsReducer = (state = {}, action) => {
  switch (action.type) {
    case 'TREE_LOAD_SUCCESS':
      return action.data.projects
  }
  return state
}

export const filtersReducer = (state = { projectSearch: [], librarySearch: [], scope: [] }, action) => {
  switch (action.type) {
    case 'UPDATE_PROJECT_FILTER':
      return { ...state, projectSearch: action.search }
    case 'UPDATE_LIBRARY_FILTER':
      return { ...state, librarySearch: action.search }
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
