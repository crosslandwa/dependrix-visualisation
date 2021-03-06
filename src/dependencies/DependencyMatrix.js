import React from 'react'
import { connect } from 'react-redux'
import { filteredDependencyMap, filteredLibraryIds, filteredProjectIds, latestLibraryVersions } from './interactions'
import DependencyCell from './DependencyCell'
import ProjectCell from './ProjectCell'

const mapStateToProps = state => {
  const projectIds = filteredProjectIds(state)
  return {
    projectIds,
    libraryIds: filteredLibraryIds(state, projectIds),
    dependencyMap: filteredDependencyMap(state, projectIds),
    latestLibraryVersions: latestLibraryVersions(state)
  }
}

const DependencyMatrix = ({ projectIds, libraryIds, dependencyMap, latestLibraryVersions }) => (
  <div class="matrix__table-wrapper">
    <table class="matrix__table">
      <thead>
        <tr>
          <td class="matrix__table-cell matrix__table-cell--overview">
            <span class="matrix__table-cell-label">{projectIds.length} projects</span>
            <span class="matrix__table-cell-label">{libraryIds.length} libraries</span>
          </td>
          {projectIds.map(projectId => <ProjectCell projectId={projectId} />)}
        </tr>
      </thead>
      <tbody>
        {libraryIds.map(libraryId => (
          <tr>
            <td class="matrix__table-cell matrix__table-cell--lh-column">
              <span class="matrix__table-cell-label">{libraryId}</span>
              <span class="matrix__table-cell-label">(latest: {latestLibraryVersions[libraryId]})</span>
            </td>
            {projectIds.map(projectId => <DependencyCell dependencies={(dependencyMap[projectId][libraryId]) || []} />)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default connect(mapStateToProps)(DependencyMatrix)
