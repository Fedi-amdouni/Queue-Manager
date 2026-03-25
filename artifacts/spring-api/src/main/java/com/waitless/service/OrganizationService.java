package com.waitless.service;

import com.waitless.dto.OrganizationDTO;
import com.waitless.model.Organization;
import com.waitless.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public List<Organization> findAll() {
        return organizationRepository.findByActiveTrue();
    }

    public Organization findById(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
    }

    public Organization create(OrganizationDTO dto) {
        Organization org = Organization.builder()
                .name(dto.getName())
                .type(dto.getType())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .subscriptionPlan(dto.getSubscriptionPlan())
                .active(true)
                .build();
        return organizationRepository.save(org);
    }

    public Organization update(Long id, OrganizationDTO dto) {
        Organization org = findById(id);
        if (dto.getName() != null) org.setName(dto.getName());
        if (dto.getType() != null) org.setType(dto.getType());
        if (dto.getAddress() != null) org.setAddress(dto.getAddress());
        if (dto.getPhone() != null) org.setPhone(dto.getPhone());
        if (dto.getEmail() != null) org.setEmail(dto.getEmail());
        if (dto.getSubscriptionPlan() != null) org.setSubscriptionPlan(dto.getSubscriptionPlan());
        return organizationRepository.save(org);
    }

    public void delete(Long id) {
        Organization org = findById(id);
        org.setActive(false);
        organizationRepository.save(org);
    }
}
