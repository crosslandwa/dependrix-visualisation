import React from 'react'
import { connect } from 'react-redux'
import { dependencies } from './interactions'

const mapStateToProps = (state, { projectId, libraryId }) => ({
  dependencies: dependencies(state, projectId, libraryId)
})

const DependencyCell = ({ dependencies }) => (
  <td class="matrix__table-cell">
    {dependencies.map(({ scope, version, versionLag }) => (
      <React.Fragment>
        <span class={`matrix__table-cell-label${versionLag ? ` matrix__table-cell-label--${versionLag}` : ''}`}>{version}</span>
        <span class="matrix__table-cell-label">{scope}</span>
      </React.Fragment>
    ))}
  </td>
)

export default connect(mapStateToProps)(DependencyCell)
