import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import {
  dependencyScopesReducer as dependencyScopes,
  projectsReducer as projects,
  filtersReducer as filters,
  treeLoadReducer as tree,
  treeLoadMiddleware
} from './dependencies/interactions'

const reducer = combineReducers({ dependencyScopes, projects, filters, tree })

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

function createAppStore () {
  const middlewares = [treeLoadMiddleware]
  return createStore(
    reducer,
    composeEnhancers(
      applyMiddleware(...middlewares)
    )
  )
}

export default createAppStore
