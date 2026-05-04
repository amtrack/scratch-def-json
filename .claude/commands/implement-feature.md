---
argument-hint: [featureIdOrName]
---

Implement a feature detection module for the Salesforce scratch org feature "$ARGUMENTS".

Follow these steps:

- **Find the feature** in `data/features.json` by matching "$ARGUMENTS" against either the `id` or `name` field (case-insensitive). Print the feature's `id`, `name`, `summary`, and `description`.

- **Check if feature is in scratch-def configs**: Verify that the feature's `name` is listed in the `features` array of at least one of the `config/*-features-scratch-def.json` files. If the feature is not listed in any of these files, inform the user that the feature is missing from the scratch org definitions and stop — the state files won't contain meaningful data for comparison without it.

- **Check if already implemented**: Look for an existing file at `src/features/<featureId>.ts`. If it exists, inform the user and stop.

- **Compare the state files** to find a good indicator for detecting whether this feature is enabled in a Salesforce org. Compare the 4 JSON files in `data/settings/`:
  - `developer-features.json` (features enabled)
  - `developer-no-features.json` (features disabled)
  - `enterprise-features.json` (features enabled)
  - `enterprise-no-features.json` (features disabled)

  Each file contains: `customObjectNames`, `settingNames`, `userLicenses`, `permissionSetLicenses`, `connectApiFeatures`.

  Look for differences between "features" and "no-features" variants that correlate with this specific feature. Good indicators are items present in "features" files but absent in "no-features" files. Use the feature description to guide what to look for (e.g. related object names, settings, licenses, permission set licenses).

- **Suggest an indicator** based on the analysis. Explain what you found and why it's a good indicator. The indicator should be one of these types:
  - `customObjectNames.includes("ObjectName")` - a custom object that appears only when the feature is enabled
  - `settingNames.includes("SettingName")` - a settings metadata that appears only when the feature is enabled
  - `userLicenses` check - a user license present only when the feature is enabled
  - `permissionSetLicenses` check - a permission set license present only when the feature is enabled
  - `connectApiFeatures` check - a ConnectApi feature flag that differs
  - `conn.metadata.read(...)` check - reading a specific metadata setting value
  - `anonymousApex` - Apex code to detect schema or configuration differences

- **If a good indicator is found**, implement it in `src/features/<featureId>.ts` following the existing patterns. Use the existing feature modules in `src/features/` as reference for the implementation style. The feature name returned should match the `name` field from `data/features.json` (without the `so_` prefix pattern).

  Two implementation strategies are available:

  **Strategy A: Direct check function** (preferred when possible):

  ```typescript
  import type { Connection } from "@salesforce/core";
  import type { Context } from "..";

  export default {
    check: async function (conn: Connection, ctx: Context) {
      if (ctx.customObjectNames.includes("SomeObject")) {
        return "FeatureName";
      }
    },
  };
  ```

  **Strategy B: Anonymous Apex** (when detection requires schema introspection):

  ```typescript
  const anonymousApex = `
  String so_featureid() {
    // Apex detection logic
    return null;
  }
  `;

  export default { anonymousApex };
  ```

  Add `skipNoFeatures: true` if the indicator is also present in no-features orgs (like ServiceCloud/Sites).

- **If no good indicator is found**, explain what was checked and why no reliable indicator could be determined. Do not create a file.
