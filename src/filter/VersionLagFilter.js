import React from 'react'
import { connect } from 'react-redux'
import { availableVersionLags, toggleVersionLagFilter } from '../dependencies/interactions'

const mapStateToProps = state => ({
  availableVersionLags: availableVersionLags(state)
})

const mapDispatchToProps = dispatch => ({
  toggle: e => dispatch(toggleVersionLagFilter(e.target.value))
})

const VersionLagFilter = ({ availableVersionLags, toggle }) => (
  <fieldset class="checkbox-group__fieldset">
    <legend class="checkbox-group__legend">
      Filter by version lag
    </legend>
    <div>
      {availableVersionLags.map(lag => (
        <React.Fragment>
          <input
            class="checkbox-group__input"
            id={lag}
            name="versionLag"
            type="checkbox"
            value={lag}
            onChange={toggle}
          />
          <label
            class="checkbox-group__label"
            for={lag}
          >
            {lag}
          </label>
        </React.Fragment>
      ))}
    </div>
  </fieldset>
)

export default connect(mapStateToProps, mapDispatchToProps)(VersionLagFilter)
