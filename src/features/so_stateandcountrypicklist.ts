// SELECT BillingCountryCode FROM Account LIMIT 1

const anonymousApex = `
String so_stateandcountrypicklist() {
  if (Schema.sObjectType.Account.fields.getMap().containsKey('BillingCountryCode')) {
    return 'StateAndCountryPicklist';
  }
  return null;
}
`;

export default { anonymousApex };
