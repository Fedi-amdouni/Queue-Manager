package com.waitless.repository;

import com.waitless.model.Appointment;
import com.waitless.model.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByServiceDeptId(Long serviceDeptId);
    List<Appointment> findByServiceDeptIdAndAppointmentDate(Long serviceDeptId, LocalDate date);
    List<Appointment> findByServiceDeptIdAndStatus(Long serviceDeptId, AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.serviceDept.organization.id = :orgId AND a.appointmentDate = :date")
    long countByOrganizationIdAndDate(Long orgId, LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.serviceDept.organization.id = :orgId AND a.status = :status")
    long countByOrganizationIdAndStatus(Long orgId, AppointmentStatus status);

    List<Appointment> findByServiceDeptIdAndAppointmentDateOrderByAppointmentTimeAsc(Long serviceDeptId, LocalDate date);
    List<Appointment> findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(Long userId);
    List<Appointment> findByServiceDeptOrganizationIdAndAppointmentDateOrderByAppointmentTimeAsc(Long orgId, LocalDate date);
}
