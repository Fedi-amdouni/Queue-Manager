package com.waitless.repository;

import com.waitless.model.QueueTicket;
import com.waitless.model.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QueueTicketRepository extends JpaRepository<QueueTicket, Long> {
    List<QueueTicket> findByServiceDeptIdAndStatusInOrderByPriorityDescJoinedAtAsc(Long serviceDeptId, List<TicketStatus> statuses);
    List<QueueTicket> findByServiceDeptIdAndStatus(Long serviceDeptId, TicketStatus status);

    @Query("SELECT MAX(t.ticketNumber) FROM QueueTicket t WHERE t.serviceDept.id = :serviceDeptId AND cast(t.joinedAt as LocalDate) = current_date")
    Optional<Integer> findMaxTicketNumberToday(Long serviceDeptId);

    long countByServiceDeptIdAndStatus(Long serviceDeptId, TicketStatus status);
}
