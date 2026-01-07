// src/utils/apiResponse.js
class ApiResponse {
  constructor({ message, data = null, meta = null }) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  // Helper for pagination responses
  static paginated(message, data, pagination) {
    return new ApiResponse({
      message,
      data,
      meta: { pagination },
    });
  }

  // Helper for simple success
  static success(message = 'Success', data = null, meta = null) {
    return new ApiResponse({ message, data, meta });
  }
}

module.exports = ApiResponse;