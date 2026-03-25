package com.waitless.config;

import com.waitless.model.*;
import com.waitless.model.enums.*;
import com.waitless.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final OrganizationRepository organizationRepository;
    private final ServiceDeptRepository serviceDeptRepository;
    private final ResourceRepository resourceRepository;
    private final AppointmentRepository appointmentRepository;
    private final QueueTicketRepository queueTicketRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (queueTicketRepository.count() > 0 || appointmentRepository.count() > 5) {
            log.info("DataSeeder: demo data already exists, skipping seed.");
            return;
        }

        log.info("DataSeeder: seeding demo data...");

        Organization clinic = organizationRepository.save(Organization.builder()
                .name("Clinique Al Amal")
                .type(OrgType.CLINIC)
                .city("Tunis")
                .address("12 Rue de la Liberté, Tunis")
                .phone("+216 71 234 567")
                .email("contact@amal-clinic.tn")
                .subscriptionPlan("PRO")
                .active(true)
                .build());

        User clinicAdmin = userRepository.save(User.builder()
                .name("Dr. Sami Ben Ali")
                .email("clinique@demo.com")
                .password(passwordEncoder.encode("demo1234"))
                .role(UserRole.CLINIC)
                .organizationId(clinic.getId())
                .build());

        User patient1 = userRepository.save(User.builder()
                .name("Ahmed Trabelsi")
                .email("patient@demo.com")
                .password(passwordEncoder.encode("demo1234"))
                .role(UserRole.CLIENT)
                .build());

        User patient2 = userRepository.save(User.builder()
                .name("Fatma Kchaou")
                .email("fatma@demo.com")
                .password(passwordEncoder.encode("demo1234"))
                .role(UserRole.CLIENT)
                .build());

        ServiceDept generalMed = serviceDeptRepository.save(ServiceDept.builder()
                .name("Médecine Générale")
                .description("Consultations générales et suivi")
                .avgDurationMinutes(15)
                .maxQueueSize(50)
                .active(true)
                .organization(clinic)
                .build());

        ServiceDept cardio = serviceDeptRepository.save(ServiceDept.builder()
                .name("Cardiologie")
                .description("Spécialiste des maladies cardiaques")
                .avgDurationMinutes(30)
                .maxQueueSize(30)
                .active(true)
                .organization(clinic)
                .build());

        ServiceDept pediatrics = serviceDeptRepository.save(ServiceDept.builder()
                .name("Pédiatrie")
                .description("Consultations pour enfants")
                .avgDurationMinutes(20)
                .maxQueueSize(40)
                .active(true)
                .organization(clinic)
                .build());

        ServiceDept radiology = serviceDeptRepository.save(ServiceDept.builder()
                .name("Radiologie")
                .description("Examens radiologiques et échographies")
                .avgDurationMinutes(25)
                .maxQueueSize(20)
                .active(true)
                .organization(clinic)
                .build());

        resourceRepository.save(Resource.builder().name("Dr. Sami Ben Ali").type(ResourceType.PRACTITIONER).available(true).serviceDept(generalMed).build());
        resourceRepository.save(Resource.builder().name("Dr. Leila Mansour").type(ResourceType.PRACTITIONER).available(true).serviceDept(cardio).build());
        resourceRepository.save(Resource.builder().name("Dr. Karim Jebali").type(ResourceType.PRACTITIONER).available(true).serviceDept(pediatrics).build());
        resourceRepository.save(Resource.builder().name("Scanner IRM").type(ResourceType.MACHINE).available(true).serviceDept(radiology).build());
        resourceRepository.save(Resource.builder().name("Salle d'examen 1").type(ResourceType.ROOM).available(true).serviceDept(generalMed).build());

        LocalDate today = LocalDate.now();
        List<Object[]> appointments = List.of(
            new Object[]{"Ahmed Trabelsi", "+216 55 111 222", today, LocalTime.of(9, 0), AppointmentStatus.CONFIRMED, Priority.NORMAL, generalMed, patient1.getId()},
            new Object[]{"Fatma Kchaou", "+216 55 333 444", today, LocalTime.of(9, 30), AppointmentStatus.PENDING, Priority.URGENT, generalMed, patient2.getId()},
            new Object[]{"Mohamed Hamdi", "+216 55 555 666", today, LocalTime.of(10, 0), AppointmentStatus.PENDING, Priority.NORMAL, generalMed, null},
            new Object[]{"Nour El Houda", "+216 55 777 888", today, LocalTime.of(10, 30), AppointmentStatus.CONFIRMED, Priority.PREGNANT, cardio, null},
            new Object[]{"Ali Chaabane", "+216 55 999 000", today, LocalTime.of(11, 0), AppointmentStatus.PENDING, Priority.ELDERLY, cardio, null},
            new Object[]{"Sarra Meddeb", "+216 55 123 456", today, LocalTime.of(11, 30), AppointmentStatus.CONFIRMED, Priority.NORMAL, pediatrics, null},
            new Object[]{"Youssef Belhaj", "+216 55 654 321", today, LocalTime.of(14, 0), AppointmentStatus.PENDING, Priority.NORMAL, radiology, null},
            new Object[]{"Rim Ayari", "+216 55 246 810", today, LocalTime.of(14, 30), AppointmentStatus.COMPLETED, Priority.NORMAL, generalMed, patient1.getId()},
            new Object[]{"Khaled Dridi", "+216 55 135 791", today, LocalTime.of(15, 0), AppointmentStatus.PENDING, Priority.NORMAL, generalMed, null},
            new Object[]{"Amira Boughanmi", "+216 55 864 209", today, LocalTime.of(15, 30), AppointmentStatus.CONFIRMED, Priority.NORMAL, cardio, null}
        );

        for (Object[] apt : appointments) {
            appointmentRepository.save(Appointment.builder()
                    .patientName((String) apt[0])
                    .patientPhone((String) apt[1])
                    .appointmentDate((LocalDate) apt[2])
                    .appointmentTime((LocalTime) apt[3])
                    .status((AppointmentStatus) apt[4])
                    .priority((Priority) apt[5])
                    .serviceDept((ServiceDept) apt[6])
                    .userId(apt[7] != null ? (Long) apt[7] : null)
                    .build());
        }

        List<Object[]> tickets = List.of(
            new Object[]{1, "Samir Gharbi", "+216 55 111 001", TicketStatus.CALLED, Priority.URGENT, generalMed, LocalDateTime.now().minusMinutes(25)},
            new Object[]{2, "Houda Zouari", "+216 55 111 002", TicketStatus.WAITING, Priority.PREGNANT, generalMed, LocalDateTime.now().minusMinutes(20)},
            new Object[]{3, "Bilel Mbarek", "+216 55 111 003", TicketStatus.WAITING, Priority.NORMAL, generalMed, LocalDateTime.now().minusMinutes(15)},
            new Object[]{4, "Inès Ferchichi", "+216 55 111 004", TicketStatus.WAITING, Priority.NORMAL, generalMed, LocalDateTime.now().minusMinutes(10)},
            new Object[]{5, "Mabrouk Sellami", "+216 55 111 005", TicketStatus.WAITING, Priority.ELDERLY, generalMed, LocalDateTime.now().minusMinutes(5)},
            new Object[]{1, "Emna Triki", "+216 55 222 001", TicketStatus.CALLED, Priority.NORMAL, cardio, LocalDateTime.now().minusMinutes(30)},
            new Object[]{2, "Riadh Hamrouni", "+216 55 222 002", TicketStatus.WAITING, Priority.URGENT, cardio, LocalDateTime.now().minusMinutes(18)},
            new Object[]{3, "Sonia Baccouche", "+216 55 222 003", TicketStatus.WAITING, Priority.NORMAL, cardio, LocalDateTime.now().minusMinutes(8)},
            new Object[]{1, "Lina Khediri", "+216 55 333 001", TicketStatus.WAITING, Priority.NORMAL, pediatrics, LocalDateTime.now().minusMinutes(22)},
            new Object[]{2, "Zied Sfar", "+216 55 333 002", TicketStatus.WAITING, Priority.NORMAL, pediatrics, LocalDateTime.now().minusMinutes(14)},
            new Object[]{3, "Cyrine Ouali", "+216 55 333 003", TicketStatus.WAITING, Priority.NORMAL, pediatrics, LocalDateTime.now().minusMinutes(7)},
            new Object[]{1, "Tarek Boujnah", "+216 55 444 001", TicketStatus.WAITING, Priority.NORMAL, radiology, LocalDateTime.now().minusMinutes(12)},
            new Object[]{2, "Olfa Gabsi", "+216 55 444 002", TicketStatus.WAITING, Priority.NORMAL, radiology, LocalDateTime.now().minusMinutes(4)},
            new Object[]{10, "Slim Haddad", null, TicketStatus.COMPLETED, Priority.NORMAL, generalMed, LocalDateTime.now().minusHours(2)},
            new Object[]{9, "Wafa Jlassi", null, TicketStatus.COMPLETED, Priority.NORMAL, generalMed, LocalDateTime.now().minusHours(1).minusMinutes(30)},
            new Object[]{8, "Chiheb Laabidi", null, TicketStatus.ABSENT, Priority.NORMAL, generalMed, LocalDateTime.now().minusHours(1)}
        );

        for (Object[] t : tickets) {
            QueueTicket ticket = QueueTicket.builder()
                    .ticketNumber((Integer) t[0])
                    .patientName((String) t[1])
                    .patientPhone((String) t[2])
                    .status((TicketStatus) t[3])
                    .priority((Priority) t[4])
                    .serviceDept((ServiceDept) t[5])
                    .joinedAt((LocalDateTime) t[6])
                    .estimatedWaitMinutes(((TicketStatus) t[3]) == TicketStatus.WAITING ? 15 : null)
                    .build();
            if (ticket.getStatus() == TicketStatus.CALLED) {
                ticket.setCalledAt(LocalDateTime.now().minusMinutes(5));
            }
            if (ticket.getStatus() == TicketStatus.COMPLETED) {
                ticket.setCalledAt((LocalDateTime) t[6]);
                ticket.setCompletedAt(((LocalDateTime) t[6]).plusMinutes(15));
            }
            queueTicketRepository.save(ticket);
        }

        log.info("DataSeeder: demo data seeded successfully.");
        log.info("Demo accounts:");
        log.info("  Clinique: clinique@demo.com / demo1234");
        log.info("  Patient:  patient@demo.com / demo1234");
    }
}
