package com.pext.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards")
public class Card {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "contact_number", nullable = false)
    private String contactNumber;
    
    @Column(name = "card_account_number", nullable = false)
    private String cardAccountNumber;
    
    @Column(name = "account_type", nullable = false)
    private String accountType;
    
    @Column(name = "initial_balance", nullable = false)
    private String initialBalance;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public Card() {}
    
    public Card(Long userId, String contactNumber, String cardAccountNumber, String accountType, String initialBalance) {
        this.userId = userId;
        this.contactNumber = contactNumber;
        this.cardAccountNumber = cardAccountNumber;
        this.accountType = accountType;
        this.initialBalance = initialBalance;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getContactNumber() {
        return contactNumber;
    }
    
    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
    
    public String getCardAccountNumber() {
        return cardAccountNumber;
    }
    
    public void setCardAccountNumber(String cardAccountNumber) {
        this.cardAccountNumber = cardAccountNumber;
    }
    
    public String getAccountType() {
        return accountType;
    }
    
    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }
    
    public String getInitialBalance() {
        return initialBalance;
    }
    
    public void setInitialBalance(String initialBalance) {
        this.initialBalance = initialBalance;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}