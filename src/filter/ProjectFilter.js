import React from 'react'
import { connect } from 'react-redux'
import { updateProjectFilter } from '../dependencies/interactions'
import { debouncedEventValue } from './debounce'

const mapDispatchToProps = dispatch => ({
  update: debouncedEventValue(500, value => dispatch(updateProjectFilter(value)))
})

const ProjectFilter = ({ update }) => (
  <React.Fragment>
    <label class="input-label" for="projectFilter">Filter projects</label>
    <input
      id="projectFilter"
      type="text"
      class="input-text"
      placeholder="Comma delimited string (e.g. 'project1, project2')"
      onChange={update}
    />
  </React.Fragment>
)

export default connect(undefined, mapDispatchToProps)(ProjectFilter)
