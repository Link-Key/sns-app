/**
 * 网络请求配置
 */
import axios from 'axios'

// create axios instance
const http = axios.create({
  // baseURL: "http://www.my-ybd.com",
  // request connect timeout
  timeout: 2 * 60 * 1000
  // withCredentials: true,
})

/**
 * http request 拦截器
 */
http.interceptors.request.use(
  config => {
    config.data = JSON.stringify(config.data)
    config.headers = {
      'Content-Type': 'application/json'
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * http response 拦截器
 */
http.interceptors.response.use(
  response => {
    if (response.data.errCode === 2) {
      console.log('过期')
    }
    return response
  },
  error => {
    console.log('请求出错：', error)
  }
)

export default http
