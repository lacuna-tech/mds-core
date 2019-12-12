import WebSocket from 'ws'
import { VehicleEvent, Telemetry } from '@mds-core/mds-types'
import { setWsHeartbeat, WebSocketBase } from 'ws-heartbeat/client'
const url = 'ws://localhost:4001'

const { env } = process

const { token } = env

let connection: WebSocket = new WebSocket(url)

function getClient() {
  if (connection) {
    return connection
  } else {
    connection = new WebSocket(url)
  }
  return connection
}

setWsHeartbeat(connection as WebSocketBase, 'PING')

connection.onopen = async () => {
  await sendAuth()
}

/* Authenticate */
async function sendAuth() {
  return connection.send(
    `AUTH%Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IlFVWkJRVFUwT0RJNE9EbERRakl3TWpJeE0wVkZNamhHTmtaRFFUa3lSRGRGTmtSRFF6RkZOUSJ9.eyJodHRwczovL2xhZG90LmlvL3Byb3ZpZGVyX2lkIjoiNWY3MTE0ZDEtNDA5MS00NmVlLWI0OTItZTU1ODc1ZjdkZTAwIiwiaXNzIjoiaHR0cHM6Ly9hdXRoLmxhZG90LmlvLyIsInN1YiI6IjE4UmN1QVJLQzVSUHQ5ZmFON0VRNXdjRTVvUmNlbzB0QGNsaWVudHMiLCJhdWQiOiJodHRwczovL3NhbmRib3gubGFkb3QuaW8iLCJpYXQiOjE1NTMzMTAyNDYsImV4cCI6MTU1NDM5MDI0NiwiYXpwIjoiMThSY3VBUktDNVJQdDlmYU43RVE1d2NFNW9SY2VvMHQiLCJzY29wZSI6ImFkbWluOmFsbCB0ZXN0OmFsbCIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.NNTJpeVAvbyslzK0PLrDkPs6_rGQ7tZwVl00QlNiDPUPuMzlCcMWTCOei0Jwm9_21KXAsGo6iko1oYgutrMPjvnePCDFbs3h2iGX8Wiw4rx0FrOijNJV6GWXSW33okagoABo0b63mLnGpfZYRNVjAbMEcJ5GrAWbEvZZeSIL6Mjl6YYn527mU4eWyqRMwTDtJ0s8iYaT2fj3VyOYZcUy0wCeQ3otK2ikkW4jyFgL60-Bb0U6IVh1rHPlS4pZa-wDzg1Pjk9I0RaBWDJQzpTd7OsEMwq-4qMqi9xrzQ6f52Sdl3JbKcQ0EzKK4GHGdILRiUfIpfZLEnNBOH9iAsOswQ`
  )
}

/* Force test event to be send back to client */
async function sendPush(entity: string, data: VehicleEvent | Telemetry) {
  const client = getClient()
  return client.send(`PUSH%${entity}%${JSON.stringify(data)}`)
}

export function writeTelemetry(telemetry: Telemetry) {
  return sendPush('TELEMETRIES', telemetry)
}

export function writeEvent(event: VehicleEvent) {
  return sendPush('EVENTS', event)
}