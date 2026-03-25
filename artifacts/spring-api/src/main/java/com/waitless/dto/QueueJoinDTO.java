package com.waitless.dto;

import com.waitless.model.enums.Priority;
import lombok.Data;

@Data
public class QueueJoinDTO {
    private String patientName;
    private String patientPhone;
    private Priority priority = Priority.NORMAL;
    private Long serviceDeptId;
    private Long resourceId;
}
