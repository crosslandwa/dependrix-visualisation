import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import {
  artifactsReducer as artifacts,
  dependenciesReducer as dependencies,
  filtersReducer as filters,
  treeLoadReducer as tree,
  treeLoadMiddleware
} from './dependencies/interactions'

const reducer = combineReducers({ artifacts, dependencies, filters, tree })

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
