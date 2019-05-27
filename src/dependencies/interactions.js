import { makeGETRequest } from '../make-request'
import { newerOf, versionLag } from './semver-compare'

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
export const updateVersionLagFilter = (selectedVersionLags = []) => ({
  type: 'UPDATE_VERSION_LAG_FILTER',
  selectedVersionLags
})

const sanitiseSearch = search => search.toLowerCase().split(',').map(x => x.trim()).filter(x => x)

// ------ SELECTORS ------
export const hasTreeLoadBeenAttempted = state => !!state.tree.loadStatus
export const hasTreeLoadedSuccessfully = state => state.tree.loadStatus === 'success'

export const filteredProjectIds = state => Object.keys(state.projects).filter(isProjectAllowedByFilters(state)).sort()
export const projectVersion = (state, projectId) => state.projects[projectId].version
const projectDependencies = (state, projectId) => state.projects[projectId].dependencies

export const filteredDependencyMap = (state, projectIds) => {
  const dependencyFilter = isDependencyAllowedByFilters(state)
  return projectIds.reduce(
    (acc, projectId) => ({
      ...acc,
      [projectId]: projectDependencies(state, projectId).reduce(
        (filtered, dependency) => ({
          ...filtered,
          [dependency.id]: (filtered[dependency.id] || []).concat([dependency].filter(dependencyFilter))
        }),
        {}
      )
    }),
    {}
  )
}
export const latestLibraryVersions = state => state.latestLibraryVersions
export const availableVersionLags = (state) => ['major', 'minor', 'patch']
export const availableScopes = (state) => state.dependencyScopes
export const filteredLibraryIds = (state, projectIds) => {
  const libFilter = isDependencyAllowedByFilters(state)
  return projectIds.reduce((acc, projectId) => uniques(
    acc.concat(projectDependencies(state, projectId)
      .filter(libFilter)
      .map(dependency => dependency.id)
    )
  ), []).sort()
}

const isProjectAllowedByFilters = (state) => {
  const bySearch = bySearchTerms(state.filters.projectSearch)
  const dependencyFiltersActive = !!(state.filters.librarySearch.length || state.filters.selectedScopes.length || state.filters.selectedVersionLags.length)
  const byDependencies = dependencyFiltersActive
    ? projectId => projectDependencies(state, projectId).some(isDependencyAllowedByFilters(state))
    : passAlways
  return projectId => bySearch(projectId) && byDependencies(projectId)
}

const isDependencyAllowedByFilters = (state) => {
  const bySearch = bySearchTerms(state.filters.librarySearch)
  const byScope = state.filters.selectedScopes.length
    ? scope => state.filters.selectedScopes.includes(scope)
    : passAlways
  const byVersionLag = state.filters.selectedVersionLags.length
    ? versionLag => state.filters.selectedVersionLags.includes(versionLag)
    : passAlways
  return dependency => bySearch(dependency.id) && byScope(dependency.scope) && byVersionLag(dependency.versionLag)
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
      return Object.keys(action.data.projects).reduce(
        (acc, projectId) => ({
          ...acc,
          [projectId]: {
            version: action.data.projects[projectId].version,
            dependencies: action.data.projects[projectId].dependencies.map(
              ({ id, version, scope = '' }) => ({
                id,
                version,
                scope,
                versionLag: versionLag(version, action.data.latestLibraryVersions[id])
              })
            )
          }
        }),
        {}
      )
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

export const latestLibraryVersionsReducer = (state = {}, action) => {
  switch (action.type) {
    case 'TREE_LOAD_SUCCESS':
      return action.data.latestLibraryVersions
  }
  return state
}

export const filtersReducer = (state = { projectSearch: [], librarySearch: [], selectedScopes: [], selectedVersionLags: [] }, action) => {
  switch (action.type) {
    case 'UPDATE_PROJECT_FILTER':
      return { ...state, projectSearch: action.search }
    case 'UPDATE_LIBRARY_FILTER':
      return { ...state, librarySearch: action.search }
    case 'UPDATE_DEPENDENCY_SCOPE_FILTER':
      return { ...state, selectedScopes: action.selectedScopes }
    case 'UPDATE_VERSION_LAG_FILTER':
      return { ...state, selectedVersionLags: action.selectedVersionLags }
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
            dependencyScopes: parseScopes(data),
            latestLibraryVersions: parseLatestLibraryVersions(data)
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
    data.projects[projectId].dependencies.map(dependency => dependency.scope)
  )),
  []
).filter(x => x)

const parseLatestLibraryVersions = data => Object.keys(data.projects).reduce(
  (latestVersions, projectId) => data.projects[projectId].dependencies.reduce(
    (acc, { id, version }) => ({
      ...acc,
      [id]: newerOf(acc[id], version)
    }),
    latestVersions
  ),
  {}
)
