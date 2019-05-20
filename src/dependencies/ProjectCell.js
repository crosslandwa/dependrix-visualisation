import React from 'react'
import { connect } from 'react-redux'
import { projectVersion } from './interactions'

const mapStateToProps = (state, { projectId }) => ({
  version: projectVersion(state, projectId)
})

const ProjectCell = ({ projectId, version }) => (
  <td class="matrix__table-cell matrix__table-cell--header">
    <span class="matrix__table-cell-label">{projectId}</span>
    <span class="matrix__table-cell-label">{version}</span>
  </td>
)

export default connect(mapStateToProps)(ProjectCell)
