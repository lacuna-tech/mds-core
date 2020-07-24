import type { Labels as PrometheusLabels, Opts as PrometheusOptions, TransformLabelsFn } from 'express-prom-bundle'
import prometheus from 'express-prom-bundle'
import promClient from 'prom-client'
import { ApiRequest, ApiResponse, ApiResponseLocals, ApiClaims } from '../@types'

const providerIdLabeler = <AccessTokenScope extends string>(
  labels: PrometheusLabels,
  req: ApiRequest,
  res: ApiResponse & ApiResponseLocals<ApiClaims<AccessTokenScope>>
) => {
  if (res.locals.claims?.provider_id) {
    return Object.assign(labels, { provider_id: res.locals.claims.provider_id })
  }
  return labels
}

const PrometheusLabelers = <AccessTokenScope extends string>(...labelers: TransformLabelsFn[]) => {
  return (
    labels: PrometheusLabels,
    req: ApiRequest,
    res: ApiResponse & ApiResponseLocals<ApiClaims<AccessTokenScope>>
  ) => {
    return labelers.reduce((acc: PrometheusLabels, labeler: TransformLabelsFn) => {
      return { ...acc, ...labeler(labels, req, res) }
    }, labels)
  }
}

export type PrometheusMiddlewareOptions = Partial<PrometheusOptions>

export const PrometheusMiddleware = (options: PrometheusMiddlewareOptions = {}) =>
  prometheus({
    metricsPath: '/prometheus',
    includeMethod: true,
    includePath: true,
    includeUp: true,
    promRegistry: new promClient.Registry(),
    customLabels: { provider_id: null },
    transformLabels: PrometheusLabelers(providerIdLabeler),
    ...options
  })
