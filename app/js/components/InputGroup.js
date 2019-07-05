import PropTypes from 'prop-types'
import React, { Component } from 'react'

class InputGroup extends Component {
  static propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    step: PropTypes.number,
    name: PropTypes.string,
    data: PropTypes.object,
    onChange: PropTypes.func,
    type: PropTypes.string,
    disabled: PropTypes.bool,
    inverse: PropTypes.bool,
    textarea: PropTypes.bool,
    textareaRows: PropTypes.number,
    required: PropTypes.bool,
    onReturnKeyPress: PropTypes.func,
    onBlur: PropTypes.func,
    stopClickPropagation: PropTypes.bool,
    accessoryIcon: PropTypes.bool,
    accessoryIconClass: PropTypes.string,
    autoComplete: PropTypes.string,
    enforcePasswordLength: PropTypes.bool,
    addOn: PropTypes.string,
    centerText: PropTypes.bool
  }

  constructor(props) {
    super(props)

    this.onKeyPress = this.onKeyPress.bind(this)
    this.onBlur = this.onBlur.bind(this)
    this.handleClick = this.handleClick.bind(this)
  }

  onKeyPress(e) {
    if (this.props.onReturnKeyPress !== undefined) {
      if (e.key === 'Enter') {
        this.props.onReturnKeyPress()
      }
    }
  }

  onBlur(e) {
    if (this.props.onBlur !== undefined) {
      this.props.onBlur(e)
    }
  }

  handleClick(e) {
    if (this.props.stopClickPropagation) {
      e.stopPropagation()
    }
  }

  render() {
    let value = ''
    let type = 'text'
    let disabled = false
    let required = false
    let step = 1
    const autoComplete = this.props.autoComplete
    if (this.props.data && this.props.name) {
      value = this.props.data[this.props.name]
      if (value === null || value === undefined) {
        value = ''
      }
    }
    if (this.props.step) {
      step = this.props.step
    }
    if (this.props.type) {
      type = this.props.type
    }
    if (this.props.disabled) {
      disabled = this.props.disabled
    }
    if (this.props.required) {
      required = this.props.required
    }
    let inputClass = `form-control ${this.props.centerText ? 'text-center' : ''}
      ${this.props.accessoryIcon ? 'input-accessory-icon' : ''}`
    if (this.props.inverse) {
      inputClass = `form-inverse-control ${this.props.centerText ? 'text-center' : ''}
      ${this.props.accessoryIcon ? 'input-accessory-icon' : ''}`
    }
    let labelClass = this.props.centerText ? 'form-control-label form-control-label-centered'
      : 'form-control-label'
    if (this.props.inverse) {
      labelClass = this.props.centerText ?
      'form-control-label-centered form-control-label form-inverse-control-label'
      : 'form-control-label form-inverse-control-label'
    }

    const enforcePasswordLength = this.props.enforcePasswordLength
    const addOn = this.props.addOn ? this.props.addOn : ''
    const label = this.props.label ? this.props.label : ''

    return (
      <div
        className={`form-group m-b-11 ${this.props.centerText ? 'text-center' : ''}`}
        onClick={this.handleClick}
      >
        <fieldset>
          {label.length > 0 &&
            <label className={`${labelClass}`}>
              {label}
            </label>
          }
          <div className="">
            {this.props.textarea ?
              <textarea
                name={this.props.name}
                disabled={disabled}
                className={inputClass}
                type={type}
                placeholder={
                  this.props.placeholder ? this.props.placeholder : label
                }
                value={value}
                onChange={this.props.onChange}
                rows={this.props.textareaRows || 2}
              />
            :
              <div className={addOn.length > 0 ? 'input-group' : ''}>
                {addOn.length > 0 && <span className="input-group-addon">{addOn}</span>}
                {type === 'password' && enforcePasswordLength ?
                  <input
                    name={this.props.name}
                    disabled={disabled}
                    className={inputClass}
                    type={type}
                    required={required}
                    step={step}
                    placeholder={
                      this.props.placeholder ? this.props.placeholder : label
                    }
                    value={value}
                    onChange={this.props.onChange}
                    onBlur={this.onBlur}
                    onKeyPress={this.onKeyPress}
                    autoComplete={autoComplete}
                    minLength="8"
                  />
                :
                  <input
                    name={this.props.name}
                    disabled={disabled}
                    className={inputClass}
                    type={type}
                    required={required}
                    step={step}
                    placeholder={
                      this.props.placeholder ? this.props.placeholder : label
                    }
                    value={value}
                    onChange={this.props.onChange}
                    onBlur={this.onBlur}
                    onKeyPress={this.onKeyPress}
                    autoComplete={autoComplete}
                  />
                }
              </div>
            }
            {this.props.accessoryIcon &&
              <span className={this.props.accessoryIconClass}></span>
            }
          </div>
        </fieldset>
      </div>
    )
  }
}

export default InputGroup
