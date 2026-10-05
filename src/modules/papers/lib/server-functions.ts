export function useServerFn<Input, Output>(fn: (input: Input) => Promise<Output>) {
  return fn;
}
