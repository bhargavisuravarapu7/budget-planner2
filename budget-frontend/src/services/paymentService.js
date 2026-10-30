import api from "./api";

// Create a Razorpay order
export const createPaymentOrder = async (paymentData) => {
  const response = await api.post(
    "/payments/create-order",
    paymentData
  );

  return response.data;
};

// Verify the payment
export const verifyPayment = async (paymentData) => {
  const response = await api.post(
    "/payments/verify",
    paymentData
  );

  return response.data;
};

// Get payment history
export const getPaymentHistory = async (userId) => {
  const response = await api.get("/payments", {
    params: { userId },
  });

  return response.data;
};