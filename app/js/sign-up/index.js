import React from 'react'
import PropTypes from 'prop-types'
import { browserHistory, withRouter } from 'react-router'
import { decodeToken } from 'jsontokens'
import {
  selectConnectedStorageAtLeastOnce,
  selectEmail,
  selectEncryptedBackupPhrase,
  selectIdentityAddresses,
  selectIdentityKeypairs,
  selectPromptedForEmail
} from '@common/store/selectors/account'
import {
  selectLocalIdentities,
  selectRegistration
} from '@common/store/selectors/profiles'

import {
  selectApi,
  selectStorageConnected
} from '@common/store/selectors/settings'

import {
  selectAppManifest,
  selectAppManifestLoaded,
  selectAppManifestLoading,
  selectAppManifestLoadingError
} from '@common/store/selectors/auth'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { AuthActions } from '../auth/store/auth'
import { AccountActions } from '../account/store/account'
import { IdentityActions } from '../profiles/store/identity'
import { SettingsActions } from '../account/store/settings'
import { RegistrationActions } from '../profiles/store/registration'
import { hasNameBeenPreordered } from '@utils/name-utils'
import { trackEventOnce } from '@utils/server-utils'
import { sendRestoreEmail as sendEmail } from '@utils/email-utils'
import queryString from 'query-string'
import log4js from 'log4js'
import { formatAppManifest } from '@common'
import { ShellParent } from '@blockstack/ui'
import {
  Initial,
  Email,
  Password,
  Success,
  Username,
  RecoveryInformationScreen,
  GaiaHubSelect,
  CustomGaiaHub,
  RecommendedGaiaHub
} from './views'
import { notify } from 'reapop'

const logger = log4js.getLogger(__filename)

/**
 * View Order
 *
 * To adjust the sequence of views, change their index here
 */
const views = [
  Initial,
  Username,
  Password,
  GaiaHubSelect,
  CustomGaiaHub,
  Email,
  RecoveryInformationScreen,
  Success,
  RecommendedGaiaHub
]
const VIEWS = {
  INITIAL: 0,
  USERNAME: 1,
  PASSWORD: 2,
  GAIA: 3,
  RECOMMENDED_GAIA_HUB: 8,
  CUSTOMHUB: 4,
  EMAIL: 5,
  INFO: 6,
  HOORAY: 7
}
const VIEW_EVENTS = {
  [VIEWS.INITIAL]: 'Onboarding - Initial',
  [VIEWS.EMAIL]: 'Onboarding - Email',
  [VIEWS.PASSWORD]: 'Onboarding - Password',
  [VIEWS.USERNAME]: 'Onboarding - Username',
  [VIEWS.RECOMMENDED_GAIA_HUB]: 'Onboarding - Recommended Gaia Hub',
  [VIEWS.GAIA]: 'Onboarding - Gaia Hub Select',
  [VIEWS.CUSTOMHUB]: 'Onboarding - Custom Gaia Hub',
  [VIEWS.INFO]: 'Onboarding - Info',
  [VIEWS.HOORAY]: 'Onboarding - Complete'
}

// Allow the front-end (for example Selenium tests or dev console) to override the subdomain suffix.
const DEFAULT_SUBDOMAIN_SUFFIX = 'id.blockstack'
const getSubdomainSuffix = () =>
  window.SUBDOMAIN_SUFFIX_OVERRIDE || DEFAULT_SUBDOMAIN_SUFFIX

const mapStateToProps = state => ({
  localIdentities: selectLocalIdentities(state),
  registration: selectRegistration(state),
  storageConnected: selectStorageConnected(state),
  api: selectApi(state),
  promptedForEmail: selectPromptedForEmail(state),
  encryptedBackupPhrase: selectEncryptedBackupPhrase(state),
  identityAddresses: selectIdentityAddresses(state),
  identityKeypairs: selectIdentityKeypairs(state),
  connectedStorageAtLeastOnce: selectConnectedStorageAtLeastOnce(state),
  email: selectEmail(state),
  appManifest: selectAppManifest(state),
  appManifestLoaded: selectAppManifestLoaded(state),
  appManifestLoading: selectAppManifestLoading(state),
  appManifestLoadingError: selectAppManifestLoadingError(state)
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      ...AccountActions,
      ...SettingsActions,
      ...IdentityActions,
      ...RegistrationActions,
      ...AuthActions,
      notify
    },
    dispatch
  )

