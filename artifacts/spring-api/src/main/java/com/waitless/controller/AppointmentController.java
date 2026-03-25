package com.waitless.controller;

import com.waitless.dto.AppointmentDTO;
import com.waitless.model.Appointment;
import com.waitless.model.enums.AppointmentStatus;
import com.waitless.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @GetMapping
    public List<Appointment> getAll(
            @RequestParam(required = false) Long serviceDeptId,
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (orgId != null && date != null) {
            return appointmentService.findByOrganizationAndDate(orgId, date);
        }
        if (serviceDeptId != null && date != null) {
            return appointmentService.findByServiceAndDate(serviceDeptId, date);
        }
        if (serviceDeptId != null) {
            return appointmentService.findByService(serviceDeptId);
        }
        return List.of();
    }

    @GetMapping("/my")
    public List<Appointment> getMy(Authentication auth) {
        Long userId = (Long) auth.getPrincipal();
        return appointmentService.findByUser(userId);
    }

    @GetMapping("/{id}")
    public Appointment getById(@PathVariable Long id) {
        return appointmentService.findById(id);
    }

    @PostMapping
    public Appointment create(@RequestBody AppointmentDTO dto) {
        return appointmentService.create(dto);
    }

    @PutMapping("/{id}")
    public Appointment update(@PathVariable Long id, @RequestBody AppointmentDTO dto) {
        return appointmentService.update(id, dto);
    }

    @PatchMapping("/{id}/status")
    public Appointment updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        AppointmentStatus status = AppointmentStatus.valueOf(body.get("status"));
        return appointmentService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        appointmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
