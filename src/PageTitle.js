import React from 'react'
import { connect } from 'react-redux'
import { analysisTitle } from './dependencies/interactions'

const mapStateToProps = state => ({
  pageTitle: analysisTitle(state)
})

const PageTitle = ({ pageTitle }) => {
  document.title = pageTitle
  return <h1 class="header--xl">{pageTitle}</h1>
}

export default connect(mapStateToProps)(PageTitle)
