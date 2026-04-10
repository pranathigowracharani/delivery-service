package com.delivery.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoginAuthRepository loginAuthRepository;

    @Autowired
    private FaceAuthService faceAuthService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("mobile") String mobile,
            @RequestParam("city") String city,
            @RequestParam("maishaCard") String maishaCard,
            @RequestParam("dlNumber") String dlNumber,
            @RequestParam("dlExpiry") String dlExpiry,
            @RequestParam("bankAccount") String bankAccount,
            @RequestParam("bankCode") String bankCode,
            @RequestParam("accountHolder") String accountHolder,
            @RequestParam("mpesaNumber") String mpesaNumber,
            @RequestParam("image") MultipartFile image
    ) {
        try {
            // Check if user already exists
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email already registered"));
            }
            if (userRepository.findByMobile(mobile).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Mobile number already registered"));
            }

            // Call AI service to extract embedding
            byte[] imageBytes = image.getBytes();
            Map<String, Object> aiResponse = faceAuthService.extractEmbedding(imageBytes, image.getOriginalFilename());
            
            if (aiResponse == null || !(Boolean) aiResponse.get("success")) {
                String error = aiResponse != null ? (String) aiResponse.get("message") : "AI Service unavailable";
                return ResponseEntity.status(502).body(Map.of("success", false, "message", "Face capture failed: " + error));
            }

            String embeddingJson = objectMapper.writeValueAsString(aiResponse.get("embedding"));

            String base64Image;
            if (aiResponse.containsKey("isolated_face") && aiResponse.get("isolated_face") != null) {
                base64Image = (String) aiResponse.get("isolated_face");
            } else {
                base64Image = java.util.Base64.getEncoder().encodeToString(imageBytes);
            }
            
            User user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setMobile(mobile);
            user.setCity(city);
            user.setMaishaCard(maishaCard);
            user.setDlNumber(dlNumber);
            user.setDlExpiry(dlExpiry);
            user.setBankAccount(bankAccount);
            user.setBankCode(bankCode);
            user.setAccountHolder(accountHolder);
            user.setMpesaNumber(mpesaNumber);
            user.setFaceDescriptor(embeddingJson);
            user.setProfileImage(base64Image);
            
            userRepository.save(user);

            // Link with the login table using composite key (email + mobile)
            LoginAuthId loginId = new LoginAuthId(email, mobile);
            LoginAuth loginAuth = new LoginAuth(loginId, embeddingJson);
            loginAuthRepository.save(loginAuth);

            return ResponseEntity.ok(Map.of("success", true, "message", "User registered successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestParam("identifier") String identifier,
            @RequestParam("image") MultipartFile image
    ) {
        try {
            // Update: Search in LoginAuth table using composite identifier
            Optional<LoginAuth> loginAuthOpt = loginAuthRepository.findByIdEmailOrIdMobile(identifier, identifier);
            
            if (loginAuthOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("success", false, "message", "Login record not found"));
            }

            LoginAuth loginAuth = loginAuthOpt.get();
            byte[] imageBytes = image.getBytes();
            
            Map<String, Object> verifyResult = faceAuthService.verifyFace(
                imageBytes, 
                image.getOriginalFilename(), 
                loginAuth.getFaceDescriptor()
            );

            if (verifyResult != null && (Boolean) verifyResult.get("success") && (Boolean) verifyResult.get("match")) {
                // Fetch the full user profile to return on success
                String email = loginAuth.getId().getEmail();
                User user = userRepository.findByEmail(email).orElse(null);
                
                return ResponseEntity.ok(Map.of(
                    "success", true, 
                    "message", "Login successful",
                    "user", user
                ));
            } else {
                String errorMsg = "Face verification failed";
                if (verifyResult != null && verifyResult.containsKey("message")) {
                    errorMsg = (String) verifyResult.get("message");
                }
                return ResponseEntity.status(401).body(Map.of(
                    "success", false, 
                    "message", errorMsg
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Login error: " + e.getMessage()));
        }
    }

    @PostMapping("/liveness")
    public ResponseEntity<?> checkLiveness(@RequestParam("image") MultipartFile image) {
        try {
            byte[] imageBytes = image.getBytes();
            Map<String, Object> livenessResult = faceAuthService.checkLiveness(imageBytes, image.getOriginalFilename());
            return ResponseEntity.ok(livenessResult);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
