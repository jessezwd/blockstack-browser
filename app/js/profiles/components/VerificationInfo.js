import PropTypes from 'prop-types'
import React, { Component } from 'react'

import InputGroup from '@components/InputGroup'
import { openInNewTab } from '@utils'
import ReactTooltip from 'react-tooltip'
import Image from '@components/Image'
import { isMobile } from '@utils'

export const VERIFICATION_TWEET_LINK_URL_BASE = 'https://explorer.blockstack.org/address/'

class CopyToClipBoardButton extends Component {

  render() {
    return (
      <div className="verification-copy">
        <button
          className="btn-clipboard"
          data-for="tooltip"
          data-event="click"
          data-event-off="mouseout"
          data-tip>
            <i className="fa fa-fw fa-clipboard fa-lg"></i>
        </button>
      </div>
    )
  }
}

class TwitterVerificationInfo extends Component {
  static contextTypes = {
    proofUrl: PropTypes.string,
    onChange: PropTypes.func,
    verified: PropTypes.bool,
    onPostVerificationButtonClick: PropTypes.func
  }

  render() {
    return (
      <div>
        <p>
          <span className="font-weight-bold">Step 2: </span>
          Click the Tweet Verification button to post your proof to Twitter.&nbsp;
          <strong>Your tweet must be public!</strong>
        </p>
        <button className="btn btn-verify btn-twitter btn-block" onClick={this.props.onPostVerificationButtonClick}>
          <i className="fa fa-fw fa-twitter fa-lg" /> Tweet Verification
        </button>
        <p className="m-t-20">
          <span className="font-weight-bold">Step 3: </span>
          Paste the URL of your tweet below.
        </p>
        <InputGroup
          name="proofUrl"
          data={this.props}
          placeholder="Paste proof URL here"
          stopClickPropagation={true}
          onChange={this.props.onChange}
          accessoryIcon={this.props.verified}
          accessoryIconClass="fa fa-check fa-fw fa-lg input-accessory-icon-right"
          disabled={false}
        />
      </div>
    )
  }
}

class FacebookVerificationInfo extends Component {
  static contextTypes = {
    verificationMessage: PropTypes.string,
    proofUrl: PropTypes.string,
    onChange: PropTypes.func,
    verified: PropTypes.bool,
    onPostVerificationButtonClick: PropTypes.func
  }

  render() {
    return (
      <div>
        <p>
          <span className="font-weight-bold">Step 2: </span>
        </p>
        <button className="btn btn-verify btn-facebook btn-block" onClick={this.props.onPostVerificationButtonClick}>
          <i className="fa fa-fw fa-facebook fa-lg" /> Open A Facebook Share Window
        </button>
        <p className="m-t-20">
          <span className="font-weight-bold">Step 3: </span>
          Paste this text in the message field
        </p>
        <div className="verification-quote">
          <div className="row">
            <div className="col-11">
              {this.props.verificationMessage}
            </div>
            <div className="col-1">
              {!isMobile() && <CopyToClipBoardButton />}
            </div>
          </div>
        </div>
        <p>
          <span className="font-weight-bold">Step 4: </span>
          Set the post visibility to <strong>public</strong>, then share!
        </p>
        <Image
          src="/images/proof-fb-public.png"
          fallbackSrc=""
          className="verification-image"
        />
        <p className="m-t-20">
          <span className="font-weight-bold">Step 5: </span>
          Paste the URL of your post below.
        </p>
        <InputGroup
          name="proofUrl"
          data={this.props}
          placeholder="Paste proof URL here"
          stopClickPropagation={true}
          onChange={this.props.onChange}
          accessoryIcon={this.props.verified}
          accessoryIconClass="fa fa-check fa-fw fa-lg input-accessory-icon-right"
          disabled={false}
        />
      </div>
    )
  }
}

class GithubVerificationInfo extends Component {
  static contextTypes = {
    verificationMessage: PropTypes.string,
    proofUrl: PropTypes.string,
    onChange: PropTypes.func,
    verified: PropTypes.bool,
    onPostVerificationButtonClick: PropTypes.func
  }

