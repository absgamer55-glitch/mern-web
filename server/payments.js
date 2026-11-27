// Payment methods the shop offers. Wallet methods turn on when you set the account
// number in .env. Card and PayPro need a merchant account with a gateway, so they
// are listed as "coming soon" until that integration is added.
const clean = (v) => (v || '').trim();

function getMethods() {
  return [
    {
      id: 'cod', kind: 'cod', label: 'Cash on delivery',
      note: 'Pay in cash when your order arrives.',
      enabled: process.env.COD_ENABLED !== 'false',
    },
    {
      id: 'easypaisa', kind: 'wallet', label: 'Easypaisa',
      note: 'Send the amount from your Easypaisa app, then enter the transaction ID.',
      enabled: !!clean(process.env.EASYPAISA_NUMBER),
      account: { number: clean(process.env.EASYPAISA_NUMBER), title: clean(process.env.EASYPAISA_TITLE) },
    },
    {
      id: 'jazzcash', kind: 'wallet', label: 'JazzCash',
      note: 'Send the amount from your JazzCash app, then enter the transaction ID.',
      enabled: !!clean(process.env.JAZZCASH_NUMBER),
      account: { number: clean(process.env.JAZZCASH_NUMBER), title: clean(process.env.JAZZCASH_TITLE) },
    },
    { id: 'card', kind: 'gateway', label: 'Credit / debit card', note: 'Pay securely online.', enabled: false },
    { id: 'paypro', kind: 'gateway', label: 'PayPro', note: 'Pay with PayPro checkout.', enabled: false },
  ];
}

// What the browser may see. Account numbers are only sent for enabled wallets.
function publicMethods() {
  return getMethods().map(({ id, kind, label, note, enabled, account }) => ({
    id, kind, label, note, enabled, ...(enabled && account ? { account } : {}),
  }));
}

module.exports = { getMethods, publicMethods };
