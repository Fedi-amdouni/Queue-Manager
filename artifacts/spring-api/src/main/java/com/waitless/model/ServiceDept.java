package com.waitless.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "service_depts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ServiceDept {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "avg_duration_minutes")
    private Integer avgDurationMinutes = 15;

    @Column(name = "max_queue_size")
    private Integer maxQueueSize = 50;

    @Column(name = "is_active")
    private boolean active = true;

    @Column(name = "organization_id", insertable = false, updatable = false)
    private Long organizationId;

    @JsonIgnoreProperties({"services", "hibernateLazyInitializer"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @ToString.Exclude
    private Organization organization;

    @JsonIgnore
    @OneToMany(mappedBy = "serviceDept", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<Resource> resources;

    @JsonIgnore
    @OneToMany(mappedBy = "serviceDept", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<QueueTicket> queueTickets;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
