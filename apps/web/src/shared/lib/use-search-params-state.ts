import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { z } from 'zod';

/**
 * Parses/defaults the current URL query string through a Zod schema and exposes a
 * typed patch-setter that writes back to the URL. Keeps filter state shareable,
 * bookmarkable, and back/forward-navigable — a plain useState can't do that.
 */
export function useSearchParamsState<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
): [z.infer<TSchema>, (patch: Partial<z.infer<TSchema>>) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = useMemo((): z.infer<TSchema> => {
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = schema.safeParse(raw);
    return parsed.success ? parsed.data : ({} as z.infer<TSchema>);
  }, [searchParams, schema]);

  const setValue = useCallback(
    (patch: Partial<z.infer<TSchema>>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, val] of Object.entries(patch)) {
            if (val === undefined || val === null || val === '') {
              next.delete(key);
            } else {
              next.set(key, String(val));
            }
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return [value, setValue];
}
