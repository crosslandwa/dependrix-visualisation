import React from 'react'
import { connect } from 'react-redux'
import { availableVersionLags, updateVersionLagFilter } from '../dependencies/interactions'
import { debounced } from './debounce'

const mapStateToProps = state => ({
  availableVersionLags: availableVersionLags(state)
})

const mapDispatchToProps = dispatch => ({
  update: debounced(500, value => dispatch(updateVersionLagFilter(value)))
})

class VersionLagFilter extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedVersionLags: []
    }

    this.update = e => {
      const value = e.target.value
      this.setState((state) => {
        const selectedVersionLags = state.selectedVersionLags.includes(value)
          ? state.selectedVersionLags.filter(lag => lag !== value)
          : state.selectedVersionLags.concat(value)
        props.update(selectedVersionLags)
        return { selectedVersionLags }
      })
    }
  }

  render () {
    const { availableVersionLags } = this.props
    return (
      <fieldset>
        <legend>
          Filter by version lag
        </legend>
        <div>
          {availableVersionLags.map(lag => (
            <React.Fragment>
              <input
                class="checkbox__input"
                id={lag}
                name="versionLag"
                type="checkbox"
                value={lag}
                onChange={this.update}
              />
              <label
                class="govuk-checkbox__label"
                for={lag}
              >
                {lag}
              </label>
            </React.Fragment>
          ))}
        </div>
      </fieldset>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(VersionLagFilter)
