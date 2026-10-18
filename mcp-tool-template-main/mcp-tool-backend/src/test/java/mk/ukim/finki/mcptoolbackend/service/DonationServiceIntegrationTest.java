package mk.ukim.finki.mcptoolbackend.service;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * TODO(student): Implement an integration test for the donation workflow
 * (create -> approve -> submit) with a stubbed or fake VezilkaClient. Remove
 * the {@code @Disabled} once implemented.
 */
@Disabled("TODO(student): implement the donation workflow integration test")
@SpringBootTest
@Testcontainers
public class DonationServiceIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
        .withDatabaseName("mcptool_test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Test
    void testDonationWorkflow() {
        // TODO(student): create a batch, approve it, submit it, and assert the
        //  resulting status transitions and the stored Vezilka reference.
    }
}
