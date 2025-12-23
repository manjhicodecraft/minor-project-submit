package com.pext.controller;

import com.pext.dto.CardDTO;
import com.pext.model.Card;
import com.pext.repository.CardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cards")
public class CardController {
    
    @Autowired
    private CardRepository cardRepository;
    
    @GetMapping
    public ResponseEntity<List<CardDTO>> getCards(@RequestParam(required = false) Long userId) {
        if (userId == null) {
            return ResponseEntity.ok(List.of());
        }
        
        List<Card> cards = cardRepository.findByUserId(userId);
        List<CardDTO> cardDTOs = cards.stream()
            .map(CardDTO::new)
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(cardDTOs);
    }
    
    @PostMapping
    public ResponseEntity<?> createCard(@RequestBody Card card) {
        try {
            // Validate required fields
            if (card.getContactNumber() == null || card.getContactNumber().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Contact number is required");
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            if (card.getCardAccountNumber() == null || card.getCardAccountNumber().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Card account number is required");
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            if (card.getAccountType() == null || card.getAccountType().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Account type is required");
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            if (card.getInitialBalance() == null || card.getInitialBalance().trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Initial balance is required");
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            // Validate contact number format (10-15 digits)
            if (!card.getContactNumber().matches("^[0-9]{10,15}$")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid contact number format. Must be 10-15 digits");
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            // Validate card account number format (10-20 digits)
            if (!card.getCardAccountNumber().matches("^[0-9]{10,20}$")) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid card account number format. Must be 10-20 digits");
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            // Validate initial balance is a positive number
            try {
                double balance = Double.parseDouble(card.getInitialBalance());
                if (balance < 0) {
                    Map<String, String> errorResponse = new HashMap<>();
                    errorResponse.put("message", "Initial balance must be a positive number");
                    return ResponseEntity.status(400).body(errorResponse);
                }
            } catch (NumberFormatException e) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Invalid initial balance format");
                return ResponseEntity.status(400).body(errorResponse);
            }
            
            Card savedCard = cardRepository.save(card);
            CardDTO cardDTO = new CardDTO(savedCard);
            return ResponseEntity.status(201).body(cardDTO);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to create card: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCard(@PathVariable Long id) {
        try {
            if (!cardRepository.existsById(id)) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Card not found");
                return ResponseEntity.status(404).body(errorResponse);
            }
            
            cardRepository.deleteById(id);
            Map<String, String> successResponse = new HashMap<>();
            successResponse.put("message", "Card deleted successfully");
            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to delete card: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}