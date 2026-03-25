package com.waitless.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long totalOrganizations;
    private long totalAppointmentsToday;
    private long pendingAppointments;
    private long completedAppointments;
    private long totalWaiting;
    private long totalServedToday;
    private double avgWaitMinutes;
}
