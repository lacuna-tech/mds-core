export type AsEntity<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>> ? T[P] : Exclude<T[P], undefined> | null
}

export type Nullable<T> = T | null

export type JsonObject = {
  [property: string]: Nullable<JsonValue>
}

export type JsonValue = string | number | boolean | Record<string, any> | any[] | null
