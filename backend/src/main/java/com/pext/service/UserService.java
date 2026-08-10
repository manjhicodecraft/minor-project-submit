package com.pext.service;

import com.pext.model.User;
import com.pext.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User createUser(User user) {
        // Normalize values
        if (user.getUsername() != null) {
            user.setUsername(user.getUsername().trim());
        }
        if (user.getMobile() != null) {
            user.setMobile(user.getMobile().trim());
        }
        if (user.getPassword() != null) {
            user.setPassword(user.getPassword().trim());
        }

        // Set defaults
        if (user.getUsername() == null || user.getUsername().isEmpty()) {
            user.setUsername(user.getFullName() != null ? user.getFullName().replace(" ", "_") : "user_" + System.currentTimeMillis());
        }
        if (user.getCurrency() == null) {
            user.setCurrency("USD");
        }
        if (user.getFingerprintEnabled() == null) {
            user.setFingerprintEnabled(false);
        }
        if (user.getIsProfileComplete() == null) {
            user.setIsProfileComplete(false);
        }
        
        return userRepository.save(user);
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public Optional<User> getUserByMobile(String mobile) {
        return userRepository.findByMobile(mobile);
    }
    
    public long getAllUsersCount() {
        return userRepository.count();
    }
    
    public boolean authenticateUser(String mobile, String password) {
        if (mobile == null || password == null) {
            return false;
        }
        String normalizedMobile = mobile.trim();
        String normalizedPassword = password.trim();
        Optional<User> user = userRepository.findByMobile(normalizedMobile);
        return user.isPresent() && user.get().getPassword() != null && user.get().getPassword().equals(normalizedPassword);
    }
}