class Onboarding extends React.Component {
  state = {
    authRequest: '',
    email: '',
    password: '',
    username: '',
    seed: '',
    appManifest: null,
    emailConsent: false,
    emailSubmitted: false,
    emailsSending: false,
    emailsSent: false,
    recoveryEmailError: null,
    recoveryEmailErrorCount: 0,
    restoreEmailError: null,
    loading: false,
    view: VIEWS.INITIAL,
    usernameRegistrationInProgress: false,
    hubURL: '',
    decodedAuthToken: null,
    customHubError: null
  }
  updateValue = (key, value) => {
    this.setState({ [key]: value })
  }

  toggleConsent = () => {
    this.setState(state => ({
      ...state,
      emailConsent: !state.emailConsent
    }))
  }

  updateView = view => {
    this.setState({ view })
    this.trackViewEvent(view, this.props.appManifest)
  }

  trackViewEvent = (view, appManifest) => {
    trackEventOnce(VIEW_EVENTS[view], {
      appReferrer: appManifest ? appManifest.name : 'N/A'
    })
  }

  backView = (view = this.state.view) => {
    if (view - 1 >= 0) {
      return this.setState({
        view: view - 1
      })
    } else {
      return null
    }
  }
  /**
   * Submit our password
   */
  submitPassword = async () => {
    const decodedAuthRequest = this.getDecodedAuthRequest()
    if (
      decodedAuthRequest &&
      (decodedAuthRequest.solicitGaiaHubUrl ||
        decodedAuthRequest.recommendedGaiaHub)
    ) {
      if (decodedAuthRequest.recommendedGaiaHubUrl) {
        this.updateView(VIEWS.RECOMMENDED_GAIA_HUB)
      } else {
        this.updateView(VIEWS.GAIA)
      }
    } else {
      this.setState({
        loading: true
      })
      await this.createAccount()
      this.updateView(VIEWS.EMAIL)
    }
  }

  /**
   * Set gaia hub
   */
  defaultGaiaHub = async () => {
    this.setState({
      loading: true
    })
    await this.createAccount()
    this.updateView(VIEWS.EMAIL)
  }

  /**
   * Set a custom gaia hub
   */
  customGaiaHub = async () => {
    this.setState({
      loading: true
    })
    const success = await this.validateGaiaURL()
    if (success) {
      await this.createAccount()
      this.updateView(VIEWS.EMAIL)
    }
  }

  submitRecommendedGaiaHub = async () => {
    const decodedAuthRequest = this.getDecodedAuthRequest()
    this.setState(
      {
        loading: true,
        hubURL: decodedAuthRequest.recommendedGaiaHubUrl
      },
      async () => {
        const success = await this.validateGaiaURL()
        if (success) {
          await this.createAccount()
          this.updateView(VIEWS.EMAIL)
        }
      }
    )
  }

  /**
   * Submit Username
   * This will create our account and then register a name and connect storage
   */
  submitUsername = username => {
    this.setState(
      {
        username
      },
      () => this.updateView(VIEWS.PASSWORD)
    )
  }

  /**
   * This is our main function for creating a new account
   */
  createAccount = async () => {
    const { password } = this.state
    if (!password) {
      throw new Error('Missing a password! How did that happen?')
    }
    logger.debug('creating account, createAccount()')

    // Initialize our wallet
    await this.initializeWallet()
    // Create new ID and owner address and then set to default
    await this.createNewIdAndSetDefault()
    // Connect our default storage
    await this.props.connectStorage(this.state.hubURL)
    // Register the username
    await this.registerUsername()
  }

