package com.waitless.repository;

import com.waitless.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByServiceDeptId(Long serviceDeptId);
    List<Resource> findByServiceDeptIdAndAvailableTrue(Long serviceDeptId);
}
