import React from 'react'
import PropTypes from 'prop-types'
import { StyledField } from '@ui/components/form'
import { slugify } from '@ui/common'
import AlertCircleIcon from 'mdi-react/AlertCircleIcon'
import CheckCircleOutlineIcon from 'mdi-react/CheckCircleOutlineIcon'

/* eslint-disable */
class Field extends React.Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    type: PropTypes.string,
    value: PropTypes.string,
    message: PropTypes.node,
    autoFocus: PropTypes.bool,
    error: PropTypes.any,
    positive: PropTypes.bool,
    overlay: PropTypes.node,
    name: PropTypes.node,
    mh: PropTypes.any,
    handleChange: PropTypes.func,
    handleChangeOverride: PropTypes.func,
    handleBlur: PropTypes.func,
    onBlur: PropTypes.func
  }

  ref = React.createRef()

  componentDidMount() {
    if (this.props.autoFocus) {
      this.ref.current.focus()
    }
  }

  render() {
    /* eslint-enable */

    const {
      label,
      type = 'text',
      message,
      autoFocus,
      error,
      positive,
      overlay,
      name = slugify(label),
      mh,
      value,
      handleChange,
      handleChangeOverride,
      handleBlur, // these are here to prevent them from being used (fixes form bug double click)
      onBlur, // these are here to prevent them from being used (fixes form bug double click)
      ...rest
    } = this.props

    const InputComponent =
      type === 'textarea' ? StyledField.Textarea : StyledField.Input

    const LabelIconComponent = positive
      ? CheckCircleOutlineIcon
      : AlertCircleIcon
    const LabelIcon = (error || positive) && (
      <StyledField.Label.Icon positive={positive}>
        <LabelIconComponent size={16} />
      </StyledField.Label.Icon>
    )
    /**
     * TODO: abstract out qualified message to one component that takes multiple states
     */
    const MessageComponent = error
      ? StyledField.Input.Error
      : StyledField.Input.Positive

    const Message = p =>
      positive || error ? (
        <MessageComponent overlay={!!overlay} {...p}>
          {positive || error}
        </MessageComponent>
      ) : null

    const Overlay = overlay ? (
      <StyledField.Input.Overlay>{overlay}</StyledField.Input.Overlay>
    ) : null

    const _handleChange = e => {
      if (handleChangeOverride) {
        handleChangeOverride(e, handleChange)
      } else {
        handleChange(e)
      }
    }

    const Label = () => (
      <StyledField.Label htmlFor={name}>
        {label}
        {LabelIcon}
      </StyledField.Label>
    )

    return (
      <StyledField.Group error={error} {...rest}>
        <StyledField.Input.Wrapper>
          {Overlay}
          <InputComponent
            ref={this.ref}
            placeholder={label}
            autoComplete="new-password"
            required
            name={name}
            type={type}
            defaultValue={value}
            mh={mh}
            onChange={_handleChange}
            lowercase={type !== 'password'}
          />
          <Message />
          <Label />
          <StyledField.Input.Bar />
        </StyledField.Input.Wrapper>
        {message && (
          <StyledField.Input.Message>{message}</StyledField.Input.Message>
        )}
      </StyledField.Group>
    )
  }
}
// eslint-enable

export { Field }
