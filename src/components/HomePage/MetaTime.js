import moment from 'moment'
import React, { Component } from 'react'

class MetaTime extends Component {
  constructor(props) {
    super(props)
    this.state = {
      time: moment().valueOf()
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
      time: moment().valueOf()
    })
  }
  render() {
    // TODO Add metadverse time lable
    return (
      <span className="App-clock">
        {localStorage.getItem('language') === 'cn'
          ? moment(this.state.time).format('YYYY年MM月DD日 HH时mm分ss秒')
          : moment(this.state.time).format('YYYY-MM-DD HH:mm:ss')}
      </span>
    )
  }
}

export default MetaTime