  render() {
    return (
      <div>
        <p>
          <span className="font-weight-bold">Step 2: </span>
          Copy the text below and click on the create gist button.
          Then paste the text into the body of your new gist and click
          &nbsp;<strong>Create Public Gist.</strong>
        </p>
        <div className="verification-quote">
          <div className="row">
            <div className="col-11">
              {this.props.verificationMessage}
            </div>
            <div className="col-1">
              {!isMobile() && <CopyToClipBoardButton />}
            </div>
          </div>
        </div>
        <button className="btn btn-verify btn-github btn-block" onClick={this.props.onPostVerificationButtonClick}>
          <i className="fa fa-fw fa-github fa-lg" /> Create Gist
        </button>
        <p className="m-t-20">
          <span className="font-weight-bold">Step 3: </span>
          Paste the URL of your gist below.
        </p>
        <InputGroup
          name="proofUrl"
          data={this.props}
          placeholder="Paste proof URL here"
          stopClickPropagation={true}
          onChange={this.props.onChange}
          accessoryIcon={this.props.verified}
          accessoryIconClass="fa fa-check fa-fw fa-lg input-accessory-icon-right"
          disabled={false}
        />
      </div>
    )
  }
}

class LinkedInVerificationInfo extends Component {
  static contextTypes = {
    verificationMessage: PropTypes.string,
    proofUrl: PropTypes.string,
    onChange: PropTypes.func,
    verified: PropTypes.bool,
    onPostVerificationButtonClick: PropTypes.func
  }

  render() {
    const verificationUrl = ""

    return (
      <div>
        <p>
          <span className="font-weight-bold">Step 2: </span>
          Post the following text on your LinkedIn. Make sure your post is public!
        </p>
        <div className="verification-quote">
          <div className="row">
            <div className="col-11">
              {this.props.verificationMessage}
            </div>
            <div className="col-1">
              {!isMobile() && <CopyToClipBoardButton />}
            </div>
          </div>
        </div>
        <button className="btn btn-verify btn-linkedin btn-block" onClick={this.props.onPostVerificationButtonClick}>
          <i className="fa fa-fw fa-linkedin fa-lg" /> Post Verification to LinkedIn
        </button>
        <p className="m-t-20">
          <span className="font-weight-bold">Step 3: </span>
          Paste the URL of your post.
        </p>
        <InputGroup
          name="proofUrl"
          data={this.props}
          placeholder="Paste proof URL here"
          stopClickPropagation={true}
          onChange={this.props.onChange}
          accessoryIcon={this.props.verified}
          accessoryIconClass="fa fa-check fa-fw fa-lg input-accessory-icon-right"
          disabled={false}
        />
      </div>
    )
  }
}

class InstagramVerificationInfo extends Component {
  static contextTypes = {
    verificationMessage: PropTypes.string,
    proofUrl: PropTypes.string,
    onChange: PropTypes.func,
    verified: PropTypes.bool,
    onPostVerificationButtonClick: PropTypes.func
  }

  render() {
    const verificationUrl = ""

    return (
      <div>
        <p>
          <span className="font-weight-bold">Step 2: </span>
          Post a photo to Instagram with the following caption.
        </p>
        <div className="verification-quote">
          <div className="row">
            <div className="col-11">
              {this.props.verificationMessage}
            </div>
            <div className="col-1">
              {!isMobile() && <CopyToClipBoardButton />}
            </div>
          </div>
        </div>
        <p>
          <span className="font-weight-bold">Step 3: </span>
          Paste the URL of your post.
        </p>
        <InputGroup
          name="proofUrl"
          data={this.props}
          placeholder="Paste proof URL here"
          stopClickPropagation={true}
          onChange={this.props.onChange}
          accessoryIcon={this.props.verified}
          accessoryIconClass="fa fa-check fa-fw fa-lg input-accessory-icon-right"
          disabled={false}
        />
      </div>
    )
  }
}

class HackerNewsVerificationInfo extends Component {
  static contextTypes = {
    verificationMessage: PropTypes.string,
    proofUrl: PropTypes.string,
    onChange: PropTypes.func,
    verified: PropTypes.bool,
    onPostVerificationButtonClick: PropTypes.func
  }

  render() {
    return (
      <div>
        <p>
          <span className="font-weight-bold">Step 2: </span>
          Copy the text below and add it to the about section in your Hacker News user profile.
        </p>
        <div className="verification-quote">
          <div className="row">
            <div className="col-11">
              {this.props.verificationMessage}
            </div>
            <div className="col-1">
              {!isMobile() && <CopyToClipBoardButton />}
            </div>
          </div>
        </div>
        <button className="btn btn-verify btn-twitter btn-block m-b-20" onClick={this.props.onPostVerificationButtonClick}>
          <i className="fa fa-fw fa-hacker-news fa-lg" /> Go to Hacker News Profile
        </button>
      </div>
    )
  }
}

