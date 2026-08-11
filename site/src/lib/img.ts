import type React from 'react';

/** Hide a broken image instead of showing the browser's broken-image icon.
 * Cover art is optional: a missing file should never dent the paper's look. */
export const imgError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  (e.currentTarget as HTMLImageElement).style.display = 'none';
};
