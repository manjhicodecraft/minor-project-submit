package com.pext.dto;

import com.pext.model.Card;

public class CardDTO {
    private Long id;
    private Long userId;
    private String contactNumber;
    private String cardAccountNumber;
    private String accountType;
    private String initialBalance;
    private java.time.LocalDateTime createdAt;

    public CardDTO(Card card) {
        this.id = card.getId();
        this.userId = card.getUserId();
        this.contactNumber = card.getContactNumber();
        this.cardAccountNumber = card.getCardAccountNumber();
        this.accountType = card.getAccountType();
        this.initialBalance = card.getInitialBalance();
        this.createdAt = card.getCreatedAt();
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

    public java.time.LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(java.time.LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}