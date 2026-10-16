import { ValueTransformer } from 'typeorm';

/**
 * MySQL returns DECIMAL columns as strings via the driver. This transformer
 * converts them back to JavaScript numbers on read, so the API returns
 * numeric prices/ratings instead of strings.
 */
export class NumericTransformer implements ValueTransformer {
  to(value: number | null): number | null {
    return value;
  }

  from(value: string | null): number | null {
    if (value === null || value === undefined) return null;
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
}

export const numeric = new NumericTransformer();
