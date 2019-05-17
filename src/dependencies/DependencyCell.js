import React from 'react'
import { connect } from 'react-redux'
import { artifactDependencyScope, artifactDependencyVersion, isScopeAllowedByFilter } from './interactions'

const apply = (x, f) => f(x)

const mapStateToProps = (state, { artifactId, dependencyId }) => apply(
  apply(
    artifactDependencyVersion(state, artifactId, dependencyId),
    version => ({
      version,
      scope: (version && artifactDependencyScope(state, artifactId, dependencyId)) || ''
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
