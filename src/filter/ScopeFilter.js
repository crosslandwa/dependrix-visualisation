import React from 'react'
import { connect } from 'react-redux'
import { availableScopes, updateDependencyScopeFilter } from '../dependencies/interactions'
import { debounced } from './debounce'

const mapStateToProps = state => ({
  availableScopes: availableScopes(state)
})

const mapDispatchToProps = dispatch => ({
  update: debounced(500, value => dispatch(updateDependencyScopeFilter(value)))
})

class ScopeFilter extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedScopes: []
    }

    this.update = e => {
      const value = e.target.value
      this.setState((state) => {
        const selectedScopes = state.selectedScopes.includes(value)
          ? state.selectedScopes.filter(scope => scope !== value)
          : state.selectedScopes.concat(value)
        props.update(selectedScopes)
        return { selectedScopes }
      })
    }
  }

  render () {
    const { availableScopes } = this.props
    return (
      <fieldset>
        <legend>
          Filter by scope
        </legend>
        <div>
          {availableScopes.map(scope => (
            <React.Fragment>
              <input
                class="checkbox__input"
                id={scope}
                name="scope"
                type="checkbox"
                value={scope}
                onChange={this.update}
              />
              <label
                class="govuk-checkbox__label"
                for={scope}
              >
                {scope}
              </label>
            </React.Fragment>
          ))}
        </div>
      </fieldset>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ScopeFilter)
