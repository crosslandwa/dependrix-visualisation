import React from 'react'
import { connect } from 'react-redux'
import { hasTreeLoadBeenAttempted, hasTreeLoadedSuccessfully, loadTree } from './interactions'

const mapStateToProps = state => ({
  loadAttempted: hasTreeLoadBeenAttempted(state),
  loadSuccess: hasTreeLoadedSuccessfully(state)
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
    const { loadAttempted, loadSuccess } = this.props
    return loadAttempted ? (loadSuccess ? null : <LoadFailed />) : <Initialising/>
  }
}

export default connect(mapStateToProps, { loadTree })(LoadSummary)
