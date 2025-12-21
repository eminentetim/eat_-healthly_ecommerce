const Role = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin'
};

const Status = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
};

const Country = {
  NIGERIA: 'Nigeria'
};

const BusinessType = {
  INDIVIDUAL: 'individual business',
  REGISTERED: 'registered business'
};

const NotificationType = {
  EMAIL: 'email',
  PUSH: 'push'
};

module.exports = { Role, Status, Country, BusinessType, NotificationType };