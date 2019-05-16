import React from 'react'
import { connect } from 'react-redux'
import { updateDependencyFilter } from '../dependencies/interactions'
import { debouncedEventValue } from './debounce'

const mapDispatchToProps = dispatch => ({
  update: debouncedEventValue(500, value => dispatch(updateDependencyFilter(value)))
})

const DependencyFilter = ({ update }) => (
  <React.Fragment>
    <label for="artifactFilter">Filter dependencies</label>
    <input
      id="artifactFilter"
      type="text"
      placeholder="Comma delimited string (e.g. 'dependency1, dependency2')"
      onChange={update}
    />
  </React.Fragment>
)

export default connect(undefined, mapDispatchToProps)(DependencyFilter)
