package com.waitless.service;

import com.waitless.dto.QueueJoinDTO;
import com.waitless.model.QueueTicket;
import com.waitless.model.ServiceDept;
import com.waitless.model.enums.TicketStatus;
import com.waitless.repository.QueueTicketRepository;
import com.waitless.repository.ResourceRepository;
import com.waitless.repository.ServiceDeptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class QueueService {

    private final QueueTicketRepository queueTicketRepository;
    private final ServiceDeptRepository serviceDeptRepository;
    private final ResourceRepository resourceRepository;

    public List<QueueTicket> getActiveQueue(Long serviceDeptId) {
        return queueTicketRepository.findByServiceDeptIdAndStatusInOrderByPriorityDescJoinedAtAsc(
                serviceDeptId,
                List.of(TicketStatus.WAITING, TicketStatus.CALLED)
        );
    }

    public QueueTicket joinQueue(QueueJoinDTO dto) {
        ServiceDept serviceDept = serviceDeptRepository.findById(dto.getServiceDeptId())
                .orElseThrow(() -> new RuntimeException("Service not found with id: " + dto.getServiceDeptId()));

        int nextNumber = queueTicketRepository.findMaxTicketNumberToday(dto.getServiceDeptId())
                .map(n -> n + 1)
                .orElse(1);

        long waitingCount = queueTicketRepository.countByServiceDeptIdAndStatus(dto.getServiceDeptId(), TicketStatus.WAITING);
        int estimatedWait = (int) (waitingCount * serviceDept.getAvgDurationMinutes());

        QueueTicket ticket = QueueTicket.builder()
                .ticketNumber(nextNumber)
                .patientName(dto.getPatientName())
                .patientPhone(dto.getPatientPhone())
                .status(TicketStatus.WAITING)
                .priority(dto.getPriority())
                .estimatedWaitMinutes(estimatedWait)
                .serviceDept(serviceDept)
                .build();

        if (dto.getResourceId() != null) {
            resourceRepository.findById(dto.getResourceId())
                    .ifPresent(ticket::setResource);
        }

        return queueTicketRepository.save(ticket);
    }

    public QueueTicket callNext(Long serviceDeptId) {
        List<QueueTicket> waiting = queueTicketRepository
                .findByServiceDeptIdAndStatusInOrderByPriorityDescJoinedAtAsc(
                        serviceDeptId, List.of(TicketStatus.WAITING));

        if (waiting.isEmpty()) {
            throw new RuntimeException("No patients waiting in queue");
        }

        QueueTicket next = waiting.get(0);
        next.setStatus(TicketStatus.CALLED);
        next.setCalledAt(LocalDateTime.now());
        return queueTicketRepository.save(next);
    }

    public QueueTicket updateStatus(Long ticketId, TicketStatus status) {
        QueueTicket ticket = queueTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
        ticket.setStatus(status);
        if (status == TicketStatus.COMPLETED || status == TicketStatus.ABSENT) {
            ticket.setCompletedAt(LocalDateTime.now());
        }
        return queueTicketRepository.save(ticket);
    }

    public QueueTicket getTicket(Long ticketId) {
        return queueTicketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found with id: " + ticketId));
    }
}
