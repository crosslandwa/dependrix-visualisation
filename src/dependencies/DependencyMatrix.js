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
  ? <td>{version} ({scope})</td>
  : <td></td>

const DependencyCell = connect(mapStateToDependencyCellProps)(renderDependencyCell)

const DependencyMatrix = ({ ids, versions, dependencyIds }) => (
  <table>
    <thead>
      <tr>
        <td></td>
        {ids.map(id => (
          <td>{id} - {versions[id]}</td>
        ))}
      </tr>
    </thead>
    <tbody>
      {dependencyIds.map(dependencyId => (
        <tr>
          <td>{dependencyId}</td>
          {ids.map(id => <DependencyCell artifactId={id} dependencyId={dependencyId}/>)}
        </tr>
      ))}
    </tbody>
  </table>
)

export default connect(mapStateToProps)(DependencyMatrix)
