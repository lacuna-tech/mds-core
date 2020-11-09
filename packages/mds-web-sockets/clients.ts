import WebSocket from 'ws'
import { WebSocketAuthorizer } from '@mds-core/mds-api-authorizer'
import { AuthorizationError } from '@mds-core/mds-utils'
import logger from '@mds-core/mds-logger'
import jwt from 'jsonwebtoken'
import jwks from 'jwks-rsa'
import { promisify } from 'util'
import { ENTITY_TYPE, SupportedEntities } from './types'

type Client = { scopes: string[]; socket: WebSocket }

export class Clients {
  authenticatedClients: Client[]

  subList: { [key: string]: WebSocket[] }

  supportedEntities: SupportedEntities

  public static getKey = async (header: { kid: string }) => {
    const { JWKS_URI } = process.env

    if (!JWKS_URI) throw new Error('No JWKS_URI defined!')

    const client = jwks({
      jwksUri: JWKS_URI
    })

    /* Technically, this typedef is slightly incorrect, but is to coerce the compiler to happiness without type guarding. One of publicKey or rsaPublicKey *always* exists. */
    const key: { publicKey?: string; rsaPublicKey?: string } = await promisify(client.getSigningKey)(
      header.kid ?? 'null'
    )

    return key.publicKey || key.rsaPublicKey
  }

  public constructor(supportedEntities: SupportedEntities) {
    // Initialize subscription list with configured entities
    this.subList = Object.fromEntries(Object.keys(supportedEntities).map(e => [e, []]))
    this.authenticatedClients = []
    this.saveClient = this.saveClient.bind(this)
    this.supportedEntities = supportedEntities
  }

  public hasScopes(neededScopes: string[], client: WebSocket) {
    const clientEntry = this.authenticatedClients.find(x => x.socket === client)

    if (clientEntry) {
      const { scopes: clientScopes } = clientEntry
      return neededScopes.filter(x => clientScopes.includes(x)).length > 0
    }

    return false
  }

  public isAuthenticated(client: WebSocket) {
    return !!this.authenticatedClients.find(x => x.socket === client)
  }

  public saveClient(entities: string[], client: WebSocket) {
    if (!this.authenticatedClients.find(x => x.socket === client)) {
      return
    }

    const trimmedEntities = entities.map(entity => entity.trim()) as ENTITY_TYPE[]

    return Promise.all(
      trimmedEntities.map(entity => {
        try {
          if (this.hasScopes(this.supportedEntities[entity].read, client)) {
            this.subList[entity].push(client)
            client.send(`SUB%${entity}%${JSON.stringify({ status: 'Success' })}`)
          } else {
            throw new AuthorizationError("Client is missing proper scopes!")
          }
        } catch {
          client.send(`SUB%${entity}%${JSON.stringify({ status: 'Failure' })}`)
          return logger.error(`failed to push ${entity}`)
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
        client.send(`AUTH%${JSON.stringify({ err: new AuthorizationError() })}`)
        return
      }

      const scopes = auth?.scope.split(' ') ?? []

      this.authenticatedClients.push({ scopes, socket: client })
      client.send(`AUTH%${JSON.stringify({ status: 'Success' })}`)
    } catch (err) {
      logger.warn(err)
      client.send(JSON.stringify(err))
    }
  }

  public static async checkAuth(token: string) {
    try {
      const { JWT_ISSUER, JWT_AUDIENCE } = process.env
      const { header } = jwt.decode(token, { complete: true, json: true }) as { header: { kid: string } }
      const key = (await this.getKey(header)) as string
      return jwt.verify(token, key, { audience: JWT_AUDIENCE, issuer: JWT_ISSUER })
    } catch (err) {
      logger.warn(err)
      return false
    }
  }
}
