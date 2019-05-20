import React from 'react'
import { connect } from 'react-redux'
import { artifactDependencyScope, artifactDependencyVersion, isScopeAllowedByFilter } from './interactions'

const apply = (x, f) => f(x)

const mapStateToProps = (state, { artifactId, libraryId }) => apply(
  apply(
    artifactDependencyVersion(state, artifactId, libraryId),
    version => ({
      version,
      scope: (version && artifactDependencyScope(state, artifactId, libraryId)) || ''
    })
  ),
  ({ version, scope }) => (scope && isScopeAllowedByFilter(state, scope))
    ? { version, scope }
    : {}
)

const DependencyCell = ({ scope, version }) => version
  ? <td class="matrix__table-cell">{version}<br/>{scope}</td>
  : <td class="matrix__table-cell"></td>

export default connect(mapStateToProps)(DependencyCell)
