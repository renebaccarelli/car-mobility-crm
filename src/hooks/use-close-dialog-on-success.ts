import { useState } from "react";

/**
 * Closes a dialog once a useActionState submission finishes without error.
 * Uses the "adjust state during render" pattern instead of an effect,
 * since comparing against the previous render's pending value is safe to
 * do synchronously during render (see react.dev/learn/you-might-not-need-an-effect).
 */
export function useCloseDialogOnSuccess(
  isPending: boolean,
  hasError: boolean,
  setOpen: (open: boolean) => void
) {
  const [prevPending, setPrevPending] = useState(isPending);

  if (isPending !== prevPending) {
    setPrevPending(isPending);
    if (!isPending && !hasError) {
      setOpen(false);
    }
  }
}
