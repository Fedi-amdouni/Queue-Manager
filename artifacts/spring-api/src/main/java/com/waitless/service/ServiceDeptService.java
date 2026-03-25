package com.waitless.service;

import com.waitless.dto.ServiceDeptDTO;
import com.waitless.model.Organization;
import com.waitless.model.ServiceDept;
import com.waitless.repository.OrganizationRepository;
import com.waitless.repository.ServiceDeptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceDeptService {

    private final ServiceDeptRepository serviceDeptRepository;
    private final OrganizationRepository organizationRepository;

    public List<ServiceDept> findByOrganization(Long orgId) {
        return serviceDeptRepository.findByOrganizationId(orgId);
    }

    public ServiceDept findById(Long id) {
        return serviceDeptRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
    }

    public ServiceDept create(Long orgId, ServiceDeptDTO dto) {
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + orgId));
        ServiceDept service = ServiceDept.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .avgDurationMinutes(dto.getAvgDurationMinutes() != null ? dto.getAvgDurationMinutes() : 15)
                .maxQueueSize(dto.getMaxQueueSize() != null ? dto.getMaxQueueSize() : 50)
                .active(true)
                .organization(org)
                .build();
        return serviceDeptRepository.save(service);
    }

    public ServiceDept update(Long id, ServiceDeptDTO dto) {
        ServiceDept service = findById(id);
        if (dto.getName() != null) service.setName(dto.getName());
        if (dto.getDescription() != null) service.setDescription(dto.getDescription());
        if (dto.getAvgDurationMinutes() != null) service.setAvgDurationMinutes(dto.getAvgDurationMinutes());
        if (dto.getMaxQueueSize() != null) service.setMaxQueueSize(dto.getMaxQueueSize());
        return serviceDeptRepository.save(service);
    }

    public void delete(Long id) {
        ServiceDept service = findById(id);
        service.setActive(false);
        serviceDeptRepository.save(service);
    }
}
