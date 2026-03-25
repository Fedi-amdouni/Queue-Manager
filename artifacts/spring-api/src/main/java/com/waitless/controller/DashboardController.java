package com.waitless.controller;

import com.waitless.dto.DashboardStatsDTO;
import com.waitless.model.enums.AppointmentStatus;
import com.waitless.model.enums.TicketStatus;
import com.waitless.repository.AppointmentRepository;
import com.waitless.repository.OrganizationRepository;
import com.waitless.repository.QueueTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final OrganizationRepository organizationRepository;
    private final AppointmentRepository appointmentRepository;
    private final QueueTicketRepository queueTicketRepository;

    @GetMapping("/stats")
    public DashboardStatsDTO getStats() {
        long totalOrgs = organizationRepository.count();
        long totalWaiting = queueTicketRepository.findAll().stream()
                .filter(t -> t.getStatus() == TicketStatus.WAITING).count();
        long totalServedToday = queueTicketRepository.findAll().stream()
                .filter(t -> t.getStatus() == TicketStatus.COMPLETED
                        && t.getCompletedAt() != null
                        && t.getCompletedAt().toLocalDate().equals(LocalDate.now()))
                .count();

        long totalApptToday = appointmentRepository.findAll().stream()
                .filter(a -> a.getAppointmentDate().equals(LocalDate.now())).count();
        long pendingAppt = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.PENDING).count();
        long completedAppt = appointmentRepository.findAll().stream()
                .filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();

        return DashboardStatsDTO.builder()
                .totalOrganizations(totalOrgs)
                .totalAppointmentsToday(totalApptToday)
                .pendingAppointments(pendingAppt)
                .completedAppointments(completedAppt)
                .totalWaiting(totalWaiting)
                .totalServedToday(totalServedToday)
                .avgWaitMinutes(15.0)
                .build();
    }
}
