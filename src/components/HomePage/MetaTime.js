import React, { Component } from 'react'
import styled from '@emotion/styled/macro'
import { modulate } from '../../utils/utils'
import mq from 'mediaQuery'
import * as PropTypes from 'prop-types'
import Text from 'antd/es/typography/Text'

class MetaTime extends Component {
  constructor(props) {
    super(props)
    this.state = {
      time:
        new Date().toUTCString().substring(0, 12) +
        'Ω' +
        (new Date().getFullYear() - 2021 + 1) +
        new Date().toUTCString().substring(16)
    }
  }
  componentDidMount() {
    this.intervalID = setInterval(() => this.tick(), 1000)
  }
  componentWillUnmount() {
    clearInterval(this.intervalID)
  }
  tick() {
    this.setState({
      time:
        new Date().toUTCString().substring(0, 12) +
        'Ω' +
        (new Date().getFullYear() - 2021 + 1) +
        new Date().toUTCString().substring(16)
    })
  }
  render() {
    // TODO Add metadverse time lable
    return <span className="App-clock">{this.state.time}</span>
  }
}

export default MetaTime
