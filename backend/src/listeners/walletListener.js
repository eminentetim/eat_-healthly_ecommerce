// src/listeners/walletListener.js
const { WalletEvents } = require('../events/walletEvents');
const eventEmitter = require('../events/eventEmitter');
const { emitEmailNotification, emitInAppNotification } = require('../events/notificationEvents');

eventEmitter.on(WalletEvents.CREDITED, ({ transaction, user }) => {
  emitInAppNotification(user._id, 'Wallet Credited', `₦${transaction.amount} added to your wallet.`);
  emitEmailNotification(user.email, 'Wallet Credit', 'wallet_credit', { transaction });
});

eventEmitter.on(WalletEvents.WITHDRAWAL_APPROVED, ({ transaction, user }) => {
  emitInAppNotification(user._id, 'Withdrawal Approved', `₦${transaction.amount} has been sent to your bank.`);
  emitEmailNotification(user.email, 'Withdrawal Successful', 'withdrawal_approved', { transaction });
});