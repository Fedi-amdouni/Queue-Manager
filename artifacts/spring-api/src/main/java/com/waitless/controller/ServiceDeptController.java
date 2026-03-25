package com.waitless.controller;

import com.waitless.dto.ServiceDeptDTO;
import com.waitless.model.ServiceDept;
import com.waitless.service.ServiceDeptService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ServiceDeptController {

    private final ServiceDeptService serviceDeptService;

    @GetMapping("/organizations/{orgId}/services")
    public List<ServiceDept> getByOrganization(@PathVariable Long orgId) {
        return serviceDeptService.findByOrganization(orgId);
    }

    @PostMapping("/organizations/{orgId}/services")
    public ServiceDept create(@PathVariable Long orgId, @RequestBody ServiceDeptDTO dto) {
        return serviceDeptService.create(orgId, dto);
    }

    @GetMapping("/services/{id}")
    public ServiceDept getById(@PathVariable Long id) {
        return serviceDeptService.findById(id);
    }

    @PutMapping("/services/{id}")
    public ServiceDept update(@PathVariable Long id, @RequestBody ServiceDeptDTO dto) {
        return serviceDeptService.update(id, dto);
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serviceDeptService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
