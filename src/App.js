import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import { hasTreeLoadedSuccessfully } from './dependencies/interactions'
import LoadSummary from './dependencies/LoadSummary'
import DependencyMatrix from './dependencies/DependencyMatrix'
import Filters from './filter'
import PageTitle from './PageTitle'

const mapStateToProps = state => ({
  loaded: hasTreeLoadedSuccessfully(state)
})

const App = ({ loaded }) => (
  <React.Fragment>
    <PageTitle />
    {loaded && <Filters />}
    {!loaded && <LoadSummary />}
    {loaded && <DependencyMatrix />}
  </React.Fragment>
)

export default connect(mapStateToProps)(App)
