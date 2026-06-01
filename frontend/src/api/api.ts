import env from "@/env";

import type { paths } from "./types";

type Method = "get" | "post" | "put" | "delete" | "patch";

type PathsWithMethod<M extends Method> = {
  [P in keyof paths]: M extends keyof paths[P] ? P : never;
}[keyof paths];

type PathParams<P extends keyof paths, M extends Method> = M extends keyof paths[P]
  ? paths[P][M] extends { parameters: { path: infer Params } }
    ? Params
    : never
  : never;

type RequestBody<P extends keyof paths, M extends Method> = M extends keyof paths[P]
  ? paths[P][M] extends { requestBody: { content: { "application/json": infer B } } }
    ? B
    : never
  : never;

type ResponseBody<P extends keyof paths, M extends Method> = M extends keyof paths[P]
  ? paths[P][M] extends { responses: { 200: { content: { "application/json": infer R } } } }
    ? R
    : never
  : never;

// `unknown` is identity in intersections — field absent when route has no params/body
type WithParams<P extends keyof paths, M extends Method> =
  PathParams<P, M> extends never ? unknown : { params: PathParams<P, M> };

type WithBody<P extends keyof paths, M extends Method> =
  RequestBody<P, M> extends never ? unknown : { body: RequestBody<P, M> };

type Options<P extends keyof paths, M extends Method> = { method: M } & WithParams<P, M> &
  WithBody<P, M>;

type ApiOptions<P extends keyof paths, M extends Method> = Omit<Options<P, M>, "method">;

// No second arg when route has no required params or body
type ApiArgs<P extends keyof paths, M extends Method> = keyof ApiOptions<P, M> extends never
  ? []
  : [options: ApiOptions<P, M>];

const interpolate = (route: string, params: Record<string, string>): string =>
  route.replace(/\{(\w+)\}/g, (_, key: string) => params[key] ?? "");

const execute = async <P extends keyof paths, M extends Method>(
  route: P,
  options: Options<P, M>,
): Promise<ResponseBody<P, M>> => {
  const { method, params, body } = options as {
    method: M;
    params?: Record<string, string>;
    body?: unknown;
  };

  const url = params ? interpolate(route as string, params) : (route as string);

  const res = await fetch(`${env.apiUrl}${url}`, {
    method: method.toUpperCase(),
    ...(body !== undefined && {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  });

  if (!res.ok) {
    const message = await res.text().catch(() => `Request failed (${res.status})`);
    throw new Error(message || `Request failed (${res.status})`);
  }

  return res.json() as Promise<ResponseBody<P, M>>;
};

export const api = {
  get: <P extends PathsWithMethod<"get">>(route: P, ...[options]: ApiArgs<P, "get">) =>
    execute(route, { method: "get", ...options } as Options<P, "get">),

  post: <P extends PathsWithMethod<"post">>(route: P, ...[options]: ApiArgs<P, "post">) =>
    execute(route, { method: "post", ...options } as Options<P, "post">),

  put: <P extends PathsWithMethod<"put">>(route: P, ...[options]: ApiArgs<P, "put">) =>
    execute(route, { method: "put", ...options } as Options<P, "put">),

  delete: <P extends PathsWithMethod<"delete">>(route: P, ...[options]: ApiArgs<P, "delete">) =>
    execute(route, { method: "delete", ...options } as Options<P, "delete">),

  patch: <P extends PathsWithMethod<"patch">>(route: P, ...[options]: ApiArgs<P, "patch">) =>
    execute(route, { method: "patch", ...options } as Options<P, "patch">),
};
