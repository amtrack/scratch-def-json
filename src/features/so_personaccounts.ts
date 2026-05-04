// SELECT IsPersonAccount FROM Account LIMIT 1

const anonymousApex = `
String so_personaccounts() {
  if (Schema.sObjectType.Account.fields.getMap().containsKey('isPersonAccount')) {
    return 'PersonAccounts';
  }
  return null;
}
`;

export default { anonymousApex };
