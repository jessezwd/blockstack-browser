import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { decrypt } from '../../../../app/js/utils/encryption-utils'
import AccountActions from '../../../../app/js/account/store/account/actions'
import {
  CREATE_ACCOUNT,
  DELETE_ACCOUNT,
  UPDATE_BACKUP_PHRASE,
  NEW_BITCOIN_ADDRESS,
  RESET_CORE_BALANCE_WITHDRAWAL,
  PROMPTED_FOR_EMAIL,
  CONNECTED_STORAGE,
  VIEWED_RECOVERY_CODE,
  RECOVERY_CODE_VERIFIED,
  INCREMENT_IDENTITY_ADDRESS_INDEX,
  NEW_IDENTITY_ADDRESS,
  WITHDRAW_CORE_BALANCE_ERROR,
  WITHDRAWING_CORE_BALANCE,
  BUILD_TRANSACTION,
  BUILD_TRANSACTION_SUCCESS,
  BUILD_TRANSACTION_ERROR,
  BROADCAST_TRANSACTION,
  BROADCAST_TRANSACTION_SUCCESS,
  BROADCAST_TRANSACTION_ERROR,
  WITHDRAW_CORE_BALANCE_SUCCESS,
  UPDATE_CORE_ADDRESS,
  UPDATE_CORE_BALANCE,
  UPDATE_BALANCES
} from '../../../../app/js/account/store/account/types'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('AccountActions', () => {
  describe('createAccount', () => {
    const getBlockchainIdentitiesResult = {
      identityPublicKeychain: 'fakeIdentityPublicKeychain',
      bitcoinPublicKeychain: 'fakeBitcoinPublicKeychain',
      firstBitcoinAddress: 'fakeFirstBitcoinAddress',
      identityAddresses: 'fakeIdentityAddresses',
      identityKeypairs: 'fakeIdentityAddresses'
    }
    const encryptedBackupPhrase = 'fakeEncryptedBackupPhrase'
    const masterKeychain = 'fakeMasterKeychain'
    const identitiesToGenerate = 'fakeIdentitiesToGenerate'
    let action
    let getBlockchainIdentitiesStub

    beforeEach(() => {
      getBlockchainIdentitiesStub = sinon.stub().returns(getBlockchainIdentitiesResult)
      AccountActions.__Rewire__('getBlockchainIdentities', getBlockchainIdentitiesStub)
      action = AccountActions.createAccount(
        encryptedBackupPhrase,
        masterKeychain,
        identitiesToGenerate
      )
    })

    afterEach(() => {
      AccountActions.__ResetDependency__('getBlockchainIdentities')
    })

    describe('gets Blockchain Identities', () => {
      it('based on masterKeychain and identitiesToGenerate passed as params 1 & 2', () => {
          assert.equal(getBlockchainIdentitiesStub.callCount, 1)
          assert.equal(
            getBlockchainIdentitiesStub.calledWith(
              masterKeychain, identitiesToGenerate),
            true
          )
      })

      describe('and returns an object with', () => {
        it('.type CREATE_ACCOUNT', () => {
            assert.equal(action.type, CREATE_ACCOUNT)
        })

        it('.encryptedBackupPhrase == encryptedBackupPhrase passed as param', () => {
            assert.equal(action.encryptedBackupPhrase, encryptedBackupPhrase)
        })

        it('.bitcoinPublicKeychain got from blockchain identities', () => {
            assert.equal(
              action.bitcoinPublicKeychain,
              getBlockchainIdentitiesResult.bitcoinPublicKeychain)
        })

        it('.firstBitcoinAddress got from blockchain identities', () => {
            assert.equal(
              action.firstBitcoinAddress,
              getBlockchainIdentitiesResult.firstBitcoinAddress)
        })

        it('.identityAddresses got from blockchain identities', () => {
            assert.equal(
              action.identityAddresses,
              getBlockchainIdentitiesResult.identityAddresses)
        })

        it('.identityKeypairs got from blockchain identities', () => {
            assert.equal(
              action.identityKeypairs,
              getBlockchainIdentitiesResult.identityKeypairs)
        })
      })
    })
  })

  describe('updateBackupPhrase', () => {
    const encryptedBackupPhrase = 'fakeEncryptedBackupPhrase'
    const action = AccountActions.updateBackupPhrase(encryptedBackupPhrase)

    it('returns .type UPDATE_BACKUP_PHRASE', () => {
      assert.equal(action.type, UPDATE_BACKUP_PHRASE)
    })

    it('returns .encryptedBackupPhrase set by 1st param', () => {
      assert.equal(action.encryptedBackupPhrase, encryptedBackupPhrase)
    })
  })

  describe('initializeWallet', () => {
    it('creates an new account with a new master keychain', () => {
      const store = mockStore({})
      const password = 'password'

      return store
        .dispatch(AccountActions.initializeWallet(password))
        .then(() => {
          const actions = store.getActions()

          assert.equal(actions.length, 1)
          assert.equal(actions[0].type, CREATE_ACCOUNT)
        })
    })

    it('restores an existing wallet and keychain', () => {
      const store = mockStore({})
      const password = 'password'
      const backupPhrase =
        'sound idle panel often situate develop unit text design antenna ' +
        'vendor screen opinion balcony share trigger accuse scatter visa uniform brass ' +
        'update opinion media'
      const bitcoinPublicKeychain =
        'xpub6Br2scNTh9Luk2VPebfEvjbWWC5WhvxpxgK8ap2qhYTS4xvZu' +
        '8Y3G1npmx8DdvwUdCbtNb7qNLyTChKMbY8dThLV5Zvdq9AojQjxrM6gTC8'
      const identityPublicKeychain =
        'xpub6B6tCCb8T5eXUKVYUoppmSi5KhNRboRJUwqHavxdvQTncfmB' +
        'NFCX4Nq9w8DsfuS6AYPpBYRuS3dcUuyF8mQtwEydAEN3A4Cx6HDy58jpKEb'
      const firstBitcoinAddress = '112FogMTesWmLzkWbtKrSg3p9LK6Lucn4s'
      const identityAddresses = ['1JeTQ5cQjsD57YGcsVFhwT7iuQUXJR6BSk']

      const identityKeypairs = [
        {
          key:
            'a29c3e73dba79ab0f84cb792bafd65ec71f243ebe67a7ebd842ef5cdce3b21eb',
          keyID:
            '03e93ae65d6675061a167c34b8321bef87594468e9b2dd19c05a67a7b4caefa017',
          address: '1JeTQ5cQjsD57YGcsVFhwT7iuQUXJR6BSk',
          appsNodeKey:
            'xprvA1y4zBndD83n6PWgVH6ivkTpNQ2WU1UGPg9hWa2q8sCANa7YrYMZFHWMhrbpsarx' +
            'XMuQRa4jtaT2YXugwsKrjFgn765tUHu9XjyiDFEjB7f',
          salt:
            'c15619adafe7e75a195a1a2b5788ca42e585a3fd181ae2ff009c6089de54ed9e'
        }
      ]

      return store
        .dispatch(AccountActions.initializeWallet(password, backupPhrase))
        .then(() => {
          const actions = store.getActions()

          assert.equal(actions.length, 1)
          assert.equal(actions[0].bitcoinPublicKeychain, bitcoinPublicKeychain)
          assert.equal(
            actions[0].identityPublicKeychain,
            identityPublicKeychain
          )
          assert.equal(actions[0].firstBitcoinAddress, firstBitcoinAddress)
          assert.deepEqual(actions[0].identityAddresses, identityAddresses)
          assert.deepEqual(actions[0].identityKeypairs, identityKeypairs)
        })
    })

    it('generates and restores the same wallet', () => {
      const store1 = mockStore({})
      const password = 'password'

      return store1
        .dispatch(AccountActions.initializeWallet(password))
        .then(() => {
          const actions1 = store1.getActions()

          assert.equal(actions1.length, 1)
          assert.equal(actions1[0].type, CREATE_ACCOUNT)

          const encryptedBackupPhrase = actions1[0].encryptedBackupPhrase
          const identityPublicKeychain = actions1[0].identityPublicKeychain
          const bitcoinPublicKeychain = actions1[0].bitcoinPublicKeychain

          return decrypt(
            new Buffer(encryptedBackupPhrase, 'hex'),
            password
          ).then(plaintextBuffer => {
            const backupPhrase = plaintextBuffer.toString()
            const store2 = mockStore({})

            return store2
              .dispatch(AccountActions.initializeWallet(password, backupPhrase))
              .then(() => {
                const actions2 = store2.getActions()

                assert.equal(actions2.length, 1)
                assert.equal(actions2[0].type, CREATE_ACCOUNT)
                assert.equal(
                  actions2[0].identityPublicKeychain,
                  identityPublicKeychain
                )
                assert.equal(
                  actions2[0].bitcoinPublicKeychain,
                  bitcoinPublicKeychain
                )
              })
          })
        })
    })
  })

  describe('newBitcoinAddress', () => {
    const action = AccountActions.newBitcoinAddress()

    it('returns .type NEW_BITCOIN_ADDRESS', () => {
      assert.equal(action.type, NEW_BITCOIN_ADDRESS)
    })
  })

  describe('deleteAccount', () => {
    const action = AccountActions.deleteAccount()

    it('returns .type DELETE_ACCOUNT', () => {
      assert.equal(action.type, DELETE_ACCOUNT)
    })

    it('returns .encryptedBackupPhrase set to null', () => {
      assert.equal(action.encryptedBackupPhrase, null)
    })

    it('returns .accountCreated set to false', () => {
      assert.equal(action.accountCreated, false)
    })
  })

  describe('refreshBalances', () => {
    describe('for each address provided as second param', () => {
      const balanceUrl = 'fakeBalanceUrl'
      const address = 'fakeAddresses'
      const addresses = [address]
      let action
      const callAction = () => {
        action = AccountActions.refreshBalances(
          balanceUrl,
          addresses
        )
      }

      afterEach(() => {
        AccountActions.__ResetDependency__('getInsightUrls')
      })

      describe('fetches confirmedBalanceUrl', () => {
        describe('and when failing', () => {
          const error = new Error()

          beforeEach(() => {
            sinon.stub(global, 'fetch').rejects(error)
            callAction()
          })

          afterEach(() => {
            sinon.restore(global, 'fetch')
          })

          it('it does nothing', () => {
            const store = mockStore({})

            return store.dispatch(action)
              .catch(() => {
                assert.equal(store.getActions().length, 0)
              })
          })
        })

        describe('and when working', () => {
          let fetchStub

          describe('retrieves confirmedBalance from response', () => {
            const confirmedBalance = 110000000
            const response = {
              text: sinon.stub().returns(`${confirmedBalance}`)
            }

            beforeEach(() => {
              fetchStub = sinon.stub(global, 'fetch')
              fetchStub
                .withArgs(balanceUrl)
                .resolves(response)
            })

            afterEach(() => {
              sinon.restore(global, 'fetch')
            })

            describe('and when done with all addresses', () => {
              const addresses2 = [
                'fakeAddress1'
              ]
              const fetchedBalances = [
                199999999,
              ]

              beforeEach(() => {
                sinon.restore(global, 'fetch')
                const fetchStub2 = sinon.stub(global, 'fetch')
                const fetchStub20 = fetchStub2
                  .withArgs(`${balanceUrl}${addresses2[0]}`)
                  fetchStub20.onCall(0).resolves({text: () => `${fetchedBalances[0]}`})
              })

              afterEach(() => {
                sinon.restore(global, 'fetch')
              })

              describe('dispatches updateBalances action', () => {
                const satoshisToBtc = s => s / 100000000

                it('with { addressN: balanceN..., total: }', () => {
                  const store = mockStore({})

                  return store.dispatch(
                    AccountActions.refreshBalances(
                      balanceUrl,
                      addresses2
                    )
                  ).then(() => {
                    const balances = {}
                    let total = .0
                    addresses2.forEach((el, i) => {
                      balances[el] = satoshisToBtc(
                        fetchedBalances[i])
                      total += balances[el]
                    })
                    balances.total = total
                    assert.deepEqual(store.getActions()[0], {
                      type: UPDATE_BALANCES,
                      balances
                    })
                  })
                })
              })
            })

          })
        })
      })
    })
  })

  describe('getCoreWalletAddress', () => {
    const walletPaymentAddressUrl = 'fakeWalletPaymentAddressUrl'
    const coreAPIPassword = 'fakeCoreAPIPassword'

    let action

    beforeEach(() => {
      action = AccountActions.getCoreWalletAddress(
        walletPaymentAddressUrl,
        coreAPIPassword
      )
    })

    describe('when isCoreEndpointDisabled', () => {
      beforeEach(() => {
        AccountActions.__Rewire__('isCoreEndpointDisabled',
          sinon.stub().withArgs(walletPaymentAddressUrl).returns(true)
        )
      })

      afterEach(() => {
        AccountActions.__ResetDependency__('isCoreEndpointDisabled')
      })

      it('it does nothing', () => {
        const store = mockStore({})

        return store.dispatch(action)
          .then(() => {
            assert.equal(store.getActions().length, 0)
          })
      })
    })

    describe('when not isCoreEndpointDisabled', () => {
      beforeEach(() => {
        AccountActions.__Rewire__('isCoreEndpointDisabled',
          sinon.stub().withArgs(walletPaymentAddressUrl).returns(false)
        )
      })

      afterEach(() => {
        AccountActions.__ResetDependency__('isCoreEndpointDisabled')
      })

      describe('fetches walletPaymentAddressUrl with authorizationHeader', () => {
        const authorizationHeaderValueResult = 'fakeAuthorizationHeaderValue'
        const fetchArgs = [
          walletPaymentAddressUrl,
          { headers: { Authorization: authorizationHeaderValueResult } }
        ]
        let fetchStub

        beforeEach(() => {
          AccountActions.__Rewire__('authorizationHeaderValue',
            sinon.stub().withArgs(coreAPIPassword).returns(authorizationHeaderValueResult))
          fetchStub = sinon.stub(global, 'fetch').withArgs(...fetchArgs)
        })

        afterEach(() => {
          AccountActions.__ResetDependency__('authorizationHeaderValue')
          sinon.restore(global, 'fetch')

        })

        describe('and when failing', () => {
          const error = new Error()

          beforeEach(() => {
            fetchStub.rejects(error)
          })

          it('it does nothing', () => {
            const store = mockStore({})

            return store.dispatch(action)
              .catch(() => {
                assert.equal(store.getActions().length, 0)
              })
          })
        })

        describe('and when working', () => {
          const address = 'fakeAddress'
          const jsonAddressTxt = JSON.stringify({ address })

          beforeEach(() => {
            fetchStub.resolves({text: () => jsonAddressTxt})
          })

          describe('parses address from response', () => {
            it('and dispatches updateCoreWalletAddress with address', () => {
              const store = mockStore({})

              return store.dispatch(action)
                .then(() => {
                  assert.deepEqual(store.getActions()[0], {
                    type: UPDATE_CORE_ADDRESS,
                    coreWalletAddress: address
                  })
                })
            })
          })
        })
      })
    })
  })

  describe('refreshCoreWalletBalance', () => {
    const addressBalanceUrl = 'fakeAddressBalanceUrl'
    const coreAPIPassword = 'fakeCoreAPIPassword'

    let action

    beforeEach(() => {
      action = AccountActions.refreshCoreWalletBalance(
        addressBalanceUrl,
        coreAPIPassword
      )
    })

    describe('when isCoreEndpointDisabled', () => {
      beforeEach(() => {
        AccountActions.__Rewire__('isCoreEndpointDisabled',
          sinon.stub().withArgs(addressBalanceUrl).returns(true)
        )
      })

      afterEach(() => {
        AccountActions.__ResetDependency__('isCoreEndpointDisabled')
      })

      it('dispatches updateCoreWalletBalance(0)', () => {
        const store = mockStore({})

        return store.dispatch(action)
          .then(() => {
            assert.deepEqual(store.getActions()[0], {
              type: UPDATE_CORE_BALANCE,
              coreWalletBalance: 0
            })
          })
      })
    })

    describe('when not isCoreEndpointDisabled', () => {
      beforeEach(() => {
        AccountActions.__Rewire__('isCoreEndpointDisabled',
          sinon.stub().withArgs(addressBalanceUrl).returns(false)
        )
      })

      afterEach(() => {
        AccountActions.__ResetDependency__('isCoreEndpointDisabled')
      })

      describe('fetches addressBalanceUrl with authorizationHeader', () => {
        const authorizationHeaderValueResult = 'fakeAuthorizationHeaderValue'
        const fetchArgs = [
          addressBalanceUrl,
          { headers: { Authorization: authorizationHeaderValueResult } }
        ]
        let fetchStub

        beforeEach(() => {
          AccountActions.__Rewire__('authorizationHeaderValue',
            sinon.stub().withArgs(coreAPIPassword).returns(authorizationHeaderValueResult))
          fetchStub = sinon.stub(global, 'fetch').withArgs(...fetchArgs)
        })

        afterEach(() => {
          AccountActions.__ResetDependency__('authorizationHeaderValue')
          sinon.restore(global, 'fetch')
        })

        describe('and when failing', () => {
          const error = new Error()

          beforeEach(() => {
            fetchStub.rejects(error)
          })

          it('it does nothing', () => {
            const store = mockStore({})

            return store.dispatch(action)
              .catch(() => {
                assert.equal(store.getActions().length, 0)
              })
          })
        })

        describe('and when working', () => {
          const bitcoin = 'fakeAddress'
          const jsonBitcoinBalanceTxt = JSON.stringify({ balance: { bitcoin } })

          beforeEach(() => {
            fetchStub.resolves({text: () => jsonBitcoinBalanceTxt})
          })

          describe('parses bitcoin balance from response', () => {
            it('dispatches updateCoreWalletBalance with address', () => {
              const store = mockStore({})

              return store.dispatch(action)
                .catch(() => {
                  assert.deepEqual(store.getActions()[0], {
                    type: UPDATE_CORE_BALANCE,
                    coreWalletBalance: bitcoin
                  })
                })
            })
          })
        })
      })
    })
  })

  describe('resetCoreWithdrawal', () => {
    describe('dispatches an action', () => {
      let action

      beforeEach(() => {
        action = AccountActions.resetCoreWithdrawal()
      })

      it('with .type  RESET_CORE_BALANCE_WITHDRAWAL', () => {
        const store = mockStore({})

        store.dispatch(action)
        assert.deepEqual(store.getActions()[0], {
          type: RESET_CORE_BALANCE_WITHDRAWAL
        })
      })
    })
  })

  describe('buildBitcoinTransaction', () => {
    const paymentKey = 'fakePaymentKey'
    const recipientAddress = 'fakeRecipientAddress'
    const amountBTC = 1
    const amountSatoshis = amountBTC * 1e8
    const configMock = {}
    const networkMock = {
      defaults: {
        LOCAL_REGTEST: {
          coerceAddress: sinon.stub().returns('coercedRecipientAddress')
        }
      }
    }
    let store
    let action

    const callAction = (regTestMode = false) =>
      AccountActions.buildBitcoinTransaction(
        regTestMode,
        paymentKey,
        recipientAddress,
        amountBTC
      )

    beforeEach(() => {
      store = mockStore({})
      AccountActions.__Rewire__('config', configMock)
      AccountActions.__Rewire__('network', networkMock)
    })

    afterEach(() => {
      AccountActions.__ResetDependency__('config')
      AccountActions.__ResetDependency__('network')
    })

    describe('when regTestMode', () => {
      beforeEach(() => {
        AccountActions.__Rewire__('transactions', {
          makeBitcoinSpend: sinon.stub().rejects(new Error())
        })
        action = callAction(true)
      })

      afterEach(() => {
        AccountActions.__ResetDependency__('transactions')
      })

      it('sets config.network to LOCAL_REGTEST', () =>
        store.dispatch(action)
          .then(() => {
            assert.equal(configMock.network, networkMock.defaults.LOCAL_REGTEST)
          })
      )

      it('sets blockstackAPIUrl to http://localhost:6270', () =>
        store.dispatch(action)
          .then(() => {
            assert.equal(configMock.network.blockstackAPIUrl, 'http://localhost:6270')
          })
      )
    })

    it('dispatches buildTransaction', () => {
      AccountActions.__Rewire__('transactions', {
        makeBitcoinSpend: sinon.stub().rejects(new Error())
      })
      action = callAction(false)

      store.dispatch(action)
        .then(() => {
          assert.deepEqual(store.getActions()[0], {
            type: BUILD_TRANSACTION
          })
        })

      AccountActions.__ResetDependency__('transactions')
    })

    describe('makes a makeBitcoinSpend transaction', () => {
      describe('(when no regTestMode)', () => {
        const makeBitcoinSpendStub = sinon.stub()
          .withArgs(recipientAddress, paymentKey, amountSatoshis)
          .rejects(new Error())

        beforeEach(() => {
          AccountActions.__Rewire__('transactions', {
            makeBitcoinSpend: makeBitcoinSpendStub
          })
          action = callAction(false)
        })

        afterEach(() => {
          AccountActions.__ResetDependency__('transactions')
        })

        it('with recipientAddress, paymentKey, amountSatoshis', () =>
          store.dispatch(action)
            .then(() => {
              assert.deepEqual(makeBitcoinSpendStub.firstCall.args,
                [recipientAddress, paymentKey, amountSatoshis])
            })
        )
      })

      describe('(when regTestMode)', () => {
        let makeBitcoinSpendStub
        let coercedRecipientAddress

        beforeEach(() => {
          configMock.network = networkMock.defaults.LOCAL_REGTEST
          configMock.network.blockstackAPIUrl = 'http://localhost:6270'
          coercedRecipientAddress = configMock.network.coerceAddress(recipientAddress)
          makeBitcoinSpendStub = sinon.stub()
            .withArgs(coercedRecipientAddress, paymentKey, amountSatoshis)
            .rejects(new Error())
          AccountActions.__Rewire__('transactions', {
            makeBitcoinSpend: makeBitcoinSpendStub
          })
          action = callAction(true)
        })

        afterEach(() => {
          AccountActions.__ResetDependency__('transactions')
        })

        it('with coerced recipientAddress and amountBTC', () =>
          store.dispatch(action)
            .then(() => {
              assert.deepEqual(makeBitcoinSpendStub.firstCall.args,
                [coercedRecipientAddress, paymentKey, amountSatoshis])
            })
        )
      })

      describe('when failing', () => {
        const error = new Error('test error')
        const makeBitcoinSpendStub = sinon.stub()
          .withArgs(recipientAddress, paymentKey, amountSatoshis)
          .rejects(error)
        beforeEach(() => {
          AccountActions.__Rewire__('transactions', {
            makeBitcoinSpend: makeBitcoinSpendStub
          })
          action = callAction(false)
        })

        afterEach(() => {
          AccountActions.__ResetDependency__('transactions')
        })

        it('dispatches buildTransactionError', () =>
          store.dispatch(action)
            .then(() => {
              assert.deepEqual(store.getActions()[1], {
                type: BUILD_TRANSACTION_ERROR,
                payload: error.message
              })
            })
        )
      })

      describe('when working', () => {
        const transactionHex = 'fakeTransactionhex'
        const makeBitcoinSpendStub = sinon.stub()
          .withArgs(recipientAddress, paymentKey, amountSatoshis)
          .resolves(transactionHex)

        beforeEach(() => {
          AccountActions.__Rewire__('transactions', {
            makeBitcoinSpend: makeBitcoinSpendStub
          })
        })

        afterEach(() => {
          AccountActions.__ResetDependency__('transactions')
        })

        describe('dispatches buildTransactionSuccess action', () => {
          beforeEach(() => {
            action = callAction(false)
          })

          it('to signal success', () =>
            store.dispatch(action)
              .then(() => {
                assert.deepEqual(store.getActions()[1], {
                  type: BUILD_TRANSACTION_SUCCESS,
                  payload: transactionHex
                })
              })
          )
        })
      })
    })
  })

  describe('broadcastBitcoinTransaction', () => {
    const fakeTxHex = 'faketxhex'
    const fakeError = new Error('fake error')
    const broadcastSuccess = sinon.stub().withArgs(fakeTxHex).resolves(true)
    const broadcastFail = sinon.stub().withArgs(fakeTxHex).rejects(fakeError)
    const configMock = {
      network: {
        broadcastTransaction: broadcastFail
      }
    }
    const networkMock = {
      defaults: {
        LOCAL_REGTEST: {
          broadcastTransaction: broadcastFail
        }
      }
    }
    let store
    let action

    const callAction = (regTestMode = false) =>
      AccountActions.broadcastBitcoinTransaction(
        regTestMode,
        fakeTxHex
      )

    beforeEach(() => {
      store = mockStore({})
      AccountActions.__Rewire__('config', configMock)
      AccountActions.__Rewire__('network', networkMock)
    })

    afterEach(() => {
      AccountActions.__ResetDependency__('config')
      AccountActions.__ResetDependency__('network')
    })

    describe('when regTestMode', () => {
      beforeEach(() => {
        action = callAction(true)
      })

      it('sets config.network to LOCAL_REGTEST', () =>
        store.dispatch(action)
          .then(() => {
            assert.equal(configMock.network, networkMock.defaults.LOCAL_REGTEST)
          })
      )

      it('sets blockstackAPIUrl to http://localhost:6270', () =>
        store.dispatch(action)
          .then(() => {
            assert.equal(configMock.network.blockstackAPIUrl, 'http://localhost:6270')
          })
      )
    })

    it('dispatches broadcastTransaction', () => {
      AccountActions.__Rewire__('config', {
        network: { broadcastTransaction: broadcastFail }
      })
      action = callAction(false)

      store.dispatch(action)
        .then(() => {
          assert.deepEqual(store.getActions()[0], {
            type: BROADCAST_TRANSACTION,
            payload: fakeTxHex
          })
        })

      AccountActions.__ResetDependency__('config')
    })

    describe('broadcasts the transaction hex', () => {
      beforeEach(() => {
        AccountActions.__Rewire__('config', {
          network: { broadcastTransaction: broadcastFail }
        })
        action = callAction(false)
      })

      afterEach(() => {
        AccountActions.__ResetDependency__('config')
      })

      it('to the config.network via .broadcastTransaction', () =>
        store.dispatch(action)
          .then(() => {
            assert.deepEqual(
              networkMock.defaults.LOCAL_REGTEST.broadcastTransaction.lastCall.args,
              [fakeTxHex]
            )
          })
      )

      describe('when failing', () => {
        beforeEach(() => {
          AccountActions.__Rewire__('config', {
            network: { broadcastTransaction: broadcastFail }
          })
          action = callAction(false)
        })

        afterEach(() => {
          AccountActions.__ResetDependency__('config')
        })

        it('dispatches broadcastTransactionError', () =>
          store.dispatch(action)
            .then(() => {
              assert.deepEqual(store.getActions()[1], {
                type: BROADCAST_TRANSACTION_ERROR,
                payload: fakeError.message
              })
            })
        )
      })

      describe('when working', () => {
        beforeEach(() => {
          AccountActions.__Rewire__('config', {
            network: { broadcastTransaction: broadcastSuccess }
          })
          action = callAction(false)
        })

        afterEach(() => {
          AccountActions.__ResetDependency__('config')
        })

        it('dispatches broadcastTransactionSuccess action', () => {
          store.dispatch(action)
            .then(() => {
              assert.deepEqual(store.getActions()[1], {
                type: BROADCAST_TRANSACTION_SUCCESS,
                payload: fakeTxHex
              })
            })
        })
      })
    })
  })

  describe('withdrawBitcoinFromCoreWallet', () => {
    const coreWalletWithdrawUrl = 'fakeCoreWalletWithdrawUrl'
    const recipientAddress = 'fakeRecipientAddress'
    const coreAPIPassword = 'fakeCoreAPIPassword'
    let store
    let action

    beforeEach(() => {
      store = mockStore({})
      action = AccountActions.withdrawBitcoinFromCoreWallet(
        coreWalletWithdrawUrl,
        recipientAddress,
        coreAPIPassword
      )
    })

    describe('when isCoreEndpointDisabled', () => {
      beforeEach(() => {
        AccountActions.__Rewire__('isCoreEndpointDisabled',
          sinon.stub().withArgs(coreWalletWithdrawUrl).returns(true)
        )
      })

      afterEach(() => {
        AccountActions.__ResetDependency__('isCoreEndpointDisabled')
      })

      describe('dispatches withdrawCoreBalanceError', () => {
        it('with type WITHDRAW_CORE_BALANCE_ERROR', () =>
          store.dispatch(action)
            .then(() => {
              assert.equal(store.getActions()[0].type, WITHDRAW_CORE_BALANCE_ERROR)
            })
        )

        it('with an expressive .error', () =>
          store.dispatch(action)
            .then(() => {
              assert.equal(store.getActions()[0].error,
                'Core wallet withdrawls not allowed in the simple webapp build'
              )
            })
        )

        it('and stops', () =>
          store.dispatch(action)
            .then(() => {
              assert.equal(store.getActions().length, 1)
            })
        )
      })
    })

    describe('when not isCoreEndpointDisabled', () => {
      beforeEach(() => {
        AccountActions.__Rewire__('isCoreEndpointDisabled',
          sinon.stub().withArgs(coreWalletWithdrawUrl).returns(false)
        )
        sinon.stub(global, 'fetch').rejects(new Error())
      })

      afterEach(() => {
        AccountActions.__ResetDependency__('isCoreEndpointDisabled')
        sinon.restore(global, 'fetch')
      })

      describe('when amount is not defined', () => {
        describe('dispatches a withdrawingCoreBalance action', () => {
          it('with type WITHDRAWING_CORE_BALANCE', () =>
            store.dispatch(action)
              .catch(() => {
                assert.equal(store.getActions()[0].type, WITHDRAWING_CORE_BALANCE)
              })
          )

          it('with .recipientAddress', () =>
            store.dispatch(action)
              .catch(() => {
                assert.equal(store.getActions()[0].recipientAddress, recipientAddress)
              })
          )

          describe('called with', () => {
            let stub

            beforeEach(() => {
              stub = sinon.stub().returns({type: ''})
              AccountActions.__Rewire__('withdrawingCoreBalance', stub)
            })

            afterEach(() =>
              AccountActions.__ResetDependency__('withdrawingCoreBalance')
            )

            it('1 as second parameter', () =>
              store.dispatch(action)
                .catch(() => {
                  assert.equal(stub.firstCall.args[1], 1)
                })
            )
          })
        })
      })

      describe('when amount is defined', () => {
        const amountBTC = 1

        beforeEach(() => {
          action = AccountActions.withdrawBitcoinFromCoreWallet(
            coreWalletWithdrawUrl,
            recipientAddress,
            coreAPIPassword,
            amountBTC
          )
        })

        describe('dispatches a withdrawingCoreBalance action', () => {
          it('with type WITHDRAWING_CORE_BALANCE', () =>
            store.dispatch(action)
              .catch(() => {
                assert.equal(store.getActions()[0].type, WITHDRAWING_CORE_BALANCE)
              })
          )

          it('with .recipientAddress', () =>
            store.dispatch(action)
              .catch(() => {
                assert.equal(store.getActions()[0].recipientAddress, recipientAddress)
              })
          )

          describe('called with', () => {
            let stub

            beforeEach(() => {
              stub = sinon.stub().returns({type: ''})
              AccountActions.__Rewire__('withdrawingCoreBalance', stub)
            })

            afterEach(() =>
              AccountActions.__ResetDependency__('withdrawingCoreBalance')
            )

            it('amount as second parameter', () =>
              store.dispatch(action)
                .catch(() => {
                  assert.equal(stub.firstCall.args[1], amountBTC)
                })
            )
          })
        })
      })

      describe('fetches coreWalletWithdrawUrl', () => {
        it('as provided as first param', () =>
          store.dispatch(action)
            .catch(() => {
              assert.equal(global.fetch.firstCall.args[0], coreWalletWithdrawUrl)
            })
        )

        it('with method POST', () =>
          store.dispatch(action)
            .catch(() => {
              assert.equal(global.fetch.firstCall.args[1].method, 'POST')
            })
        )

        describe('with headers', () => {
          it('Accept: application/json', () =>
            store.dispatch(action)
              .catch(() => {
                assert.equal(global.fetch.firstCall.args[1].headers.Accept, 'application/json')
              })
          )

          it('Content-Type: application/json', () =>
            store.dispatch(action)
              .catch(() => {
                assert.equal(global.fetch.firstCall.args[1].headers['Content-Type'], 'application/json')
              })
          )

          describe('Authorization: ', () => {
            const authorizationHeaderValueResult = 'fakeAuthorizationHeaderValue'

            beforeEach(() => {
              AccountActions.__Rewire__('authorizationHeaderValue',
                sinon.stub().withArgs(coreAPIPassword).returns(authorizationHeaderValueResult))
            })

            afterEach(() => {
              AccountActions.__ResetDependency__('authorizationHeaderValue')
            })

            it('authorizationHeaderValue(coreAPIPassword)', () =>
              store.dispatch(action)
                .catch(() => {
                  assert.equal(
                    global.fetch.firstCall.args[1].headers.Authorization,
                    authorizationHeaderValueResult)
                })
            )
          })
        })

        describe('with body', () => {
          const getBody = () => JSON.parse(global.fetch.firstCall.args[1].body)

          it('with address: recipientAddress', () =>
            store.dispatch(action)
              .catch(() => assert.equal(getBody().address, recipientAddress))

          )

          it('with min_confs: 0', () =>
            store.dispatch(action)
              .catch(() => assert.equal(getBody().min_confs, 0))

          )

          describe('with amount', () => {
            describe('when amount is not defined', () => {
              it('undefined', () =>
                store.dispatch(action)
                  .catch(() => assert.equal(getBody().amount, undefined))

              )
            })

            describe('when amount is defined', () => {
              const amount = 1

              beforeEach(() => {
                action = AccountActions.withdrawBitcoinFromCoreWallet(
                  coreWalletWithdrawUrl,
                  recipientAddress,
                  coreAPIPassword,
                  amount
                )
              })

              it('== amount provided as param', () =>
                store.dispatch(action)
                  .catch(() => assert.equal(getBody().amount, amount))

              )
            })
          })

          describe('with paymentKey', () => {
            describe('when paymentKey is not defined', () => {
              it('undefined', () =>
                store.dispatch(action)
                  .catch(() => assert.equal(getBody().paymentKey, undefined))

              )
            })

            describe('when paymentKey is defined', () => {
              const paymentKey = 'fakePaymentKey'

              beforeEach(() => {
                action = AccountActions.withdrawBitcoinFromCoreWallet(
                  coreWalletWithdrawUrl,
                  recipientAddress,
                  coreAPIPassword,
                  null,
                  paymentKey
                )
              })

              it('== paymentKey provided as param', () =>
                store.dispatch(action)
                  .catch(() => assert.equal(getBody().paymentKey, paymentKey))

              )
            })
          })
        })

        describe('and when working', () => {
          describe('when provided with an erroneous response', () => {
            const errorFromResponse = 'an error'
            const erroneousResponse = JSON.stringify({error: errorFromResponse})

            beforeEach(() => {
              sinon.restore(global, 'fetch')
              sinon.stub(global, 'fetch').resolves({text: () => erroneousResponse})
            })

            it('dispatches withdrawCoreBalanceError with error', () =>
              store.dispatch(action)
                .then(() => assert.deepEqual(store.getActions()[1], {
                    type: WITHDRAW_CORE_BALANCE_ERROR,
                    error: errorFromResponse
                })
              )
            )
          })

          describe('when provided with a success response', () => {
            const successResponse = JSON.stringify({})

            beforeEach(() => {
              sinon.restore(global, 'fetch')
              sinon.stub(global, 'fetch').resolves({text: () => successResponse})
            })

            it('dispatches withdrawCoreBalanceSuccess', () =>
              store.dispatch(action)
                .then(() => assert.deepEqual(store.getActions()[1], {
                    type: WITHDRAW_CORE_BALANCE_SUCCESS
                })
              )
            )
          })
        })
      })
    })
  })

  describe('emailNotifications', () => {
    const email = 'nico.id@example.com'
    let optIn
    let action
    let store

    beforeEach(() => {
      sinon.stub(global, 'fetch').rejects(new Error())
      store = mockStore({})
      action = AccountActions.emailNotifications(
        email,
        optIn
      )
    })

    afterEach(() => {
      sinon.restore(global, 'fetch')
    })

    describe('dispatches promptedForEmail action', () => {
      it('with type PROMPTED_FOR_EMAIL', () =>
        store.dispatch(action)
          .catch(() => assert.equal(store.getActions()[0].type,
            PROMPTED_FOR_EMAIL
          ))
      )

      it('with email as provided', () =>
        store.dispatch(action)
          .catch(() => assert.equal(store.getActions()[0].email,
            email
          ))
      )
    })

    describe('fetches blockstack-portal-emailer', () => {
      describe('when optIn is truthy', () => {
        beforeEach(() => {
          optIn = 1
          action = AccountActions.emailNotifications(
            email,
            optIn
          )
        })

        it('with param optIn=true', () =>
          store.dispatch(action)
            .catch(() => assert.equal(global.fetch.firstCall.args[0],
              'https://blockstack-portal-emailer.appartisan.com/notifications?mailingListOptIn=true'
            ))
        )
      })

      describe('when optIn is falsy', () => {
        beforeEach(() => {
          optIn = 0
          action = AccountActions.emailNotifications(
            email,
            optIn
          )
        })

        it('with param optIn=false', () =>
          store.dispatch(action)
            .catch(() => assert.equal(global.fetch.firstCall.args[0],
              'https://blockstack-portal-emailer.appartisan.com/notifications?mailingListOptIn=false'
            ))
        )
      })

      describe('with options', () => {
        it('with method POST', () =>
          store.dispatch(action)
            .catch(() => assert.equal(global.fetch.firstCall.args[1].options.method,
              'POST'
            ))
        )

        it('with body JSON.stringify({email})', () =>
          store.dispatch(action)
            .catch(() => assert.equal(global.fetch.firstCall.args[1].options.body,
              JSON.strinfigy({ email })
            ))
        )

        it('with headers {Accetp and Content-Type: application/json}', () =>
          store.dispatch(action)
            .catch(() => assert.deepEqual(global.fetch.firstCall.args[1].options.headers, {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }))
        )
      })

      describe('and when failing', () => {
        const error = new Error()

        beforeEach(() => {
          sinon.restore(global, 'fetch')
          sinon.stub(global, 'fetch').rejects(error)
        })
      })

      describe('and when working', () => {
        beforeEach(() => {
          sinon.restore(global, 'fetch')
          sinon.stub(global, 'fetch').resolves()
        })
      })
    })
  })

  describe('skipEmailBackup', () => {
    let store

    beforeEach(() => {
      store = mockStore({})
      store.dispatch(AccountActions.skipEmailBackup())
    })

    it('dispatches action {type: PROMPTED_FOR_EMAIL, email: null}', () =>
      assert.deepEqual(store.getActions()[0], {
        type: PROMPTED_FOR_EMAIL,
        email: null
      })
    )
  })

  describe('storageIsConnected', () => {
    let store

    beforeEach(() => {
      store = mockStore({})
      store.dispatch(AccountActions.storageIsConnected())
    })

    it('dispatches action {type: CONNECTED_STORAGE}', () =>
      assert.deepEqual(store.getActions()[0], {
        type: CONNECTED_STORAGE
      })
    )
  })

  describe('updateViewedRecoveryCode', () => {
    describe('returns action', () => {
      let action

      beforeEach(() => {
        action = AccountActions.updateViewedRecoveryCode()
      })

      it('{type: VIEWED_RECOVERY_CODE}', () =>
        assert.deepEqual(action, {
          type: VIEWED_RECOVERY_CODE
        })
      )
    })
  })

  describe('doVerifyRecoveryCode', () => {
    let store

    beforeEach(() => {
      store = mockStore({})
      store.dispatch(AccountActions.doVerifyRecoveryCode())
    })

    it('dispatches action {type: RECOVERY_CODE_VERIFIED}', () =>
      assert.deepEqual(store.getActions()[0], {
        type: RECOVERY_CODE_VERIFIED
      })
    )
  })

  describe('incrementIdentityAddressIndex', () => {
    describe('returns action', () => {
      let action

      beforeEach(() => {
        action = AccountActions.incrementIdentityAddressIndex()
      })

      it('{type: INCREMENT_IDENTITY_ADDRESS_INDEX}', () =>
        assert.deepEqual(action, {
          type: INCREMENT_IDENTITY_ADDRESS_INDEX
        })
      )
    })
  })

  describe('usedIdentityAddress', () => {
    let store

    beforeEach(() => {
      store = mockStore({})
      store.dispatch(AccountActions.usedIdentityAddress())
    })

    it('dispatches action {type: INCREMENT_IDENTITY_ADDRESS_INDEX}', () =>
      assert.deepEqual(store.getActions()[0], {
        type: INCREMENT_IDENTITY_ADDRESS_INDEX
      })
    )
  })

  describe('displayedRecoveryCode', () => {
    let store

    beforeEach(() => {
      store = mockStore({})
      store.dispatch(AccountActions.displayedRecoveryCode())
    })

    it('dispatches action {type: VIEWED_RECOVERY_CODE}', () =>
      assert.deepEqual(store.getActions()[0], {
        type: VIEWED_RECOVERY_CODE
      })
    )
  })

  describe('newIdentityAddress', () => {
    describe('returns action', () => {
      const newIdentityKeypair = 'fakeNewIdentityKeyPair'
      let action

      beforeEach(() => {
        action = AccountActions.newIdentityAddress(newIdentityKeypair)
      })

      it('with type NEW_IDENTITY_ADDRESS', () =>
        assert.equal(action.type, NEW_IDENTITY_ADDRESS)
      )

      it('with keypair passed as first param', () =>
        assert.equal(action.keypair, newIdentityKeypair)
      )
    })
  })
})
