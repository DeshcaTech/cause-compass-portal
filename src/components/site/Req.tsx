/** Red asterisk marking a mandatory form field. */
export function Req() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-destructive">
      *
    </span>
  );
}