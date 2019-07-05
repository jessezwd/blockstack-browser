import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Initial, Password, Seed, SeedConfirm, Success } from './views'
import { decrypt } from '@utils/encryption-utils'
import { withRouter, browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { AccountActions } from '../account/store/account'
import { IdentityActions } from '../profiles/store/identity'
import { ShellParent, AppHomeWrapper } from '@blockstack/ui'
import {
  selectEncryptedBackupPhrase,
  selectRecoveryCodeVerified
} from '@common/store/selectors/account'
import {
  selectAppManifest,
  selectAuthRequest
} from '@common/store/selectors/auth'
import { formatAppManifest } from '@common'
import App from '../App'
import log4js from 'log4js'

const logger = log4js.getLogger(__filename)

function mapStateToProps(state) {
  return {
    encryptedBackupPhrase: selectEncryptedBackupPhrase(state),
    appManifest: selectAppManifest(state),
    authRequest: selectAuthRequest(state),
    verified: selectRecoveryCodeVerified(state)
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      ...AccountActions,
      ...IdentityActions
    },
    dispatch
  )
}

const views = [Initial, Password, Seed, SeedConfirm, Success]

const VIEWS = {
  KEY_INFO: 0,
  UNLOCK_KEY: 1,
  SEED: 2,
  KEY_CONFIRM: 3,
  KEY_COMPLETE: 4
}

class SeedContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      encryptedBackupPhrase:
        (props.location &&
          props.location.query &&
          props.location.query.encrypted) ||
        props.encryptedBackupPhrase ||
        null,
      view: 0,
      seed: null,
      loading: false,
      decrypting: false,
      errors: null,
      password:
        props.location && props.location.state && props.location.state.password
          ? props.location.state.password
          : null
    }

    // Immediately replace browser history with one that has state
    browserHistory.replace({
      pathname: this.props.location.pathname,
      query: this.props.location.query,
      state: { view: this.state.view }
    })
  }

  componentDidMount() {
    this.popListener = browserHistory.listen(location => {
      if (location.action === 'POP') {
        this.updateView(location.state ? location.state.view : VIEWS.KEY_INFO)
      }
    })
  }

  componentWillUnmount() {
    // Unbinds pop listener
    this.popListener()
  }

  setVerified = () =>
    !this.props.verified ? this.props.doVerifyRecoveryCode() : null

  updateValue = (key, value) => {
    this.setState({ [key]: value })
  }

  updateView = (view, noPush) => {
    if (this.state.view !== view) {
      this.setState({ view })
      if (!noPush) {
        browserHistory.push({
          pathname: this.props.location.pathname,
          query: this.props.location.query,
          state: { view }
        })
      }
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.seed && prevState.decrypting) {
      return {
        ...prevState,
        decrypting: false
      }
    }
    return prevState
  }

  decryptSeed = async p => {
    const encryptedBackupPhrase =
      this.state.encryptedBackupPhrase || this.props.encryptedBackupPhrase
    if (!encryptedBackupPhrase) {
      logger.log('no encryptedBackupPhrase')
      return null
    }
    let password = p
    if (!password) {
      const { location } = this.props
      if (location && location.state && location.state.password) {
        password = location.state.password
      }
    }
    logger.log('decrypting password')

    // the encrypted phrase we get in the url is base64 encoded, whereas in redux it is hex encoded
    const method =
      this.props.location &&
      this.props.location.query &&
      this.props.location.query.encrypted
        ? 'base64'
        : 'hex'

    const buffer = new Buffer(encryptedBackupPhrase, method)

    try {
      const result = await decrypt(buffer, password)
      if (this.state.seed !== result.toString()) {
        return this.setState(
          {
            seed: result.toString()
          },
          () => setTimeout(() => this.updateView(VIEWS.SEED))
        )
      } else {
        return null
      }
    } catch (e) {
      logger.error(e.message)
      this.setState({
        errors: {
          password: e.message
        },
        decrypting: false
      })
      return null
    }
  }

  passwordNext = password => {
    if (this.state.seed) {
      return null
    }

    return this.setState(
      {
        password,
        errors: null
      },
      () => setTimeout(() => this.autoDecrypt())
    )
  }

  passwordPassedFromSignUp = () => {
    const { location } = this.props
    if (location && location.state && location.state.password) {
      return location.state.password
    }
    return null
  }

  initialAction = () => {
    let password = undefined
    if (this.passwordPassedFromSignUp()) {
      password = this.passwordPassedFromSignUp()
    } else if (this.state.password) {
      password = this.state.password
    }
    if (this.state.seed) {
      return this.updateView(VIEWS.SEED)
    } else if (!password) {
      return this.updateView(VIEWS.UNLOCK_KEY)
    }
    return this.autoDecrypt()
  }

  autoDecrypt = (p = undefined) => {
    let password = p
    if (!password && this.passwordPassedFromSignUp()) {
      password = this.passwordPassedFromSignUp()
    } else if (!password && this.state.password) {
      password = this.state.password
    }
    if (!password) {
      return null
    }
    if (!this.state.seed && password && !this.state.decrypting) {
      return this.setState(
        {
          decrypting: true
        },
        () => setTimeout(() => this.decryptSeed(password), 50)
      )
    }
    if (this.state.seed && this.state.view === VIEWS.UNLOCK_KEY) {
      return setTimeout(() => this.updateView(VIEWS.SEED), 50)
    }
    return null
  }

  finish = () => {
    if (formatAppManifest(this.props.appManifest) && this.props.authRequest) {
      return this.redirectToAuth()
    } else {
      return browserHistory.push({
        pathname: '/',
        state: {}
      })
    }
  }

  /**
   * Redirect to Auth Request
   */
  redirectToAuth = () => {
    browserHistory.push(`/auth/?authRequest=${this.props.authRequest}`)
  }

  backView = () => {
    browserHistory.goBack()
  }

  render() {
    const { password, view, seed } = this.state

    const viewProps = [
      {
        show: VIEWS.KEY_INFO,
        props: {
          loading: this.state.decrypting,
          placeholder: 'Unlocking Recovery Key...',
          next: () => this.initialAction(),
          backLabel: 'Cancel',
          backView: () =>
            browserHistory.push({
              pathname: '/',
              state: {}
            })
        }
      },
      {
        show: VIEWS.UNLOCK_KEY,
        props: {
          loading: this.state.decrypting,
          placeholder: 'Unlocking Recovery Key...',
          previous: () => this.updateView(VIEWS.KEY_INFO),
          next: p => this.passwordNext(p),
          errors: this.state.errors,
          password
        }
      },
      {
        show: VIEWS.SEED,
        props: {
          previous: () => this.updateView(VIEWS.KEY_INFO),
          next: () =>
            this.updateView(
              this.props.verified ? VIEWS.KEY_COMPLETE : VIEWS.KEY_CONFIRM
            ),
          seed: seed && seed.toString().split(' '),
          seedString: seed && seed.toString()
        }
      },
      {
        show: VIEWS.KEY_CONFIRM,
        props: {
          previous: () => this.updateView(VIEWS.SEED),
          next: () => this.updateView(VIEWS.KEY_COMPLETE),
          seed: seed && seed.toString().split(' '),
          setVerified: () => this.setVerified(),
          verified: this.props.verified
        }
      },
      {
        show: VIEWS.KEY_COMPLETE,
        props: {
          finish: () => this.finish(),
          buttonLabel:
            formatAppManifest(this.props.appManifest) && this.props.authRequest
              ? `Go to ${formatAppManifest(this.props.appManifest).name}`
              : 'Go to Blockstack'
        }
      }
    ]

    const currentViewProps = viewProps.find(v => v.show === view) || {}

    const componentProps = {
      password,
      view,
      backView: () => this.backView(),
      ...currentViewProps.props
    }

    const app = formatAppManifest(this.props.appManifest)

    return (
      <App>
        <ShellParent app={app} views={views} {...componentProps} backOnLast />
        <AppHomeWrapper />
      </App>
    )
  }
}

SeedContainer.propTypes = {
  location: PropTypes.object.isRequired,
  appManifest: PropTypes.object,
  router: PropTypes.object,
  encryptedBackupPhrase: PropTypes.string,
  authRequest: PropTypes.string,
  verified: PropTypes.bool.isRequired,
  doVerifyRecoveryCode: PropTypes.func.isRequired
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(SeedContainer)
)
