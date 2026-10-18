package mk.ukim.finki.mcptoolbackend.repository;

import jakarta.transaction.Transactional;
import mk.ukim.finki.mcptoolbackend.config.JpaConfig;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * TODO(student): Implement repository tests for search runs, following the
 * working {@link UserRepositoryTest} example (real Postgres via Testcontainers,
 * migrated by Flyway). Remove the {@code @Disabled} once you add assertions.
 */
@Disabled("TODO(student): implement SearchRun repository tests")
@DataJpaTest
@Import(JpaConfig.class)
@Transactional
@Testcontainers
public class SearchRunRepositoryTest {
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

    @Autowired
    private SearchRunRepository searchRunRepository;

    @Test
    void testFindAllByOrderByCreatedAtDesc() {
        // TODO(student): save a few SearchRuns and assert the ordering.
    }
}
