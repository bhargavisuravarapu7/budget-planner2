package com.budget_planner.budget_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.budget_planner.budget_backend.model.Transaction;
import com.budget_planner.budget_backend.repository.TransactionRepository;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://YOUR-VERCEL-DOMAIN.vercel.app"
})
public class TransactionController {

    private final TransactionRepository transactionRepository;

    public TransactionController(
            TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    // Get transactions for a specific user
    @GetMapping
    public List<Transaction> getAllTransactions(
            @RequestParam Long userId) {

        return transactionRepository.findByUserId(userId);
    }

    // Add a new transaction for a specific user
    @PostMapping
    public ResponseEntity<Transaction> addTransaction(
            @RequestParam Long userId,
            @RequestBody Transaction transaction) {

        transaction.setUserId(userId);

        Transaction savedTransaction =
                transactionRepository.save(transaction);

        return ResponseEntity.ok(savedTransaction);
    }

    // Update a transaction belonging to a specific user
    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestBody Transaction updatedTransaction) {

        return transactionRepository.findByIdAndUserId(id, userId)
                .map(transaction -> {

                    transaction.setTitle(updatedTransaction.getTitle());
                    transaction.setAmount(updatedTransaction.getAmount());
                    transaction.setCategory(updatedTransaction.getCategory());
                    transaction.setType(updatedTransaction.getType());
                    transaction.setDate(updatedTransaction.getDate());
                    transaction.setDescription(updatedTransaction.getDescription());

                    Transaction saved =
                            transactionRepository.save(transaction);

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a transaction belonging to a specific user
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            @PathVariable Long id,
            @RequestParam Long userId) {

        return transactionRepository.findByIdAndUserId(id, userId)
                .map(transaction -> {
                    transactionRepository.delete(transaction);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}