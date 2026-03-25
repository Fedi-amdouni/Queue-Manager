package com.waitless.dto;

import com.waitless.model.enums.OrgType;
import lombok.Data;

@Data
public class OrganizationDTO {
    private String name;
    private OrgType type;
    private String city;
    private String address;
    private String phone;
    private String email;
    private String subscriptionPlan;
}
