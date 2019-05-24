import React from 'react'

const DependencyCell = ({ dependencies }) => (
  <td class="matrix__table-cell">
    {dependencies.map(({ scope, version, versionLag }) => (
      <React.Fragment>
        <span class={`matrix__table-cell-label${versionLag ? ` matrix__table-cell-label--${versionLag}` : ''}`}>{version}</span>
        {scope && <span class="matrix__table-cell-label">{scope}</span>}
      </React.Fragment>
    ))}
  </td>
)

export default DependencyCell
