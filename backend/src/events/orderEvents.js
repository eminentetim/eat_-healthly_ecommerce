// src/events/orderEvents.js
const eventEmitter = require('./eventEmitter');

const OrderEvents = {
  CREATED: 'order:created',
  STATUS_UPDATED: 'order:status_updated',
  PAYMENT_VERIFIED: 'order:payment_verified',
  SHIPPED: 'order:shipped',
  DELIVERED: 'order:delivered',
  CANCELLED: 'order:cancelled',
};

const emitOrderEvent = (event, order, extra = {}) => {
  eventEmitter.emit(event, { order, ...extra });
};

module.exports = {
  OrderEvents,
  emitOrderCreated: (order) => emitOrderEvent(OrderEvents.CREATED, order),
  emitOrderStatusUpdated: (order, oldStatus) =>
    emitOrderEvent(OrderEvents.STATUS_UPDATED, order, { oldStatus }),
  emitPaymentVerified: (order) => emitOrderEvent(OrderEvents.PAYMENT_VERIFIED, order),
  emitOrderShipped: (order) => emitOrderEvent(OrderEvents.SHIPPED, order),
  emitOrderDelivered: (order) => emitOrderEvent(OrderEvents.DELIVERED, order),
  emitOrderCancelled: (order) => emitOrderEvent(OrderEvents.CANCELLED, order),
};