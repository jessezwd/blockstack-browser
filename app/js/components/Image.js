import PropTypes from 'prop-types'
import React, { Component } from 'react'
import isRetina from 'is-retina'

class Image extends Component {
  static propTypes = {
    src: PropTypes.string.isRequired,
    fallbackSrc: PropTypes.string.isRequired,
    style: PropTypes.object,
    className: PropTypes.string,
    onLoad: PropTypes.func,
    retinaSupport: PropTypes.bool,
    onClick: PropTypes.func,
    alt: PropTypes.string
  }

  constructor(props) {
    super(props)

    let src = this.props.src
    if (this.props.retinaSupport && isRetina()) {
      src = src.replace('.jpg', '@2x.jpg')
    }
    this.state = { src }

    this.onError = this.onError.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      let nextSrc = nextProps.src
      if (this.props.retinaSupport && isRetina()) {
        nextSrc = nextSrc.replace('.jpg', '@2x.jpg')
      }
      this.setState({
        src: nextSrc
      })
    }
  }

  onError() {
    this.setState({
      src: this.props.fallbackSrc
    })
  }

  render() {
    return (
      <img
        src={this.state.src}
        style={this.props.style}
        className={this.props.className}
        onLoad={this.props.onLoad}
        onError={this.onError}
        onClick={this.props.onClick}
        alt={this.props.alt}
      />
    )
  }
}

export default Image
