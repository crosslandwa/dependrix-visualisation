import React from 'react'
import { connect } from 'react-redux'
import { artifactDependencyScope, artifactDependencyVersion, artifactIds, artifactVersion, dependencyIds } from './interactions'

const apply = (x, f) => f(x)

const mapStateToProps = state => apply(
  artifactIds(state),
  ids => ({
    ids,
    versions: ids.reduce((acc, id) => ({ ...acc, [id]: artifactVersion(state, id) }), {}),
    dependencyIds: dependencyIds(state)
  })
)

const mapStateToDependencyCellProps = (state, { artifactId, dependencyId }) => apply(
  artifactDependencyVersion(state, artifactId, dependencyId),
  version => ({
    version,
    scope: (version && artifactDependencyScope(state, artifactId, dependencyId)) || ''
  })
)

const renderDependencyCell = ({ scope, version }) => version
  ? <td class="matrix__table-cell">{version} ({scope})</td>
  : <td class="matrix__table-cell"></td>

const DependencyCell = connect(mapStateToDependencyCellProps)(renderDependencyCell)

const DependencyMatrix = ({ ids, versions, dependencyIds }) => (
  <div class="matrix__table-wrapper">
    <table class="matrix__table">
      <thead>
        <tr>
          <td class="matrix__table-cell matrix__table-lh-column-cell matrix__table-header-cell"></td>
          {ids.map(id => (
            <td class="matrix__table-cell matrix__table-header-cell">{id} - {versions[id]}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        {dependencyIds.map(dependencyId => (
          <tr>
            <td class="matrix__table-cell matrix__table-lh-column-cell">{dependencyId}</td>
            {ids.map(id => <DependencyCell artifactId={id} dependencyId={dependencyId}/>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default connect(mapStateToProps)(DependencyMatrix)
