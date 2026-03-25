package com.waitless.controller;

import com.waitless.dto.CreateOrgWithAccountRequest;
import com.waitless.model.Organization;
import com.waitless.model.User;
import com.waitless.model.enums.UserRole;
import com.waitless.repository.OrganizationRepository;
import com.waitless.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("name", u.getName());
            m.put("email", u.getEmail());
            m.put("role", u.getRole().name());
            m.put("organizationId", u.getOrganizationId() != null ? u.getOrganizationId() : "");
            m.put("blocked", u.isBlocked());
            m.put("createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
            return m;
        }).collect(Collectors.toList());
    }

    @PostMapping("/organizations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> createOrgWithAccount(@RequestBody CreateOrgWithAccountRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cet email est déjà utilisé"));
        }

        Organization org = Organization.builder()
                .name(req.getName())
                .type(req.getType())
                .city(req.getCity())
                .address(req.getAddress())
                .phone(req.getPhone())
                .email(req.getEmail())
                .subscriptionPlan(req.getSubscriptionPlan())
                .active(true)
                .build();
        org = organizationRepository.save(org);

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(UserRole.CLINIC)
                .organizationId(org.getId())
                .blocked(false)
                .build();
        user = userRepository.save(user);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("organizationId", org.getId());
        result.put("userId", user.getId());
        result.put("name", org.getName());
        result.put("email", user.getEmail());
        result.put("message", "Organisation et compte créés avec succès");
        return ResponseEntity.ok(result);
    }

    @PutMapping("/organizations/{orgId}/toggle-block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> toggleBlock(@PathVariable Long orgId) {
        User user = userRepository.findByOrganizationId(orgId)
                .orElseThrow(() -> new RuntimeException("Aucun compte trouvé pour cette organisation"));

        user.setBlocked(!user.isBlocked());
        userRepository.save(user);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("userId", user.getId());
        result.put("organizationId", orgId);
        result.put("blocked", user.isBlocked());
        result.put("message", user.isBlocked() ? "Compte bloqué" : "Compte débloqué");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/organizations/accounts")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> getOrgsWithAccounts() {
        return organizationRepository.findAll().stream().map(org -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", org.getId());
            m.put("name", org.getName());
            m.put("type", org.getType() != null ? org.getType().name() : null);
            m.put("city", org.getCity());
            m.put("address", org.getAddress());
            m.put("phone", org.getPhone());
            m.put("email", org.getEmail());
            m.put("isActive", org.isActive());
            userRepository.findByOrganizationId(org.getId()).ifPresent(u -> {
                m.put("userId", u.getId());
                m.put("blocked", u.isBlocked());
            });
            return m;
        }).collect(Collectors.toList());
    }
}
