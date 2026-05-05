# envpatch

> A utility for safely diffing and merging `.env` files across environments without exposing secrets.

## Installation

```bash
npm install -g envpatch
# or
npx envpatch
```

## Usage

Compare two `.env` files and generate a safe patch — values are redacted, only keys are diffed by default.

```bash
# Diff two env files
envpatch diff .env.local .env.production

# Merge a patch into an existing env file
envpatch merge .env.local env.patch.json --output .env.merged

# Show added/removed/changed keys without exposing values
envpatch diff .env.staging .env.production --keys-only

# Validate that all required keys from a reference file are present
envpatch validate .env.local --reference .env.example
```

**Example output:**

```
+ NEW_FEATURE_FLAG
~ DATABASE_URL        (changed)
- LEGACY_API_KEY
```

### Programmatic Usage

```ts
import { diffEnv, mergeEnv, validateEnv } from "envpatch";

const patch = diffEnv(".env.local", ".env.production");
console.log(patch.added);   // ['NEW_FEATURE_FLAG']
console.log(patch.changed); // ['DATABASE_URL']
console.log(patch.removed); // ['LEGACY_API_KEY']

mergeEnv(".env.local", patch, { output: ".env.merged" });

// Check that .env.local has all keys defined in .env.example
const result = validateEnv(".env.local", { reference: ".env.example" });
console.log(result.missing); // ['STRIPE_SECRET_KEY']
```

## Options

| Flag | Description |
|------|-------------|
| `--keys-only` | Show only key names, never values |
| `--output <file>` | Write result to a file instead of stdout |
| `--reference <file>` | Reference env file to validate against |
| `--silent` | Suppress warnings |

## Contributing

Pull requests are welcome. Please open an issue first to discuss any significant changes.

## License

[MIT](./LICENSE)
