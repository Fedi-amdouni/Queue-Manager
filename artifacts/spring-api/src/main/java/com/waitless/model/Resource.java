package com.waitless.model;

import com.waitless.model.enums.ResourceType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private ResourceType type;

    @Column(name = "is_available")
    private boolean available = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_dept_id", nullable = false)
    @ToString.Exclude
    private ServiceDept serviceDept;
}
