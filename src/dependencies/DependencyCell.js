import React from 'react'

const DependencyCell = ({ dependencies }) => (
  <td class="matrix__table-cell">
    {dependencies.map(({ scope, version, versionLag }) => (
      <div class="matrix__dependency-detail">
        <span class={`matrix__table-cell-label${versionLag ? ` matrix__table-cell-label--${versionLag}` : ''}`}>{version}</span>
        {scope && <span class="matrix__table-cell-label">{scope}</span>}
      </div>
    )).reduce((a, b) => a ? [a, <hr class="matrix__table-cell-divide"/>, b] : [b], null)}
  </td>
)

export default DependencyCell