  /**
   * Register the username
   */
  registerUsername = async () => {
    logger.trace('registerUsername')
    let username = this.state.username
    if (!username) {
      logger.info('registerUsername: no username set, skipping registration')
      return Promise.resolve()
    }
    const suffix = `.${getSubdomainSuffix()}`
    username += suffix
    const nameHasBeenPreordered = hasNameBeenPreordered(
      username,
      this.props.localIdentities
    )
    if (nameHasBeenPreordered) {
      /**
       * TODO: redirect them back and then have them choose a new name
       */
      logger.error(
        `registerUsername: username '${username}' has already been preordered`
      )
      return Promise.resolve()
    } else {
      this.setState({
        usernameRegistrationInProgress: true
      })
      logger.debug(
        `registerUsername: will try and register username: ${username}`
      )

      /**
       * This is assuming that there are no accounts, and we're using the first item in the arrays
       */
      const identityIndex = 0
      const address = this.props.identityAddresses[identityIndex]
      const identity = this.props.localIdentities[identityIndex]
      const keypair = this.props.identityKeypairs[identityIndex]

      return this.props
        .registerName(
          this.props.api,
          username,
          identity,
          identityIndex,
          address,
          keypair
        )
        .catch(err => {
          logger.error(`username registration error: ${err}`)
          this.props.notify({
            title: 'Username Registration Failed',
            message:
              `Sorry, something went wrong while registering ${username}. ` +
              'You can try to register again later from your profile page. Some ' +
              'apps may be unusable until you do.',
            status: 'error',
            dismissAfter: 0,
            dismissible: true,
            closeButton: true,
            position: 'b'
          })
          this.setState({
            username: ''
          })
        })
        .then(() => {
          this.setState({
            usernameRegistrationInProgress: false
          })
        })
    }
  }
  /**
   * Finish step
   * this will either send us home or to the app that the user came from
   */
  finish = () => {
    if (this.props.appManifest) {
      this.redirectToAuth()
    } else {
      this.redirectToHome()
    }
  }
  /**
   * Redirect to Auth Request
   */
  redirectToAuth = () => {
    this.props.router.push(`/auth/?authRequest=${this.state.authRequest}`)
  }
  /**
   * Redirect to home
   */
  redirectToHome = () => {
    this.props.router.push('/')
  }
  /**
   * Go to Backup
   * This will navigate the user to the seed screen
   */
  goToBackup = () => {
    browserHistory.push({
      pathname: '/seed',
      state: { seed: this.state.seed, password: this.state.password }
    })
  }

  /**
   * Send Emails
   * this will send both emails (restore and recovery)
   */
  sendEmails = async () => {
    const { encryptedBackupPhrase } = this.props
    const { username, email } = this.state
    const id = username ? `${username}.${getSubdomainSuffix()}` : undefined

    /**
     * TODO: add this as a notification or something the user can see
     */
    if (!encryptedBackupPhrase) {
      return null
    }

    const encodedPhrase = new Buffer(encryptedBackupPhrase, 'hex').toString(
      'base64'
    )

    this.setState({
      emailsSending: true,
      emailsSent: false
    })

    try {
      await sendEmail(email, id, encodedPhrase)
      this.setState({ recoveryEmailError: null })
    } catch (err) {
      this.setState({
        recoveryEmailError: err,
        recoveryEmailErrorCount: this.state.recoveryEmailErrorCount + 1
      })
    }

    return this.setState({
      emailsSending: false,
      emailsSent: true
    })
  }

  async validateGaiaURL() {
    const { hubURL } = this.state
    if (!/^https:\/\//.test(hubURL)) {
      this.setState({
        loading: false,
        customHubError: 'A Gaia Hub URL must use SSL.'
      })
      return false
    }

    try {
      await fetch(`${hubURL}/hub_info`)
    } catch (error) {
      this.setState({
        loading: false,
        customHubError: 'Your Gaia URL does not appear to be a valid Gaia hub.'
      })
      return false
    }

    this.setState({
      customHubError: null
    })

    return true
  }

  /**
   * Decode and save auth request
   *
   * this will save the authRequest to component state and then
   * call the redux action verifyAuthRequestAndLoadManifest
   * which then verifies it and downloads the app manifest
   */
  decodeAndSaveAuthRequest() {
    const { verifyAuthRequestAndLoadManifest, appManifestLoading } = this.props
    const queryDict = queryString.parse(this.props.location.search)

    const authRequest = this.checkForAuthRequest(queryDict)

    if (authRequest && !this.state.authRequest)
      this.setState({
        authRequest
      })

    if (authRequest && !appManifestLoading) {
      verifyAuthRequestAndLoadManifest(authRequest)
    }
  }

