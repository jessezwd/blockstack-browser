/**
 * Initial Screen
 *
 * Directs the user to sign up or sign in with an existing ID
 */
import React from 'react'
import { ShellScreen, Type } from '@blockstack/ui'
import { Flex } from '@components/ui/components/primitives'
import PropTypes from 'prop-types'
const InitialScreen = ({ next, ...rest }) => {
  // console.log(document.location.href)
  let client = 'browser'
  if (document.location.search.indexOf('ios_secure') !== -1) {
    client = 'ios_secure'
  }
  const props = {
    content: {
      grow: 1,
      children: (
        <Flex
          style={{ flexGrow: 1 }}
          justifyContent="center"
          flexDirection="column"
        >
          <Type.h1 pb={3}>Create your Blockstack ID</Type.h1>
          <Type.p>
            Completely censorship free, private, and secure. One login for 100s
            of apps. Powered by blockchain.
          </Type.p>
        </Flex>
      )
    },
    actions: {
      items: [
        {
          label: 'Create new ID',
          onClick: () => next(),
          primary: true
        },
        {
          label: 'Sign in with an existing ID',
          to: `/sign-in?client=${client}`
        }
      ]
    }
  }
  return <ShellScreen {...rest} {...props} />
}

InitialScreen.propTypes = {
  next: PropTypes.func.isRequired
}

export default InitialScreen
