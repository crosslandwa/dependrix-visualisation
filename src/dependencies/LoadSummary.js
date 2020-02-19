import React from 'react'
import { connect } from 'react-redux'
import { hasTreeLoadBeenAttempted } from './interactions'

const mapStateToProps = state => ({
  loadAttempted: hasTreeLoadBeenAttempted(state)
})

const Initialising = () => (
  <div class="load-summary">
    <span>Initialising...</span>
    <div class="load-summary__spinner"></div>
  </div>
)

const LoadFailed = () => (
  <div class="load-summary load-summary--error">Tree load failed</div>
)

const LoadSummary = ({ loadAttempted }) => (
  loadAttempted ? <LoadFailed /> : <Initialising/>
)

export default connect(mapStateToProps)(LoadSummary)
