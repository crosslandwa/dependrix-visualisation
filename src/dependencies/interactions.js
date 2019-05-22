import { makeGETRequest } from '../make-request'

const apply = (x, f) => f(x)
const uniques = (arr = []) => [...(new Set(arr))]
const passAlways = () => true

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
export const updateDependencyScopeFilter = (selectedScopes = []) => ({
  type: 'UPDATE_DEPENDENCY_SCOPE_FILTER',
  selectedScopes
})

const sanitiseSearch = search => search.toLowerCase().split(',').map(x => x.trim()).filter(x => x)

// ------ SELECTORS ------
export const hasTreeLoadBeenAttempted = state => !!state.tree.loadStatus
export const hasTreeLoadedSuccessfully = state => state.tree.loadStatus === 'success'

export const projectIds = state => Object.keys(state.projects).filter(isProjectAllowedByFilters(state)).sort()
export const projectVersion = (state, projectId) => state.projects[projectId].version
const dependencyMapFor = (state, projectId) => state.projects[projectId].dependencies
export const dependencies = (state, projectId, libraryId) => {
  const dependencyFromModel = dependencyMapFor(state, projectId)[libraryId]
  return (dependencyFromModel && isDependencyAllowedByFilters(state, projectId)(libraryId))
    ? [{
      scope: dependencyFromModel.scope,
      version: dependencyFromModel.version
    }] : []
}
const dependencyScope = (state, projectId, libraryId) => apply(
  dependencyMapFor(state, projectId)[libraryId],
  dependency => (dependency && dependency.scope) || ''
)
export const availableScopes = (state) => state.dependencyScopes
export const libraryIds = state => {
  return projectIds(state).reduce(
    (acc, projectId) => uniques(acc.concat(
      Object.keys(dependencyMapFor(state, projectId)).filter(isDependencyAllowedByFilters(state, projectId))
    )),
    []
  ).sort()
}

const isProjectAllowedByFilters = (state) => {
  const bySearch = bySearchTerms(state.filters.projectSearch)
  const dependencyFiltersActive = !!(state.filters.librarySearch.length || state.filters.selectedScopes.length)
  const byDependencies = dependencyFiltersActive
    ? projectId => Object.keys(state.projects[projectId].dependencies).some(isDependencyAllowedByFilters(state, projectId))
    : passAlways
  return projectId => bySearch(projectId) && byDependencies(projectId)
}

const isDependencyAllowedByFilters = (state, projectId) => {
  const bySearch = bySearchTerms(state.filters.librarySearch)
  const byScope = state.filters.selectedScopes.length
    ? libraryId => state.filters.selectedScopes.includes(dependencyScope(state, projectId, libraryId))
    : passAlways
  return libraryId => bySearch(libraryId) && byScope(libraryId)
}

const bySearchTerms = (filters) => filters.length
  ? id => filters.some(term => id.toLowerCase().includes(term))
  : passAlways

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

export const dependencyScopesReducer = (state = [], action) => {
  switch (action.type) {
    case 'TREE_LOAD_SUCCESS':
      return action.data.dependencyScopes
  }
  return state
}

export const filtersReducer = (state = { projectSearch: [], librarySearch: [], selectedScopes: [] }, action) => {
  switch (action.type) {
    case 'UPDATE_PROJECT_FILTER':
      return { ...state, projectSearch: action.search }
    case 'UPDATE_LIBRARY_FILTER':
      return { ...state, librarySearch: action.search }
    case 'UPDATE_DEPENDENCY_SCOPE_FILTER':
      return { ...state, selectedScopes: action.selectedScopes }
  }
  return state
}

// ------ MIDDLEWARE ------
export function treeLoadMiddleware (store) {
  return (next) => (action) => {
    switch (action.type) {
      case 'LOAD_TREE':
        const dispatchLoadedTree = data => {
          next(treeLoadedSuccessfully({
            projects: data.projects,
            dependencyScopes: parseScopes(data)
          }))
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

const parseScopes = data => Object.keys(data.projects).reduce(
  (acc, projectId) => uniques(acc.concat(
    Object.keys(data.projects[projectId].dependencies).reduce(
      (inner, libraryId) => inner.concat(data.projects[projectId].dependencies[libraryId].scope),
      []
    )
  )),
  []
).filter(x => x)
