import axios from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { AxiosHeaders } from 'axios'

export class ApiError extends Error {
  serverData: any = null
  constructor(message: string, serverData: any = null) {
    super(message)
    this.name = 'ApiError'
    this.serverData = serverData
  }
}

export default class BaseApi {
  constructor() {
    axios.defaults.timeout = 30000
  }

  protected get<T>(url: string, options?: InternalAxiosRequestConfig) {
    return axios.get<T>(url, options).then(this.extractData).catch(this.processError)
  }

  protected post<T1, T2>(
    url: string,
    payload: T1,
    options?: InternalAxiosRequestConfig,
  ): Promise<T2> {
    return axios
      .post<T1, AxiosResponse<T2>>(url, payload, options)
      .then(this.extractData)
      .catch(this.processError)
  }

  private extractData<T = any>(response: AxiosResponse<T>) {
    const { data, status } = response
    if (status !== 200) {
      const errorMessage = (data as any).errorMessage || (data as any).error_message
      if (errorMessage) throw new ApiError(errorMessage, data)
    }
    return data
  }

  private processError(err: any): never {
    const data: any = err.response?.data
    let errorMessage =
      data?.error?.error || data?.error || data?.errorMessage || data?.error_message || err.message
    if (Array.isArray(errorMessage)) errorMessage = JSON.stringify(errorMessage[0])
    throw new ApiError(errorMessage, err.response?.data || null)
  }

  protected mockAdapter<T>(data: T, delay = 100): () => Promise<any> {
    return async () => {
      await new Promise((resolve) => setTimeout(resolve, delay))
      return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
      }
    }
  }

  protected withMockAdapter(adapter: any): InternalAxiosRequestConfig {
    return {
      adapter,
      headers: new AxiosHeaders(),
    }
  }
}
