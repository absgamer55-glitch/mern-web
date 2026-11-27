export const METHOD_LABEL = { cod: 'Cash on delivery', easypaisa: 'Easypaisa', jazzcash: 'JazzCash', card: 'Card', paypro: 'PayPro' };
export const PAY_STATUS = { unpaid: 'Unpaid', awaiting_verification: 'Awaiting verification', paid: 'Paid', failed: 'Payment failed' };

// "Easypaisa · Awaiting verification", "Cash on delivery · Pay on delivery"
export const payText = (o) => {
  const method = o.paymentMethod || 'cod';
  const status = o.paymentStatus || 'unpaid';
  const s = method === 'cod' && status === 'unpaid' ? 'Pay on delivery' : PAY_STATUS[status];
  return `${METHOD_LABEL[method]} · ${s}`;
};
