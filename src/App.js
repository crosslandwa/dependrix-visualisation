import React from 'react'
import { connect } from 'react-redux'
import './app.css'
import LoadSummary from './dependencies/LoadSummary'

const mapStateToProps = state => ({})
const mapDispatchToProps = {}

const App = props => (
  <React.Fragment>
    <h1>Dependrix</h1>
    <LoadSummary />
  </React.Fragment>
)

export default connect(mapStateToProps, mapDispatchToProps)(App)
