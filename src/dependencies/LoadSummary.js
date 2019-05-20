import React from 'react'
import { connect } from 'react-redux'
import { hasTreeLoadBeenAttempted, loadTree } from './interactions'

const mapStateToProps = state => ({
  loadAttempted: hasTreeLoadBeenAttempted(state)
})

const Initialising = () => (
  <div>Initialising...</div>
)

const LoadFailed = () => (
  <div>Tree load failed</div>
)

class LoadSummary extends React.Component {
  componentDidMount () {
    setTimeout(this.props.loadTree, 500)
  }

  render () {
    const { loadAttempted } = this.props
    return loadAttempted ? <LoadFailed /> : <Initialising/>
  }
}

export default connect(mapStateToProps, { loadTree })(LoadSummary)
