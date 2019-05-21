import React from 'react'
import { connect } from 'react-redux'
import { dependencyScope, dependencyVersion } from './interactions'

const apply = (x, f) => f(x)

const mapStateToProps = (state, { projectId, libraryId }) => apply(
  dependencyVersion(state, projectId, libraryId),
  version => ({
    version,
    scope: (version && dependencyScope(state, projectId, libraryId)) || ''
  })
)

const DependencyCell = ({ scope, version }) => (
  <td class="matrix__table-cell">
    {version && (
      <React.Fragment>
        <span class="matrix__table-cell-label">{version}</span>
        <span class="matrix__table-cell-label">{scope}</span>
      </React.Fragment>
    )}
  </td>
)

export default connect(mapStateToProps)(DependencyCell)
