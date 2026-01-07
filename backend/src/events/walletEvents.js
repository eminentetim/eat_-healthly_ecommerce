// src/events/walletEvents.js
const eventEmitter = require('./eventEmitter');

const WalletEvents = {
  CREDITED: 'wallet:credited',
  DEBITED: 'wallet:debited',
  WITHDRAWAL_REQUESTED: 'wallet:withdrawal_requested',
  WITHDRAWAL_APPROVED: 'wallet:withdrawal_approved',
  WITHDRAWAL_REJECTED: 'wallet:withdrawal_rejected',
};

const emitWalletEvent = (event, transaction, user) => {
  eventEmitter.emit(event, { transaction, user });
};

module.exports = {
  WalletEvents,
  emitWalletCredited: (transaction, user) => emitWalletEvent(WalletEvents.CREDITED, transaction, user),
  emitWalletDebited: (transaction, user) => emitWalletEvent(WalletEvents.DEBITED, transaction, user),
  emitWithdrawalRequested: (transaction, user) =>
    emitWalletEvent(WalletEvents.WITHDRAWAL_REQUESTED, transaction, user),
  emitWithdrawalApproved: (transaction, user) =>
    emitWalletEvent(WalletEvents.WITHDRAWAL_APPROVED, transaction, user),
  emitWithdrawalRejected: (transaction, user) =>
    emitWalletEvent(WalletEvents.WITHDRAWAL_REJECTED, transaction, user),
};