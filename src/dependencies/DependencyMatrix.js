import React from 'react'
import { connect } from 'react-redux'
import { projectIds, libraryIds } from './interactions'
import DependencyCell from './DependencyCell'
import ProjectCell from './ProjectCell'

const mapStateToProps = state => ({
  projectIds: projectIds(state),
  libraryIds: libraryIds(state)
})

const DependencyMatrix = ({ projectIds, libraryIds }) => (
  <div class="matrix__table-wrapper">
    <table class="matrix__table">
      <thead>
        <tr>
          <td class="matrix__table-cell matrix__table-cell--overview"></td>
          {projectIds.map(projectId => <ProjectCell projectId={projectId} />)}
        </tr>
      </thead>
      <tbody>
        {libraryIds.map(libraryId => (
          <tr>
            <td class="matrix__table-cell matrix__table-cell--lh-column">{libraryId}</td>
            {projectIds.map(projectId => <DependencyCell projectId={projectId} libraryId={libraryId}/>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default connect(mapStateToProps)(DependencyMatrix)
