/**
 * Production environment configuration.
 *
 * The Google Sheet is read via the public gviz endpoint (keyless, read-only).
 * This URL is treated as off-limits config — see docs/claude-charter.md.
 */
export const environment = {
  production: true,
  sheets: {
    // gviz endpoint for the single source-of-truth product sheet (read-only, V1).
    gvizUrl:
      'https://docs.google.com/spreadsheets/d/105x2kk-hCfXmHdw8P0QUOtd5hbiDhEYR43EPljTqxEY/gviz/tq?tqx=out:json&tq&gid=0',
  },
} as const;
