import WebSocket from 'ws'
import { WebSocketAuthorizer } from '@mds-core/mds-api-authorizer'
import { AuthorizationError } from '@mds-core/mds-utils'
import log from '@mds-core/mds-logger'
import jwt from 'jsonwebtoken'
import jwks from 'jwks-rsa'
import { promisify } from 'util'

export class Clients {
  authenticatedClients: WebSocket[]

  subList: { [key: string]: WebSocket[] }

  public static getKey = async (header: { kid: string }) => {
    const { JWKS_URI } = process.env

    if (!JWKS_URI) throw new Error('No OAUTH_ISSUER defined')

    const client = jwks({
      jwksUri: JWKS_URI
    })

    /* Technically, this typedef is slightly incorrect, but is to coerce the compiler to happiness without type guarding. One of publicKey or rsaPublicKey *always* exists. */
    const key: { publicKey?: string; rsaPublicKey?: string } = await promisify(client.getSigningKey)(
      header.kid ?? 'null'
    )

    return key.publicKey || key.rsaPublicKey
  }

  public constructor() {
    this.subList = { EVENTS: [], TELEMETRIES: [] }
    this.authenticatedClients = []
    this.saveClient = this.saveClient.bind(this)
  }

  public isAuthenticated(client: WebSocket) {
    return this.authenticatedClients.includes(client)
  }

  public saveClient(entities: string[], client: WebSocket) {
    if (!this.authenticatedClients.includes(client)) {
      client.send('Not authenticated!')
      return
    }

    const trimmedEntities = entities.map(entity => entity.trim())

    return Promise.all(
      trimmedEntities.map(entity => {
        try {
          this.subList[entity].push(client)
        } catch {
          return log.error(`failed to push ${entity}`)
        }
      })
    )
  }

  public async saveAuth(authorizer: string, client: WebSocket) {
    try {
      const [, token] = authorizer.split(' ')

      const auth = WebSocketAuthorizer(authorizer)

      const validateAuth = await Clients.checkAuth(token)
      if (!validateAuth) {
        return client.send(new AuthorizationError())
      }

      const scopes = auth?.scope.split(' ') ?? []

      if (scopes.includes('admin:all')) {
        this.authenticatedClients.push(client)
        client.send('Authentication success!')
      } else {
        client.send(new AuthorizationError())
      }
    } catch (err) {
      await log.warn(err)
      client.send(JSON.stringify(err))
    }
  }

  public static async checkAuth(token: string) {
    const { JWT_ISSUER = 'https://example.com', JWT_AUDIENCE = 'https://example.com' } = process.env
    const { header } = jwt.decode(token, { complete: true, json: true }) as { header: { kid: string } }
    const key = (await this.getKey(header)) as string
    return jwt.verify(token, key, { audience: JWT_AUDIENCE, issuer: JWT_ISSUER })
  }
}
