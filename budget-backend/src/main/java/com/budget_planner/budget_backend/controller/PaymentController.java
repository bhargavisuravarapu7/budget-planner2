
package com.budget_planner.budget_backend.controller;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.budget_planner.budget_backend.model.Payment;
import com.budget_planner.budget_backend.model.Transaction;
import com.budget_planner.budget_backend.payment.RazorpayService;
import com.budget_planner.budget_backend.repository.PaymentRepository;
import com.budget_planner.budget_backend.repository.TransactionRepository;
@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    private final RazorpayService razorpayService;
    private final PaymentRepository paymentRepository;
    private final TransactionRepository transactionRepository;

    public PaymentController(
            RazorpayService razorpayService,
            PaymentRepository paymentRepository,
            TransactionRepository transactionRepository) {

        this.razorpayService = razorpayService;
        this.paymentRepository = paymentRepository;
        this.transactionRepository = transactionRepository;
    }

    // STEP 1: Create Razorpay Order
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {

        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String title = request.get("title").toString();
            String category = request.get("category").toString();
            Long amountPaise = Long.valueOf(request.get("amountPaise").toString());

            if (amountPaise <= 0 || amountPaise > 100000000L) {
                return ResponseEntity.badRequest().body("Invalid payment amount");
            }

            String receipt = "budget_" + System.currentTimeMillis();
            var order = razorpayService.createOrder(amountPaise, receipt);
            String orderId = String.valueOf(order.get("id"));

            Payment payment = new Payment();
            payment.setUserId(userId);
            payment.setTitle(title);
            payment.setCategory(category);
            payment.setAmountPaise(amountPaise);
            payment.setRazorpayOrderId(orderId);
            payment.setStatus("CREATED");

            paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("amount", amountPaise);
            response.put("currency", "INR");
            response.put("keyId", getKeyId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
    e.printStackTrace();

    return ResponseEntity.internalServerError()
            .body("Unable to create payment order: "
                    + e.getClass().getSimpleName()
                    + " - " + e.getMessage());
}
    }

    // STEP 2: Verify Payment
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> request) {

        try {
            String orderId = request.get("razorpay_order_id").toString();
            String paymentId = request.get("razorpay_payment_id").toString();
            String signature = request.get("razorpay_signature").toString();

            Payment payment = paymentRepository
                    .findByRazorpayOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Payment order not found"));

            if ("SUCCESS".equals(payment.getStatus())) {
                return ResponseEntity.ok("Payment already verified");
            }

            boolean valid = razorpayService.verifySignature(
                    orderId, paymentId, signature
            );

            if (!valid) {
                return ResponseEntity.badRequest().body("Invalid payment signature");
            }

            payment.setRazorpayPaymentId(paymentId);
            payment.setStatus("SUCCESS");
            paymentRepository.save(payment);

            // Save successful payment as an expense
            Transaction transaction = new Transaction();
            transaction.setTitle(payment.getTitle());
            transaction.setAmount(payment.getAmountPaise() / 100.0);
            transaction.setCategory(payment.getCategory());
            transaction.setType("Expense");
            transaction.setDate(java.time.LocalDate.now());
            transaction.setDescription("Paid using Razorpay");
            transaction.setUserId(payment.getUserId());

            transactionRepository.save(transaction);

            return ResponseEntity.ok("Payment successful and expense recorded");

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Payment verification failed: " + e.getMessage());
        }
    }

    // STEP 3: Get Payment History
    @GetMapping
    public ResponseEntity<List<Payment>> getPayments(@RequestParam Long userId) {
        return ResponseEntity.ok(
                paymentRepository.findByUserIdOrderByCreatedAtDesc(userId)
        );
    }

    private String getKeyId() {
        return System.getenv("RAZORPAY_KEY_ID");
    }

}
