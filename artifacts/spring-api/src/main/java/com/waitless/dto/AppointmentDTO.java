package com.waitless.dto;

import com.waitless.model.enums.AppointmentStatus;
import com.waitless.model.enums.Priority;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentDTO {
    private String patientName;
    private String patientPhone;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private AppointmentStatus status;
    private Priority priority;
    private String notes;
    private Long serviceDeptId;
    private Long resourceId;
}
