package com.pext.controller;

import com.pext.model.User;
import com.pext.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            if (user.getMobile() == null || user.getMobile().isBlank()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Mobile number is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (userService.getUserByMobile(user.getMobile()).isPresent()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "User with this mobile number already exists");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            if (user.getPassword() == null || user.getPassword().isBlank()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Password is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            User savedUser = userService.createUser(user);
            return ResponseEntity.status(201).body(savedUser);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Failed to create user");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "User not found");
            return ResponseEntity.status(404).body(errorResponse);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String mobile = credentials.get("mobile_number");
        String password = credentials.get("password");
        
        if (mobile == null || password == null) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Mobile number and password are required");
            return ResponseEntity.badRequest().body(errorResponse);
        }
        
        if (userService.authenticateUser(mobile, password)) {
            Optional<User> user = userService.getUserByMobile(mobile);
            return ResponseEntity.ok(user.get());
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid credentials");
            return ResponseEntity.status(401).body(errorResponse);
        }
    }
    
    @GetMapping("/users/{id}/dashboard")
    public ResponseEntity<?> getUserDashboard(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            Map<String, Object> dashboardData = new HashMap<>();
            dashboardData.put("user", user.get());
            
            // This would typically include aggregated data from accounts, transactions, etc.
            // For now, returning the user data as a starting point
            return ResponseEntity.ok(dashboardData);
        } else {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "User not found");
            return ResponseEntity.status(404).body(errorResponse);
        }
    }
}