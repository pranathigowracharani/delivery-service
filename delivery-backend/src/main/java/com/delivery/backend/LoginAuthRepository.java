package com.delivery.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginAuthRepository extends JpaRepository<LoginAuth, LoginAuthId> {
    
    // Custom query to find by either email or mobile since they are part of the composite ID
    Optional<LoginAuth> findByIdEmailOrIdMobile(String email, String mobile);
}
