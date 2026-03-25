package com.waitless.dto;

import lombok.Data;

@Data
public class ServiceDeptDTO {
    private String name;
    private String description;
    private Integer avgDurationMinutes;
    private Integer maxQueueSize;
}
