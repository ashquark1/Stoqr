/**
 * Development environment configuration.
 *
 * Same read-only gviz endpoint as production in V1; kept separate so the
 * data source can diverge (e.g. a test sheet) without code changes.
 */
export const environment = {
  production: false,
  sheets: {
    gvizUrl:
      'https://docs.google.com/spreadsheets/d/1yvchzyHq0lGJe4LOBW-h37IxpoCh7yJrAwKlz2ydDt0/gviz/tq?tqx=out:json&tq&gid=0',
  },
} as const;
