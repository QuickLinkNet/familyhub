# Verification checklist

1. Confirm the exact screen version is approved by the user.
2. Compare changed behavior with the pre-change screen.
3. Run `npm run build`.
4. Lint changed PHP files with PHP 8.2 or newer when applicable.
5. Exercise only safe read operations against the configured Live API unless the user authorizes writes.
6. Test the screen in the built-in Codex browser at desktop and mobile widths.
7. Check loading, empty, error, long-content, keyboard, focus, and reduced-motion states.
8. Confirm no private values or generated runtime files are staged.
