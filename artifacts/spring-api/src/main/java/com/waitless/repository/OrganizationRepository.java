package com.waitless.repository;

import com.waitless.model.Organization;
import com.waitless.model.enums.OrgType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    List<Organization> findByActiveTrue();
    List<Organization> findByType(OrgType type);
}
