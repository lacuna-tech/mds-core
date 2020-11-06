import { ApiServer, HttpServer } from '@mds-core/mds-api-server'
import { api } from '../api'

HttpServer(ApiServer(api), { port: process.env.COMPLIANCE_API_HTTP_PORT })
