/**
 * Types for API collection structure
 */

// Represents a URL in a request
export interface UrlType {
  raw: string
  protocol?: string
  host?: string[]
  path?: string[]
  query?: Array<{
    key: string
    value: string
    disabled?: boolean
  }>
  variable?: Array<{
    key: string
    value?: string
  }>
}

// Represents a header in a request
export interface HeaderType {
  key: string
  value: string
  disabled?: boolean
  description?: string
}

// Represents the body of a request
export interface BodyType {
  mode?: "raw" | "urlencoded" | "formdata" | "file" | "graphql"
  raw?: string
  urlencoded?: Array<{
    key: string
    value: string
    disabled?: boolean
    description?: string
  }>
  formdata?: Array<{
    key: string
    value?: string
    src?: string
    disabled?: boolean
    type?: "text" | "file"
    description?: string
  }>
  file?: {
    src?: string
  }
  graphql?: {
    query?: string
    variables?: string
  }
  options?: {
    raw?: {
      language?: "json" | "xml" | "text" | "javascript"
    }
  }
}

// Represents an authentication method
export interface AuthType {
  type?: "apikey" | "awsv4" | "basic" | "bearer" | "digest" | "oauth1" | "oauth2" | "ntlm"
  apikey?: Array<{
    key: string
    value: string
    in?: "header" | "query"
  }>
  awsv4?: {
    accessKey?: string
    secretKey?: string
    region?: string
    service?: string
  }
  basic?: {
    username?: string
    password?: string
  }
  bearer?: {
    token?: string
  }
  oauth2?: {
    accessToken?: string
    tokenType?: string
    addTokenTo?: string
  }
}

// Represents a request in a collection
export interface RequestType {
  method?: string
  url?: UrlType
  description?: string
  header?: HeaderType[]
  body?: BodyType
  auth?: AuthType
}

// Represents a response example
export interface ResponseType {
  name?: string
  originalRequest?: RequestType
  status?: string
  code?: number
  _postman_previewlanguage?: string
  header?: HeaderType[]
  cookie?: any[]
  body?: string
}

// Represents an item in a collection (can be a request or a folder)
export interface RequestItem {
  name: string
  id?: string
  description?: string
  request?: RequestType
  response?: ResponseType[]
  item?: RequestItem[]
  event?: Array<{
    listen: string
    script: {
      type?: string
      exec?: string[]
    }
  }>
}

// Represents a collection
export interface CollectionType {
  info: {
    name: string
    description?: string
    schema?: string
    _postman_id?: string
    version?: string
  }
  item?: RequestItem[]
  variable?: Array<{
    key: string
    value?: string
    type?: string
    description?: string
  }>
  auth?: AuthType
  event?: Array<{
    listen: string
    script: {
      type?: string
      exec?: string[]
    }
  }>
}

// Represents a saved request in the application
export interface SavedRequest {
  id: string
  name: string
  url: string
  method: string
  headers: { key: string; value: string }[]
  body: string
  bearerToken?: string
  description?: string
  createdAt?: number
  updatedAt?: number
  tags?: string[]
  folder?: string
}

// Represents a folder for organizing saved requests
export interface RequestFolder {
  id: string
  name: string
  description?: string
  parentId?: string
  createdAt?: number
  updatedAt?: number
}

