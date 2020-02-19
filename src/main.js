import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import createStore from './store'
import { loadTree } from './dependencies/interactions'

const store = createStore()

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('app')
)

// dispatch must happen async to ensure initial render occurs before attempt to load/parse data
setTimeout(
  () => store.dispatch(loadTree()),
  100
)
