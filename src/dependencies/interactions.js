import { makeGETRequest } from '../make-request'
import { newerOf, versionLag } from './semver-compare'

const apply = (x, f) => f(x)
const uniques = (arr = []) => [...(new Set(arr))]
const passAlways = () => true

// ------ ACTIONS ------
export const loadTree = () => ({ type: 'LOAD_TREE' })
export const toggleDependencyScopeFilter = (scope) => ({ type: 'TOGGLE_DEPENDENCY_SCOPE_FILTER', scope })
export const toggleVersionLagFilter = (scope) => ({ type: 'TOGGLE_VERSION_SCOPE_FILTER', scope })
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
const updateDependencyScopeFilter = (selectedScopes = []) => ({
  type: 'UPDATE_DEPENDENCY_SCOPE_FILTER',
  selectedScopes
})
const updateVersionLagFilter = (selectedVersionLags = []) => ({
  type: 'UPDATE_VERSION_LAG_FILTER',
  selectedVersionLags
})

const sanitiseSearch = search => search.toLowerCase().split(',').map(x => x.trim()).filter(x => x)

// ------ SELECTORS ------
export const hasTreeLoadBeenAttempted = state => !!state.tree.loadStatus
export const hasTreeLoadedSuccessfully = state => state.tree.loadStatus === 'success'

export const analysisTitle = state => state.analysis.title

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
const selectedScopes = (state) => state.filters.selectedScopes
const selectedVersionLags = (state) => state.filters.selectedVersionLags
const isProjectAllowedByFilters = (state) => {
  const bySearch = bySearchTerms(state.filters.projectSearch)
  const dependencyFiltersActive = !!(state.filters.librarySearch.length || selectedScopes(state).length || selectedVersionLags(state).length)
  const byDependencies = dependencyFiltersActive
    ? projectId => projectDependencies(state, projectId).some(isDependencyAllowedByFilters(state))
    : passAlways
  return projectId => bySearch(projectId) && byDependencies(projectId)
}

const isDependencyAllowedByFilters = (state) => {
  const bySearch = bySearchTerms(state.filters.librarySearch)
  const byScope = selectedScopes(state).length
    ? scope => selectedScopes(state).includes(scope)
    : passAlways
  const byVersionLag = selectedVersionLags(state).length
    ? versionLag => selectedVersionLags(state).includes(versionLag)
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

export const analysisReducer = (state = { title: 'Dependrix' }, action) => {
  switch (action.type) {
    case 'TREE_LOAD_SUCCESS':
      return action.data.analysis ? { title: action.data.analysis.title } : state
  }
  return state
}

// ------ MIDDLEWARE ------
export function treeLoadMiddleware ({ getState }) {
  return (next) => (action) => {
    switch (action.type) {
      case 'LOAD_TREE':
        const dispatchLoadedTree = data => {
          next(treeLoadedSuccessfully({
            analysis: data.analysis,
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
      case 'TOGGLE_DEPENDENCY_SCOPE_FILTER':
        const currentScopes = selectedScopes(getState())
        const updatedScopes = currentScopes.includes(action.scope)
          ? currentScopes.filter(scope => scope !== action.scope)
          : currentScopes.concat(action.scope)
        return next(updateDependencyScopeFilter(updatedScopes))
      case 'TOGGLE_VERSION_SCOPE_FILTER':
        const currentVersionLags = selectedVersionLags(getState())
        const updatedVersionLags = currentVersionLags.includes(action.scope)
          ? currentVersionLags.filter(lag => lag !== action.scope)
          : currentVersionLags.concat(action.scope)
        return next(updateVersionLagFilter(updatedVersionLags))
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
