package com.waitless.controller;

import com.waitless.dto.OrganizationDTO;
import com.waitless.model.Organization;
import com.waitless.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @GetMapping
    public List<Organization> getAll() {
        return organizationService.findAll();
    }

    @GetMapping("/{id}")
    public Organization getById(@PathVariable Long id) {
        return organizationService.findById(id);
    }

    @PostMapping
    public Organization create(@RequestBody OrganizationDTO dto) {
        return organizationService.create(dto);
    }

    @PutMapping("/{id}")
    public Organization update(@PathVariable Long id, @RequestBody OrganizationDTO dto) {
        return organizationService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        organizationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