class VerificationInfo extends Component {
  static contextTypes = {
    service: PropTypes.string,
    domainName: PropTypes.string,
    ownerAddress: PropTypes.string,
    onPostVerificationButtonClick: PropTypes.func,
    proofURL: PropTypes.string,
    onProofUrlChange: PropTypes.func
  }

  constructor(props) {
    super(props)
    this.state = {
      services: {
        facebook: true,
        twitter: true,
        github: true,
        linkedIn: true,
        instagram: true,
        hackerNews: true,
      }
    }
    this.copy = this.copy.bind(this)
  }

  handleClick(e) {
    e.stopPropagation()
  }

  copy(e) {
    const url = `${VERIFICATION_TWEET_LINK_URL_BASE}${this.props.ownerAddress}`
    let verificationMessage = `Verifying my Blockstack ID is secured with the address ${this.props.ownerAddress} ${url}`
    if (this.props.service === 'facebook') {
      verificationMessage = `Verifying my Blockstack ID is secured with the address ${this.props.ownerAddress}`
    }
    var textField = document.createElement('textarea')
    textField.innerText = verificationMessage
    document.body.appendChild(textField)
    textField.select()
    document.execCommand('copy')
    textField.remove()
  }

  render() {
    const url = `${VERIFICATION_TWEET_LINK_URL_BASE}${this.props.ownerAddress}`
    var verificationMessage = `Verifying my Blockstack ID is secured with the address ${this.props.ownerAddress} ${url}`

    if (this.props.service === 'facebook') {
      verificationMessage = `Verifying my Blockstack ID is secured with the address ${this.props.ownerAddress}`
    }

    return (
      <div onClick={this.handleClick}>
        <div className="verification-instructions-container">
{/*          <p className="verification-instructions-heading">
            Verification Instructions
          </p>*/}
          <ReactTooltip
            place="top"
            type="dark"
            effect="solid"
            id="tooltip"
            delayHide={1000}
            className="text-center"
            scrollHide={true}
            resizeHide={true}
            afterShow={this.copy}>
            Copied!
          </ReactTooltip>
          <div className="verification-instructions">
            { this.props.service === 'twitter' ?
              <TwitterVerificationInfo
                domainName={this.props.domainName}
                verificationMessage={verificationMessage}
                onPostVerificationButtonClick={this.props.onPostVerificationButtonClick}
                proofUrl={this.props.proofUrl}
                onChange={this.props.onProofUrlChange}
              />
            : null }

            { this.props.service === 'github' ?
              <GithubVerificationInfo
                domainName={this.props.domainName}
                verificationMessage={verificationMessage}
                onPostVerificationButtonClick={this.props.onPostVerificationButtonClick}
                proofUrl={this.props.proofUrl}
                onChange={this.props.onProofUrlChange}
              />
            : null }

            { this.props.service === 'facebook' ?
              <FacebookVerificationInfo
                domainName={this.props.domainName}
                verificationMessage={verificationMessage}
                onPostVerificationButtonClick={this.props.onPostVerificationButtonClick}
                proofUrl={this.props.proofUrl}
                onChange={this.props.onProofUrlChange}
              />
            : null }

            { this.props.service === 'linkedIn' ?
              <LinkedInVerificationInfo
                domainName={this.props.domainName}
                verificationMessage={verificationMessage}
                onPostVerificationButtonClick={this.props.onPostVerificationButtonClick}
                proofUrl={this.props.proofUrl}
                onChange={this.props.onProofUrlChange}
              />
            : null }

            { this.props.service === 'instagram' ?
              <InstagramVerificationInfo
                domainName={this.props.domainName}
                verificationMessage={verificationMessage}
                onPostVerificationButtonClick={this.props.onPostVerificationButtonClick}
                proofUrl={this.props.proofUrl}
                onChange={this.props.onProofUrlChange}
              />
            : null }

            { this.props.service === 'hackerNews' ?
              <HackerNewsVerificationInfo
                domainName={this.props.domainName}
                verificationMessage={verificationMessage}
                onPostVerificationButtonClick={this.props.onPostVerificationButtonClick}
                proofUrl={this.props.proofUrl}
                onChange={this.props.onProofUrlChange}
              />
            : null }

            { !this.state.services.hasOwnProperty(this.props.service) ?
              <p>
                Identity verifications are not yet supported for this account type.
              </p>
            : null }
          </div>
        </div>
      </div>
    )
  }
}

export default VerificationInfo
