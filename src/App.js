import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import LoadSummary from './dependencies/LoadSummary'
import DependencyMatrix from './dependencies/DependencyMatrix'
import ProjectFilter from './filter/ProjectFilter'
import LibraryFilter from './filter/LibraryFilter'
import ScopeFilter from './filter/ScopeFilter'

const mapStateToProps = state => ({})
const mapDispatchToProps = {}

const App = props => (
  <React.Fragment>
    <h1 class="header--xl">Dependrix</h1>
    <details class="details" open>
      <summary class="details__summary">Filters</summary>
      <div class="details__reveal">
        <ProjectFilter />
        <LibraryFilter />
        <ScopeFilter />
      </div>
    </details>
    <LoadSummary />
    <DependencyMatrix />
  </React.Fragment>
)

export default connect(mapStateToProps, mapDispatchToProps)(App)
