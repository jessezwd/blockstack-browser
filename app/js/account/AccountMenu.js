import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch)
}

export class AccountMenu extends Component {
  static propTypes = {
    children: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const tabs = [
      { url: '/account/storage', label: 'storage providers' },
      { url: '/account/password', label: 'change password' },
      { url: '/account/backup', label: 'backup & restore' },
      { url: '/account/delete', label: 'reset browser' },
      { url: '/account/api', label: 'api settings' }
    ]

    return (
      <div>
        <div className="list-group">
          {tabs.map((tab, index) => {
            const className = 'list-group-item item-sidebar-primary'
            return (
              <Link key={index} to={tab.url} className={className}>
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(AccountMenu)
