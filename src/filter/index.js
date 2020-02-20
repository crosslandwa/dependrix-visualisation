import React from 'react'
import LibraryFilter from './LibraryFilter'
import ProjectFilter from './ProjectFilter'
import ScopeFilter from './ScopeFilter'
import VersionLagFilter from './VersionLagFilter'

const Filters = () => (
  <details class="details" open={true}>
    <summary class="details__summary">Filters</summary>
    <div class="details__reveal">
      <ProjectFilter />
      <LibraryFilter />
      <ScopeFilter />
      <VersionLagFilter />
    </div>
  </details>
)

export default Filters
