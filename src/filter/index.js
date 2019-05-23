import React from 'react'
import LibraryFilter from './LibraryFilter'
import ProjectFilter from './ProjectFilter'
import ScopeFilter from './ScopeFilter'
import VersionLagFilter from './VersionLagFilter'

const Filters = ({ dependenciesLoaded }) => (
  <details class="details" open={!!dependenciesLoaded}>
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
