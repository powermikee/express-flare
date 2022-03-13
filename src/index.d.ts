declare global {
  interface CacheStorage {
    readonly default: Cache;
  }
}

interface FetchEventType extends FetchEvent {
  request: RequestType,
}

export interface HandleRequestType {
  event: FetchEventType,
  context?: any,
  request?: any,
  router: RouterType,
  cacheTime?: number,
  parseCookie?: boolean,
}

export interface ResponseMethodType {
  status: (statusCode: number) => ResponseMethodType,
  json: (data: {[key: string]: any}) => ResponseMethodType,
  send: (data: string) => ResponseMethodType,
  end: any,
  setHeader: (header: string, value: string) => ResponseMethodType,
  getHeader: (header: string) => ResponseMethodType,
  removeHeader: (header: string) => ResponseMethodType,
  setCookie: (name: string, value: string) => ResponseMethodType,
  redirect: (url: string, statusCode: number) => ResponseMethodType,
}

export type NextType = (error?: Error) => void;

export type ResponseType = {
  redirect?: { url: string, statusCode: number },
  data: string,
  headers: {
    status: number,
    headers: {
      [key: string]: any,
    },
    [key: string]: any,
  },
};

export interface RequestType extends Request {
  origin?: string,
  query?: any,
  params?: any,
  bodyContent?: any,
  cookies?: any,
  [key: string]: any,
}

export type ErrorCallbackType = (
  error: Error,
  req: RequestType,
  res: ResponseMethodType,
  next: NextType,
) => void;

export type CallbackType = (req: RequestType, res: ResponseMethodType, next: NextType) => void;

export type EndpointType = (
  path: string,
  callback: CallbackType,
  callback2?: CallbackType,
  cacheTime?: number
 ) => void;

 export interface RoutesType {
  middleware: Array<CallbackType>
  error: ErrorCallbackType | null,
  get: object,
  post: object,
  put: object,
  delete: object,
  patch: object,
  all: object,
  [key: string]: any,
 }

 export interface RouterType {
  routes: RoutesType,
  use: (callback: CallbackType) => void,
  error: (callback: ErrorCallbackType) => void,
  get: EndpointType,
  post: EndpointType,
  put: EndpointType,
  delete: EndpointType,
  patch: EndpointType,
  all: EndpointType,
}

export function handleRequest (props: HandleRequestType): Promise<Response>;

export const router: RouterType;
