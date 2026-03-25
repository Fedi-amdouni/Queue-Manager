package com.waitless.service;

import com.waitless.dto.AppointmentDTO;
import com.waitless.model.Appointment;
import com.waitless.model.ServiceDept;
import com.waitless.model.enums.AppointmentStatus;
import com.waitless.repository.AppointmentRepository;
import com.waitless.repository.ResourceRepository;
import com.waitless.repository.ServiceDeptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ServiceDeptRepository serviceDeptRepository;
    private final ResourceRepository resourceRepository;

    public List<Appointment> findByServiceAndDate(Long serviceDeptId, LocalDate date) {
        return appointmentRepository.findByServiceDeptIdAndAppointmentDateOrderByAppointmentTimeAsc(serviceDeptId, date);
    }

    public List<Appointment> findByService(Long serviceDeptId) {
        return appointmentRepository.findByServiceDeptId(serviceDeptId);
    }

    public List<Appointment> findByUser(Long userId) {
        return appointmentRepository.findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(userId);
    }

    public List<Appointment> findByOrganizationAndDate(Long orgId, LocalDate date) {
        return appointmentRepository.findByServiceDeptOrganizationIdAndAppointmentDateOrderByAppointmentTimeAsc(orgId, date);
    }

    public Appointment findById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
    }

    public Appointment create(AppointmentDTO dto) {
        ServiceDept serviceDept = serviceDeptRepository.findById(dto.getServiceDeptId())
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + dto.getServiceDeptId()));

        Appointment apt = Appointment.builder()
                .patientName(dto.getPatientName())
                .patientPhone(dto.getPatientPhone())
                .appointmentDate(dto.getAppointmentDate())
                .appointmentTime(dto.getAppointmentTime())
                .status(AppointmentStatus.PENDING)
                .priority(dto.getPriority())
                .notes(dto.getNotes())
                .serviceDept(serviceDept)
                .userId(dto.getUserId())
                .build();

        if (dto.getResourceId() != null) {
            resourceRepository.findById(dto.getResourceId())
                    .ifPresent(apt::setResource);
        }

        return appointmentRepository.save(apt);
    }

    public Appointment updateStatus(Long id, AppointmentStatus status) {
        Appointment apt = findById(id);
        apt.setStatus(status);
        return appointmentRepository.save(apt);
    }

    public Appointment update(Long id, AppointmentDTO dto) {
        Appointment apt = findById(id);
        if (dto.getPatientName() != null) apt.setPatientName(dto.getPatientName());
        if (dto.getPatientPhone() != null) apt.setPatientPhone(dto.getPatientPhone());
        if (dto.getAppointmentDate() != null) apt.setAppointmentDate(dto.getAppointmentDate());
        if (dto.getAppointmentTime() != null) apt.setAppointmentTime(dto.getAppointmentTime());
        if (dto.getStatus() != null) apt.setStatus(dto.getStatus());
        if (dto.getPriority() != null) apt.setPriority(dto.getPriority());
        if (dto.getNotes() != null) apt.setNotes(dto.getNotes());
        return appointmentRepository.save(apt);
    }

    public void delete(Long id) {
        Appointment apt = findById(id);
        apt.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(apt);
    }
}
