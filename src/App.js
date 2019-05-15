import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import LoadSummary from './dependencies/LoadSummary'
import DependencyMatrix from './dependencies/DependencyMatrix'

const mapStateToProps = state => ({})
const mapDispatchToProps = {}

const App = props => (
  <React.Fragment>
    <h1>Dependrix</h1>
    <LoadSummary />
    <DependencyMatrix />
  </React.Fragment>
)

export default connect(mapStateToProps, mapDispatchToProps)(App)
