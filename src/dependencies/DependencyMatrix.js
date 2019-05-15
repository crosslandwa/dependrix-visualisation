import React from 'react'
import { connect } from 'react-redux'
import { artifactIds, artifactVersion } from './interactions'

const apply = (x, f) => f(x)

const mapStateToProps = state => apply(
  artifactIds(state),
  ids => ({
    ids,
    versions: ids.reduce((acc, id) => ({ ...acc, [id]: artifactVersion(state, id) }), {})
  })
)

const DependencyMatrix = ({ ids, versions }) => (
  <ul>{ids.map(id => (
    <li>{id} - {versions[id]}</li>
  ))}</ul>
)

export default connect(mapStateToProps)(DependencyMatrix)
