package com.delivery.backend;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_partners")
@Data
public class User {
    @Id
    @Column(nullable = false)
    private String email;

    private String name;
    
    @Column(unique = true, nullable = false)
    private String mobile;
    private String city;
    
    @Column(columnDefinition = "LONGTEXT")
    private String faceDescriptor; // JSON string of the embedding vector
    
    @Column(columnDefinition = "LONGTEXT")
    private String profileImage; // Base64 or URL
    
    private String maishaCard;
    private String dlNumber;
    private String dlExpiry;
    private String bankAccount;
    private String bankCode;
    private String accountHolder;
    private String mpesaNumber;
    
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
