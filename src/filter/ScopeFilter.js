import React from 'react'
import { connect } from 'react-redux'
import { availableScopes, toggleDependencyScopeFilter } from '../dependencies/interactions'

const mapStateToProps = state => ({
  availableScopes: availableScopes(state)
})

const mapDispatchToProps = dispatch => ({
  toggle: e => dispatch(toggleDependencyScopeFilter(e.target.value))
})

const ScopeFilter = ({ availableScopes, toggle }) => (
  <fieldset class="checkbox-group__fieldset">
    <legend class="checkbox-group__legend">
      Filter by scope
    </legend>
    <div>
      {availableScopes.map(scope => (
        <React.Fragment>
          <input
            class="checkbox-group__input"
            id={scope}
            name="scope"
            type="checkbox"
            value={scope}
            onChange={toggle}
          />
          <label
            class="checkbox-group__label"
            for={scope}
          >
            {scope}
          </label>
        </React.Fragment>
      ))}
    </div>
  </fieldset>
)

export default connect(mapStateToProps, mapDispatchToProps)(ScopeFilter)
