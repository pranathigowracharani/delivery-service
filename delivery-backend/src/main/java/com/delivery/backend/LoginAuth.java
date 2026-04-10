package com.delivery.backend;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "login_auth")
@Data
public class LoginAuth {

    @EmbeddedId
    private LoginAuthId id;

    @Column(columnDefinition = "LONGTEXT")
    private String faceDescriptor;
    
    // Default constructor for JPA
    public LoginAuth() {}

    public LoginAuth(LoginAuthId id, String faceDescriptor) {
        this.id = id;
        this.faceDescriptor = faceDescriptor;
    }
}
