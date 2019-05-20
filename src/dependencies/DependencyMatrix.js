import React from 'react'
import { connect } from 'react-redux'
import { projectIds, artifactVersion, libraryIds, hasTreeLoadedSuccessfully } from './interactions'
import DependencyCell from './DependencyCell'

const apply = (x, f) => f(x)

const mapStateToProps = state => apply(
  projectIds(state),
  projectIds => ({
    projectIds,
    versions: projectIds.reduce((acc, projectId) => ({ ...acc, [projectId]: artifactVersion(state, projectId) }), {}),
    libraryIds: libraryIds(state),
    loaded: hasTreeLoadedSuccessfully(state)
  })
)

const DependencyMatrix = ({ projectIds, versions, libraryIds, loaded }) => loaded ? (
  <div class="matrix__table-wrapper">
    <table class="matrix__table">
      <thead>
        <tr>
          <td class="matrix__table-cell matrix__table-cell--overview"></td>
          {projectIds.map(projectId => (
            <td class="matrix__table-cell matrix__table-cell--header">{projectId}<br/>{versions[projectId]}</td>
          ))}
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
) : (
  null
)

export default connect(mapStateToProps)(DependencyMatrix)
