# MDS Web Sockets Interface
Implementation of a basic websocket model for MDS

## Package Content

### Stable Content
N/A
### Experimental Content
This package implements a basic websocket client and server to be used with MDS.

## Current usage
[MDS-Agency](../mds-agency/README.md) currently emits all incoming events and telemetry to the websocket server by implementating [client.ts](client.ts).

## Protocol

### Generic message structure
`CONTROL%ARG1%ARG2%...%ARGn`

### Message Headers
* `AUTH`: Authentication Header. To be followed with a `SCHEME` and `TOKEN` in the format `AUTH%SCHEME TOKEN`
* `PING`: Ping message that expects a `PONG` response. Of the format `PING`.
* `PONG`: Pong message that responds to a `PING`. Of the format `PONG`.
* `SUB`: Subscription Header. To be followed with the entities to which you'd like to subscribe, in the format `SUB%ENTITY1%ENTITY2%...%ENTITYn`
* `PUSH`: Test message that will trigger an `EVENT` payload to be sent out to all subscribers of the `EVENTS` entity.

### PING/PONG
PINGs/PONGs are managed internally by the `ws-heartbeat` library. PINGs will emit from the server, and the client should respond with PONGs.

### Authentication
Currently, this package only supports the `Bearer` scheme for tokens. See [Message Headers](#message-headers)

### Subscription Model
MDS-Web-Sockets uses a basic pub/sub model. For a client to subscribe to server-side entity updates, they must send a `SUB` message (see [Message Headers](#message-headers)).

#### Subscribe-able Entities
| Entity        | Response Type | Response Format              | Example Response  |
|---------------|---------------|------------------------------|-------------------|
| `EVENTS`      | String        | `EVENTS%VEHICLE_EVENT_JSON`  | `EVENTS%...`      |
| `TELEMETRIES` | String        | `TELEMETRIES%TELEMETRY_JSON` | `TELEMETRIES%...` |

## Quick Start and Tests
See [Quick Start](../../README.md#Installation)

## Build Deployment Package
See [Build](../../README.md#Build)