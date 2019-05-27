import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import { analysisTitle, hasTreeLoadedSuccessfully } from './dependencies/interactions'
import LoadSummary from './dependencies/LoadSummary'
import DependencyMatrix from './dependencies/DependencyMatrix'
import Filters from './filter'

const mapStateToProps = state => ({
  loaded: hasTreeLoadedSuccessfully(state),
  pageTitle: analysisTitle(state)
})

const App = ({ loaded, pageTitle }) => (
  <React.Fragment>
    <h1 class="header--xl">{pageTitle}</h1>
    <Filters dependenciesLoaded={loaded} />
    {!loaded && <LoadSummary />}
    {loaded && <DependencyMatrix />}
  </React.Fragment>
)

export default connect(mapStateToProps)(App)
