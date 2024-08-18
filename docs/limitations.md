# MarkdownParser Limitations

The MarkdownParser, which uses Svelte's parser under the hood, has some limitations in handling certain complex scenarios. These limitations are documented here for clarity and to set appropriate expectations for usage.

## Known Limitations

1. **Escaped Characters in Component Props**: The parser cannot correctly handle escaped characters within component props. For example, the following will not parse correctly:

   ```markdown
   <Component prop="value with \"quotes\"" />
   ```

   This limitation is due to the underlying Svelte parser's behavior.

## Workarounds

Currently, there are no built-in workarounds for these limitations. Users should be aware of these constraints when preparing content for parsing.

If you encounter any additional limitations or have suggestions for workarounds, please report them to the project maintainers.