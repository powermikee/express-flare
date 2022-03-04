
declare global {
  interface CacheStorage {
    default: {
      put(request: Request | string, response: Response): Promise<undefined>;
      match(request: Request | string): Promise<Response | undefined>;
    };
  }
}

export interface RequestType extends Request {
  query: any,
  params: any,
  bodyContent: any,
  cookies: any,
}

export interface HandleRequestType {
  event: {
    waitUntil: (promise: Promise<undefined>) => void,
    request: RequestType,
  },
  router: any,
  cacheTime?: number,
  parseCookie?: boolean,
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
}

export type NextType = (error?: Error) => void;

export interface ResponseMethodType {
  status: (statusCode: number) => ResponseMethodType,
  json: (data: {[key: string]: any}) => ResponseMethodType,
  send: (data: string) => ResponseMethodType,
  end: any,
  setHeader: (header: string, value: string) => ResponseMethodType,
  getHeader: (header: string) => ResponseMethodType,
  removeHeader: (header: string) => ResponseMethodType,
  setCookie: (name: string, value: string) => ResponseMethodType,
}

export type NextType = (error?: Error) => void;

export type ResponseType = {
  data: string,
  headers: {
    status: number,
    headers: {
      [key: string]: any,
    },
    [key: string]: any,
  }
};

export interface RequestType extends Request {
  query: any,
  params: any,
  bodyContent: any,
  cookies: any,
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
  [key: string]: any,
 }

 export type RouterType = {
  routes: RoutesType,
  use: (callback: CallbackType) => void,
  error: ErrorCallbackType,
  get: EndpointType,
  post: EndpointType,
  put: EndpointType,
  delete: EndpointType,
  patch: EndpointType,
}

export function handleRequest (props: HandleRequestType): void;

export const router: RouterType;