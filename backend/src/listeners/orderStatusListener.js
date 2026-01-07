// src/listeners/orderStatusListener.js
const { OrderEvents } = require('../events/orderEvents');
const eventEmitter = require('../events/eventEmitter');
const { emitEmailNotification, emitInAppNotification } = require('../events/notificationEvents');

eventEmitter.on(OrderEvents.CREATED, ({ order }) => {
  // Notify customer
  emitInAppNotification(order.customer_id, 'Order Placed', `Order #${order.order_number} has been placed.`);
  emitEmailNotification(order.customer.email, 'Order Confirmation', 'order_confirmation', { order });

  // Notify vendor
  emitInAppNotification(order.vendor_id, 'New Order', `New order #${order.order_number} received.`);
});

eventEmitter.on(OrderEvents.STATUS_UPDATED, ({ order }) => {
  emitInAppNotification(order.customer_id, 'Order Update', `Your order #${order.order_number} is now ${order.status}.`);
  emitEmailNotification(order.customer.email, 'Order Status Update', 'order_status_update', { order });
});