  getDecodedAuthRequest() {
    const authRequest = this.props.authRequest || this.state.authRequest
    if (!authRequest) return null
    const decodedAuthRequest = decodeToken(authRequest).payload
    return decodedAuthRequest
  }

  /**
   * Check for Auth Request
   * this returns the authRequest query param if one exists
   */
  checkForAuthRequest = queryDict => {
    if (queryDict.redirect !== null && queryDict.redirect !== undefined) {
      const searchString = queryDict.redirect.replace('/auth', '')
      const redirectQueryDict = queryString.parse(searchString)
      if (
        redirectQueryDict.authRequest !== null &&
        redirectQueryDict.authRequest !== undefined
      ) {
        let authRequest = redirectQueryDict.authRequest
        if (authRequest.includes('#coreAPIPassword')) {
          authRequest = authRequest.split('#coreAPIPassword')[0]
        }
        return authRequest
      }
    }
    return null
  }

  /**
   * initialize our wallet
   * this will initialize our wallet and then create an account for us
   * see account/actions.js
   */
  async initializeWallet() {
    const { password } = this.state
    const { initializeWallet } = this.props
    return initializeWallet(password, null)
  }

  /**
   * Create ID and Set it as default
   * this function needs to fire after the initializeWallet function has finished
   * it will generate a new ID with address and set it as the default ID
   */
  async createNewIdAndSetDefault() {
    const {
      identityAddresses,
      createNewIdentityWithOwnerAddress,
      setDefaultIdentity
    } = this.props
    const firstIdentityIndex = 0
    logger.debug('creating new identity')
    const ownerAddress = identityAddresses[firstIdentityIndex]
    logger.debug('ownerAddress', ownerAddress)
    createNewIdentityWithOwnerAddress(firstIdentityIndex, ownerAddress)
    logger.debug('settingAsDefault')
    setDefaultIdentity(firstIdentityIndex)
  }

  /**
   * Next function for the recovery info screen
   */
  infoNext = () => {
    this.goToBackup()
  }

  componentWillMount() {
    if (this.props.encryptedBackupPhrase) {
      this.props.router.push('/')
    }
    const { location } = this.props
    const queryDict = queryString.parse(location.search)
    const authRequest = this.checkForAuthRequest(queryDict)

    if (authRequest && this.state.authRequest !== authRequest) {
      this.decodeAndSaveAuthRequest()
      this.setState({
        authRequest
      })
    } else {
      // Only fire track immediately if there's no manifest. Otherwise, fire
      // track event in componentWillReceiveProps.
      this.trackViewEvent(this.state.view)
    }

    if (location.query.verified) {
      this.setState({ email: location.query.verified })
      this.updateView(VIEWS.PASSWORD)
    }
  }

  submitEmail = async () => {
    // Send the emails
    await this.sendEmails()
    if (this.state.restoreEmailError || this.state.recoveryEmailError) {
      // if error, force them to record their seed
      this.updateView(VIEWS.INFO)
    } else {
      // register emails sent bool, navigate to final screen
      this.props.emailNotifications(this.state.email, this.state.emailConsent)
      this.updateView(VIEWS.HOORAY)
    }
  }

  componentDidMount() {
    if (!this.props.api.subdomains[getSubdomainSuffix()]) {
      this.props.resetApi(this.props.api)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.appManifest) {
      // If we were waiting on an appManifest, we haven't tracked yet.
      this.trackViewEvent(this.state.view, nextProps.appManifest)
    }
    const decodedAuthRequest = this.getDecodedAuthRequest()
    this.setState({ decodedAuthRequest })
  }

