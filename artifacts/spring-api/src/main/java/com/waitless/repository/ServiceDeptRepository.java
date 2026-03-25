package com.waitless.repository;

import com.waitless.model.ServiceDept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ServiceDeptRepository extends JpaRepository<ServiceDept, Long> {
    List<ServiceDept> findByOrganizationId(Long organizationId);
    List<ServiceDept> findByOrganizationIdAndActiveTrue(Long organizationId);
}
