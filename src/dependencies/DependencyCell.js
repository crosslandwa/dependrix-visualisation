import React from 'react'
import { connect } from 'react-redux'
import { dependencyScope, dependencyVersion, isScopeAllowedByFilter } from './interactions'

const apply = (x, f) => f(x)

const mapStateToProps = (state, { projectId, libraryId }) => apply(
  apply(
    dependencyVersion(state, projectId, libraryId),
    version => ({
      version,
      scope: (version && dependencyScope(state, projectId, libraryId)) || ''
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
