import "./Payments.css";
import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, History, Loader2 } from "lucide-react";
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
} from "./services/paymentService";

const CATEGORIES = [
  "Electricity",
  "Education",
  "Shopping",
  "Other",
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Payments({
  currentUser,
  formatMoney,
  onBack,
  onPaymentSuccess,
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Electricity");
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const userId = currentUser?.id ?? currentUser?.userId;

  const loadHistory = async () => {
    if (!userId) return;

    try {
      const data = await getPaymentHistory(userId);
      setPayments(data);
    } catch (error) {
      console.error("Payment history error:", error);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!userId) {
      setMessage("Please sign in again.");
      return;
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    if (!title.trim() || !Number.isFinite(amountInPaise) ||
        amountInPaise <= 0) {
      setMessage("Enter a valid title and amount.");
      return;
    }

    setLoading(true);

    try {
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        throw new Error("Unable to load Razorpay Checkout.");
      }

      const order = await createPaymentOrder({
        userId,
        title: title.trim(),
        category,
        amountPaise: amountInPaise,
      });

      if (!order.keyId || !order.orderId) {
        throw new Error("Razorpay credentials or order details are missing.");
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Budget Planner",
        description: title.trim(),
        order_id: order.orderId,

        handler: async (response) => {
          try {
           await verifyPayment(response);

if (onPaymentSuccess) {
  await onPaymentSuccess();
}

setMessage("Payment successful! Expense recorded.");
setTitle("");
setAmount("");
await loadHistory();
          } catch (error) {
            console.error("Verification error:", error);
            setMessage(
              "Payment verification failed. Please contact support."
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            setMessage("Payment window closed.");
          },
        },

        theme: {
          color: "#6366f1",
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (response) => {
        setLoading(false);
        setMessage(
          response.error?.description || "Payment failed. Try again."
        );
      });

      checkout.open();
    } catch (error) {
      console.error("Payment error:", error);
      setMessage(
        error.response?.data ||
        error.message ||
        "Unable to start payment."
      );
      setLoading(false);
    }
  };

  return (
    <div className="payments-page">
      <div className="payments-header">
        <button className="payment-back-btn" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>

        <div>
          <h2>Payments</h2>
          <p>Make and track payments using Razorpay.</p>
        </div>
      </div>

      <div className="payment-form-card">
        <div className="payment-card-heading">
          <CreditCard size={22} />
          <h3>Make a Payment</h3>
        </div>

        <form onSubmit={handlePayment}>
          <label>Payment title</label>
          <input
            type="text"
            placeholder="Example: Electricity bill"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <label>Amount (₹)</label>
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <button
            type="submit"
            className="make-payment-btn"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={18} /> Processing...</>
            ) : (
              <><CreditCard size={18} /> Pay Now</>
            )}
          </button>
        </form>

        {message && <p className="payment-message">{message}</p>}
      </div>

      <div className="payment-history-card">
        <div className="payment-card-heading">
          <History size={22} />
          <h3>Payment History</h3>
        </div>

        {payments.length === 0 ? (
          <p className="no-payments">No payments found yet.</p>
        ) : (
          <div className="payment-history-list">
            {payments.map((payment) => (
              <div className="payment-history-item" key={payment.id}>
                <div>
                  <strong>{payment.title}</strong>
                  <p>
                    {payment.category} ·{" "}
                    {payment.createdAt
                      ? new Date(payment.createdAt).toLocaleDateString()
                      : ""}
                  </p>
                </div>

                <div className="payment-history-right">
                  <strong>
                    {formatMoney
                      ? formatMoney(payment.amountPaise / 100)
                      : `₹${(payment.amountPaise / 100).toFixed(2)}`}
                  </strong>
                  <span className={payment.status === "SUCCESS"
                    ? "payment-success"
                    : "payment-pending"}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
