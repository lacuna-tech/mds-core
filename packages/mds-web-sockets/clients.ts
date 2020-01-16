import WebSocket from 'ws'
import { WebSocketAuthorizer } from '@mds-core/mds-api-authorizer'
import { AuthorizationError } from '@mds-core/mds-utils'
import log from '@mds-core/mds-logger'
import jwt, { GetPublicKeyOrSecret } from 'jsonwebtoken'
import jwks from 'jwks-rsa'

export class Clients {
  authenticatedClients: WebSocket[]

  subList: { [key: string]: WebSocket[] }

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

  public async saveAuth(token: string, client: WebSocket) {
    try {
      const auth = WebSocketAuthorizer(token)
      const validateAuth = await Clients.checkAuth(token)
      if (!validateAuth) {
        return client.send(new AuthorizationError())
      }
      const scopes = auth?.scope.split(' ') ?? []
      if (scopes.includes('admin:all')) {
        this.authenticatedClients.push(client)
        client.send('Authentication success!')
      } else client.send(new AuthorizationError())
    } catch (err) {
      client.send(JSON.stringify(err))
    }
  }

  public static checkAuth(token: string) {
    const client = jwks({
      jwksUri: 'ourIssuer'
    })

    // eslint-disable-next-line promise/prefer-await-to-callbacks
    const getKey: GetPublicKeyOrSecret = (header, callback) => {
      client.getSigningKey(header.kid ?? 'null', (_err, key: any) => {
        const signingKey = key.publicKey || key.rsaPublicKey
        // eslint-disable-next-line promise/prefer-await-to-callbacks
        callback(null, signingKey)
      })
    }

    // eslint-disable-next-line promise/avoid-new
    return new Promise(resolve => {
      // eslint-disable-next-line promise/prefer-await-to-callbacks
      jwt.verify(token, getKey, { audience: 'ourAudience', issuer: 'ourIssuer' }, (err, decoded) => {
        if (err) return resolve(false)

        log.info(decoded)
        return resolve(true)
      })
    })
  }
}
