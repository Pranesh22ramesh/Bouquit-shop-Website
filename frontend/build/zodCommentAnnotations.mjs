// Zod 4.6.7 mentions @__PURE__ in prose in two files. Rollup treats those
// documentation words as misplaced annotations. Actual optimization annotations stay intact.
export function zodCommentAnnotations() {
  return {
    name: 'zod-documentation-annotations',
    enforce: 'pre',
    transform(code, id) {
      if (!/node_modules[\\/]zod[\\/]v4[\\/]core[\\/](?:regexes|util)\.js$/.test(id)) return null;
      const cleaned = code.replace(/\/\*\* Anchors a pattern source\.[\s\S]*?\*\/|\/\/ Wrapped in a `@__PURE__` IIFE:[^\r\n]*/g,
        (comment) => comment.replaceAll('`@__PURE__`', '`PURE`'));
      return cleaned === code ? null : { code: cleaned, map: null };
    },
  };
}
