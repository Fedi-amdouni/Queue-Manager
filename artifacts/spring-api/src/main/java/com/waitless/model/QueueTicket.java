package com.waitless.model;

import com.waitless.model.enums.Priority;
import com.waitless.model.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_number", nullable = false)
    private Integer ticketNumber;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_phone")
    private String patientPhone;

    @Enumerated(EnumType.STRING)
    private TicketStatus status = TicketStatus.WAITING;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.NORMAL;

    @Column(name = "estimated_wait_minutes")
    private Integer estimatedWaitMinutes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_dept_id", nullable = false)
    @ToString.Exclude
    private ServiceDept serviceDept;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id")
    @ToString.Exclude
    private Resource resource;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "called_at")
    private LocalDateTime calledAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
