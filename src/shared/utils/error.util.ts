/**
 * Type guard to safely check if an unknown value is an Error object.
 * Uses Error.isError if available (modern cross-realm check), falling back
 * to instanceof Error for older environments.
 *
 * @param target The value to check
 * @returns true if the value is an Error
 */
export function isError(target: unknown): target is Error {
  const ErrorConstructor = Error as unknown as Record<string, unknown>;
  if (typeof ErrorConstructor['isError'] === 'function') {
    return (ErrorConstructor['isError'] as (val: unknown) => boolean)(target);
  }
  return target instanceof Error;
}
