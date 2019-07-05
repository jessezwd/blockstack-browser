import * as types from './types'
import log4js from 'log4js'

const logger = log4js.getLogger(__filename)

function loadingPGPKey(identifier) {
  return {
    type: types.LOADING_PGP_KEY,
    identifier
  }
}

function loadingPGPKeyError(identifier, error) {
  return {
    type: types.LOADING_PGP_KEY_ERROR,
    identifier,
    error
  }
}

function loadedPGPKey(identifier, key) {
  return {
    type: types.LOADED_PGP_KEY,
    identifier,
    key
  }
}

function loadPGPPublicKey(contentUrl, identifier) {
  logger.info('loadPGPPublicKey')
  return dispatch => {
    dispatch(loadingPGPKey(identifier))
    return proxyFetch(contentUrl)
      .then(response => response.text())
      .then(publicKey => {
        dispatch(loadedPGPKey(identifier, publicKey))
      })
      .catch((error) => {
        logger.error('loadPGPPublicKey: error', error)
        const msg = `We were unable to load the PGP key at ${contentUrl}.` +
                    ' Please make sure the server is online and uses https.'
        dispatch(loadingPGPKeyError(identifier,  msg))
      })
  }
}

export const PGPActions = {
  loadedPGPKey,
  loadingPGPKey,
  loadingPGPKeyError,
  loadPGPPublicKey
}

export default PGPActions
