package com.waitless.controller;

import com.waitless.dto.QueueJoinDTO;
import com.waitless.model.QueueTicket;
import com.waitless.model.enums.TicketStatus;
import com.waitless.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/queue")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;

    @GetMapping("/{serviceDeptId}")
    public List<QueueTicket> getQueue(@PathVariable Long serviceDeptId) {
        return queueService.getActiveQueue(serviceDeptId);
    }

    @PostMapping("/join")
    public QueueTicket join(@RequestBody QueueJoinDTO dto) {
        return queueService.joinQueue(dto);
    }

    @PostMapping("/{serviceDeptId}/call-next")
    public QueueTicket callNext(@PathVariable Long serviceDeptId) {
        return queueService.callNext(serviceDeptId);
    }

    @PatchMapping("/tickets/{ticketId}/status")
    public QueueTicket updateStatus(@PathVariable Long ticketId, @RequestBody Map<String, String> body) {
        TicketStatus status = TicketStatus.valueOf(body.get("status"));
        return queueService.updateStatus(ticketId, status);
    }

    @GetMapping("/tickets/{ticketId}")
    public QueueTicket getTicket(@PathVariable Long ticketId) {
        return queueService.getTicket(ticketId);
    }
}
