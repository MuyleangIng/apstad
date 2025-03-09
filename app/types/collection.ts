export interface CollectionType {
  info: {
    _postman_id: string
    name: string
    description?: string
    schema: string
    _exporter_id?: string
  }
  item: RequestItem[]
  variable?: {
    key: string
    value: string
  }[]
}

export interface RequestItem {
  name: string
  request?: {
    method?: string
    header?: {
      key: string
      value: string
      type?: string
    }[]
    url?: {
      raw: string
      host?: string[]
      path?: string[]
    }
    body?: {
      mode?: string
      raw?: string
      options?: {
        raw?: {
          language: string
        }
      }
      formdata?: {
        key: string
        type: string
        src?: string
      }[]
    }
  }
  response?: any[]
  item?: RequestItem[]
  event?: {
    listen: string
    script: {
      exec: string[]
      type: string
    }
  }[]
}

