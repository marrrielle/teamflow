import { useParams } from 'react-router-dom';

/**
 * Derives `{ projectId: string }` from a route pattern like `/projects/:projectId`
 * at the type level, so `useTypedParams<'/projects/:projectId'>()` is compile-time
 * checked against the actual route instead of a hand-written params interface.
 */
type ExtractRouteParams<TPath extends string> = TPath extends `${string}:${infer Param}/${infer Rest}`
  ? { [K in Param]: string } & ExtractRouteParams<`/${Rest}`>
  : TPath extends `${string}:${infer Param}`
    ? { [K in Param]: string }
    : Record<string, never>;

export function useTypedParams<TPath extends string>(): ExtractRouteParams<TPath> {
  return useParams() as ExtractRouteParams<TPath>;
}
