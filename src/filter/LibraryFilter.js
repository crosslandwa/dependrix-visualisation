import React from 'react'
import { connect } from 'react-redux'
import { updateLibraryFilter } from '../dependencies/interactions'
import { debouncedEventValue } from './debounce'

const mapDispatchToProps = dispatch => ({
  update: debouncedEventValue(500, value => dispatch(updateLibraryFilter(value)))
})

const LibraryFilter = ({ update }) => (
  <React.Fragment>
    <label class="input-label" for="libraryFilter">Filter libraries</label>
    <input
      id="libraryFilter"
      type="text"
      class="input-text"
      placeholder="Comma delimited string (e.g. 'library1, library1')"
      onChange={update}
    />
  </React.Fragment>
)

export default connect(undefined, mapDispatchToProps)(LibraryFilter)
