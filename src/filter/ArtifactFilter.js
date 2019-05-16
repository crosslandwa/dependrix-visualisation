import React from 'react'
import { connect } from 'react-redux'
import { updateArtifactFilter } from '../dependencies/interactions'
import { debouncedEventValue } from './debounce'

const mapDispatchToProps = dispatch => ({
  update: debouncedEventValue(500, value => dispatch(updateArtifactFilter(value)))
})

const ArtifactFilter = ({ update }) => (
  <React.Fragment>
    <label class="input-label" for="artifactFilter">Filter artifacts</label>
    <input
      id="artifactFilter"
      type="text"
      class="input-text"
      placeholder="Comma delimited string (e.g. 'artifact1, artifact2')"
      onChange={update}
    />
  </React.Fragment>
)

export default connect(undefined, mapDispatchToProps)(ArtifactFilter)
