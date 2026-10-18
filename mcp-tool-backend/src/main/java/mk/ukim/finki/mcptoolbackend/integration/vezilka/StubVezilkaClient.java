package mk.ukim.finki.mcptoolbackend.integration.vezilka;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.JsonNode;
import mk.ukim.finki.mcptoolbackend.model.enums.DonationStatus;
import mk.ukim.finki.mcptoolbackend.model.exception.VezilkaIntegrationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
/**
 * Placeholder so the application boots before the assignment is implemented.
 * TODO(student): Replace this bean with a real doniraj.vezilka.ai client.
 */
@Component
public class StubVezilkaClient implements VezilkaClient {

    private static final String TEXT_ENDPOINT =
            "/api/public/v1/donations/text/";

    private final VezilkaProperties vezilkaProperties;
    private final RestClient restClient;

    public StubVezilkaClient(
            VezilkaProperties vezilkaProperties,
            RestClient.Builder restClientBuilder) {

        this.vezilkaProperties = vezilkaProperties;
        this.restClient = restClientBuilder
                .baseUrl(vezilkaProperties.baseUrl())
                .build();
    }

    @Override
    public DonationReceipt submitTextDonation(TextDonationRequest request) {
        String apiKey = vezilkaProperties.apiKey();

        if (apiKey == null || apiKey.isBlank()) {
            throw new VezilkaIntegrationException(
                    "Vezilka API key is missing. Set VEZILKA_API_KEY.");
        }

        String cleanedText = cleanDonationText(request.content());

        System.out.println("===== VEZILKA TEXT CHECK =====");
        System.out.println("Original length: "
                + (request.content() == null
                ? 0 : request.content().length()));
        System.out.println("Cleaned length: " + cleanedText.length());
        System.out.println("Cleaned preview: "
                + cleanedText.substring(
                0, Math.min(cleanedText.length(), 500)));
        System.out.println("==============================");

        if (cleanedText.length() < 100) {
            throw new VezilkaIntegrationException(
                    "Not enough Macedonian text remained after cleaning. "
                            + "Cleaned length: " + cleanedText.length());
        }

        Map<String, Object> item = new LinkedHashMap<>();
        item.put("source_url", request.sourceUrl());
        item.put("text", cleanedText);
        item.put("page_title", request.title());
        item.put("page_language", "mk");

        Map<String, Object> body = Map.of(
                "items", List.of(item)
        );

        try {
            JsonNode response = restClient.post()
                    .uri(TEXT_ENDPOINT)
                    .header("X-Donation-Api-Key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null
                    || !response.has("results")
                    || !response.get("results").isArray()
                    || response.get("results").isEmpty()) {
                throw new VezilkaIntegrationException(
                        "Vezilka returned an empty or invalid response.");
            }

            JsonNode result = response.get("results").get(0);

            String reference = result.path("id").asText("");
            String status = result.path("status").asText("unknown");
            String reason = result.path("rejectionReason").asText("");

            if ("rejected".equalsIgnoreCase(status)) {
                throw new VezilkaIntegrationException(
                        "Vezilka rejected the donation. Reason: "
                                + (reason.isBlank()
                                ? "not provided" : reason)
                                + ". Result: " + result);
            }

            if (reference.isBlank()) {
                throw new VezilkaIntegrationException(
                        "Vezilka response did not contain a donation ID. "
                                + "Status: " + status
                                + ". Result: " + result);
            }

            String message = "Status: " + status
                    + "; deduped: "
                    + result.path("deduped").asBoolean(false);

            return new DonationReceipt(reference, message);

        } catch (RestClientResponseException e) {
            throw new VezilkaIntegrationException(
                    "Vezilka API returned HTTP "
                            + e.getStatusCode().value()
                            + ". Response: " + e.getResponseBodyAsString(),
                    e);
        } catch (RestClientException e) {
            throw new VezilkaIntegrationException(
                    "Could not communicate with Vezilka API.", e);
        }
    }

    private String cleanDonationText(String content) {
        if (content == null || content.isBlank()) {
            return "";
        }

        String text = content
                .replaceAll(
                        "(?i)IZVOR Macedonian Journal Repository", " ")
                .replaceAll(
                        "(?i)Publishers Journals Editors About Support", " ")
                .replaceAll("(?i)OAI-PMH Validator", " ")
                .replaceAll("(?i)Add to citations", " ")
                .replaceAll("(?i)View Full Text Cite / Export", " ")
                .replaceAll(
                        "(?i)Download citation metadata RIS BibTeX CSL-JSON",
                        " ")
                .replaceAll(
                        "(?i)Always check the citation against the requirements of your publication",
                        " ")
                .replaceAll("(?i)Copy a formatted citation", " ")
                .replaceAll("(?i)Citation basket.*", " ")
                .replaceAll(
                        "(?i)Contact \\| Privacy \\| Cookies Policy.*", " ")
                .replaceAll("(?i)Login|Support|About|Publishers|Editors", " ")
                .replaceAll("\\s+", " ")
                .trim();

        // Retain text segments that contain a meaningful amount
        // of Cyrillic text, which is used by Macedonian.
        String[] segments = text.split(
                "(?<=[.!?])(?=[А-ЯЃЌЉЊЏЅ])|(?<=[.!?])\\s+");

        List<String> macedonianSegments = new ArrayList<>();

        for (String segment : segments) {
            String part = segment.trim();

            long cyrillicCount = part.codePoints()
                    .filter(Character::isLetter)
                    .filter(cp ->
                            (cp >= 'А' && cp <= 'я')
                                    || "ЃѓЌќЉљЊњЏџЅѕ".indexOf(cp) >= 0)
                    .count();

            long letterCount = part.codePoints()
                    .filter(Character::isLetter)
                    .count();

            if (cyrillicCount >= 15
                    && letterCount > 0
                    && (double) cyrillicCount / letterCount >= 0.35) {
                macedonianSegments.add(part);
            }
        }

        return String.join(" ", macedonianSegments)
                .replaceAll("\\s+", " ")
                .trim();
    }

    @Override
    public DonationStatus checkStatus(String vezilkaReference) {
        String apiKey = vezilkaProperties.apiKey();

        if (apiKey == null || apiKey.isBlank()) {
            throw new VezilkaIntegrationException(
                    "Vezilka API key is missing. Set VEZILKA_API_KEY.");
        }

        try {
            JsonNode response = restClient.get()
                    .uri("/api/public/v1/donations/{id}/",
                            vezilkaReference)
                    .header("X-Donation-Api-Key", apiKey)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.hasNonNull("status")) {
                return null;
            }

            String status = response.get("status").asText();

            return switch (status.toLowerCase()) {
                case "accepted" -> DonationStatus.ACCEPTED;
                case "rejected" -> DonationStatus.REJECTED;
                default -> null;
            };

        } catch (RestClientResponseException e) {
            System.err.println(
                    "VEZILKA HTTP ERROR: " + e.getStatusCode().value());
            System.err.println(
                    "VEZILKA RESPONSE BODY: "
                            + e.getResponseBodyAsString());

            throw new VezilkaIntegrationException(
                    "Vezilka API returned HTTP "
                            + e.getStatusCode().value(), e);
        } catch (RestClientException e) {
            throw new VezilkaIntegrationException(
                    "Could not check donation status with Vezilka.", e);
        }
    }
}