  render() {
    const { appManifest } = this.props
    const {
      email,
      password,
      username,
      emailSubmitted,
      view,
      decodedAuthRequest
    } = this.state

    const app = formatAppManifest(appManifest)

    const viewProps = [
      {
        show: VIEWS.INITIAL,
        props: {
          next: () => this.updateView(VIEWS.USERNAME)
        }
      },
      {
        show: VIEWS.USERNAME,
        props: {
          backLabel: 'Cancel',
          username,
          apiUrl: this.props.api.subdomains[getSubdomainSuffix()].apiUrl,
          sponsoredName: `.${getSubdomainSuffix()}`,
          next: this.submitUsername,
          previous: () => this.updateView(VIEWS.PASSWORD),
          updateValue: this.updateValue,
          isProcessing: this.state.usernameRegistrationInProgress,
          loading: this.state.loading
        }
      },
      {
        show: VIEWS.PASSWORD,
        props: {
          password,
          loading: this.state.loading,
          next: this.submitPassword,
          updateValue: this.updateValue
        }
      },
      {
        show: VIEWS.GAIA,
        props: {
          loading: this.state.loading,
          next: this.defaultGaiaHub,
          customHub: () => this.updateView(VIEWS.CUSTOMHUB)
        }
      },
      {
        show: VIEWS.CUSTOMHUB,
        props: {
          loading: this.state.loading,
          hubURL: this.state.hubURL,
          next: this.customGaiaHub,
          updateValue: this.updateValue,
          customHubError: this.state.customHubError
        }
      },
      {
        show: VIEWS.EMAIL,
        props: {
          email,
          next: () => this.submitEmail(),
          submitted: emailSubmitted,
          updateValue: this.updateValue,
          loading: this.state.emailsSending
        }
      },
      {
        show: VIEWS.INFO,
        props: {
          email,
          password,
          username,
          app,
          restoreEmailError: this.state.restoreEmailError,
          emailsSending: this.state.emailsSending,
          recoveryEmailErrorCount: this.state.recoveryEmailErrorCount,
          sendRestoreEmail: () => this.sendEmails('restore'),
          next: () => this.infoNext()
        }
      },
      {
        show: VIEWS.HOORAY,
        props: {
          email,
          password,
          username,
          app,
          id: this.props.identityAddresses[0],
          subdomainSuffix: getSubdomainSuffix(),
          goToRecovery: this.goToBackup,
          finish: () => this.finish()
        }
      },
      {
        show: VIEWS.RECOMMENDED_GAIA_HUB,
        props: {
          recommendedGaiaHubUrl:
            decodedAuthRequest && decodedAuthRequest.recommendedGaiaHubUrl,
          updateValue: this.updateValue,
          next: () => this.submitRecommendedGaiaHub(),
          customHub: () => this.updateView(VIEWS.CUSTOMHUB),
          defaultHub: this.defaultGaiaHub,
          loading: this.state.loading,
          customHubError: this.state.customHubError,
          app
        }
      }
    ]

    const currentViewProps = viewProps.find(v => v.show === view) || {}

    const componentProps = {
      email,
      password,
      username,
      emailSubmitted,
      view,
      toggleConsent: () => this.toggleConsent(),
      consent: this.state.emailConsent,
      backView: v => this.backView(v),
      ...currentViewProps.props
    }

    return (
      <>
        <ShellParent
          app={app}
          views={views}
          {...componentProps}
          disableBackOnView={[0, VIEWS.INFO, VIEWS.EMAIL, views.length - 1]}
          disableBack={this.state.loading}
        />
      </>
    )
  }
}

Onboarding.propTypes = {
  api: PropTypes.object.isRequired,
  location: PropTypes.object,
  router: PropTypes.object,
  appManifest: PropTypes.object,
  appManifestLoading: PropTypes.bool,
  appManifestLoaded: PropTypes.bool,
  appManifestLoadingError: PropTypes.node,
  identityAddresses: PropTypes.array,
  createNewIdentityWithOwnerAddress: PropTypes.func.isRequired,
  setDefaultIdentity: PropTypes.func.isRequired,
  initializeWallet: PropTypes.func.isRequired,
  emailNotifications: PropTypes.func.isRequired,
  localIdentities: PropTypes.array.isRequired,
  identityKeypairs: PropTypes.array.isRequired,
  registerName: PropTypes.func.isRequired,
  resetApi: PropTypes.func.isRequired,
  verifyAuthRequestAndLoadManifest: PropTypes.func.isRequired,
  encryptedBackupPhrase: PropTypes.string,
  notify: PropTypes.func.isRequired,
  connectStorage: PropTypes.func.isRequired,
  authRequest: PropTypes.string
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Onboarding)
)
