import React from 'react'
import { connect } from 'react-redux'
import { artifactDependencyScope, artifactDependencyVersion, artifactIds, artifactVersion, dependencyIds, hasTreeLoadedSuccessfully } from './interactions'

const apply = (x, f) => f(x)

const mapStateToProps = state => apply(
  artifactIds(state),
  ids => ({
    ids,
    versions: ids.reduce((acc, id) => ({ ...acc, [id]: artifactVersion(state, id) }), {}),
    dependencyIds: dependencyIds(state),
    loaded: hasTreeLoadedSuccessfully(state)
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
  ? <td class="matrix__table-cell">{version}<br/>{scope}</td>
  : <td class="matrix__table-cell"></td>

const DependencyCell = connect(mapStateToDependencyCellProps)(renderDependencyCell)

const DependencyMatrix = ({ ids, versions, dependencyIds, loaded }) => loaded ? (
  <div class="matrix__table-wrapper">
    <table class="matrix__table">
      <thead>
        <tr>
          <td class="matrix__table-cell matrix__table-cell--overview"></td>
          {ids.map(id => (
            <td class="matrix__table-cell matrix__table-cell--header">{id} - {versions[id]}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        {dependencyIds.map(dependencyId => (
          <tr>
            <td class="matrix__table-cell matrix__table-cell--lh-column">{dependencyId}</td>
            {ids.map(id => <DependencyCell artifactId={id} dependencyId={dependencyId}/>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (
  null
)

export default connect(mapStateToProps)(DependencyMatrix)
