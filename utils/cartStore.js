// ===== Shared Cart Storage =====
// This file exports a single Map that both cart.js and payment.js can use

const carts = new Map();

module.exports = carts;