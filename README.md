# scratch-def-json

> Generate a [Scratch Org Definition File](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file.htm) for a given Salesforce org.

## Examples

Uses Org Shape if present:

```json
{
  "orgName": "ACME Inc.",
  "sourceOrg": "00Dfn00000DD5Gv"
}
```

Best guess:

```json
{
  "orgName": "ACME Inc.",
  "edition": "Developer",
  "language": "en_US",
  "country": "DE",
  "features": ["CPQ", "PersonAccounts"]
}
```

## Features

[Scratch Org Features](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm)

<!--features-start-->

10/316 features implemented

- [Communities](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm#so_communities)
- [ContactsToMultipleAccounts](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm#so_contactstomultipleaccounts)
- [CPQ](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm#so_cpq)
- [Knowledge](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm#so_knowledge)
- [PersonAccounts](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm#so_personaccounts)
- [ServiceCloud](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm#so_servicecloud)
- [SharedActivities](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm#so_sharedactivities)
- [Sites](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm#so_sites)
- [SocialCustomerService](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm#so_socialcustomerservice)
- [StateAndCountryPicklist](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm#so_stateandcountrypicklist)

<!--features-end-->

## Settings

Examples:

```json
{
  "settings": {
    "communitiesSettings": {
      "enableNetworksEnabled": true
    },
    "customAddressFieldSettings": {
      "enableCustomAddressField": true
    },
    "currencySettings": {
      "enableMultiCurrency": true
    }
  }
}
```

## Resources

> Edition, Features, and Settings fields on the ShapeRepresentation object have been deprecated from all API versions as a part of Org Shape feature GA. Remove these fields from your Apex and Java code to avoid compilation errors or request failures because the WSDL for the object has changed.
>
> -- https://help.salesforce.com/s/articleView?id=release-notes.rn_api_objects.htm&release=238&type=5

- https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_shaperepresentation.htm
- https://trailhead.salesforce.com/trailblazer-community/feed/0D54S00000BbgHZSAZ
- https://github.com/texei/texei-sfdx-plugin/blob/master/src/commands/texei/org/shape/extract.ts
- https://www.youtube.com/watch?v=bRmpRK22bA4&t=2873s
