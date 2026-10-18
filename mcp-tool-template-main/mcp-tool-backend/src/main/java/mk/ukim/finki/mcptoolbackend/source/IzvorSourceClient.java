package mk.ukim.finki.mcptoolbackend.source;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

/**
 * Placeholder so the application boots before the assignment is implemented.
 * TODO(student): Replace this bean with a real client for YOUR assigned website.
 */
@Component
public class IzvorSourceClient implements SourceClient {

    private final SourceProperties sourceProperties;

    public IzvorSourceClient(SourceProperties sourceProperties) {
        this.sourceProperties = sourceProperties;
    }

    @Override
    public List<FetchedResource> search(String query, int limit) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        int safeLimit = Math.min(Math.max(limit, 1), 20);

        try {
            String encodedQuery = URLEncoder.encode(
                    query,
                    StandardCharsets.UTF_8
            );

            String searchUrl = sourceProperties.baseUrl()
                    + "/results.php?q="
                    + encodedQuery
                    + "&journal=&year=&sort=relevance";

            Document document = Jsoup.connect(searchUrl)
                    .userAgent("Mozilla/5.0")
                    .timeout(10_000)
                    .get();

            List<FetchedResource> results = new ArrayList<>();

            Elements links = document.select("a[href*='article.php?id=']");

            for (Element link : links) {
                if (results.size() >= safeLimit) {
                    break;
                }

                String url = link.absUrl("href");

                if (url.isBlank()) {
                    continue;
                }

                try {
                    FetchedResource resource = fetch(url);

                    if (resource != null) {
                        results.add(resource);
                    }
                } catch (Exception ignored) {
                    // Continue with the next result.
                }
            }

            return results;

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to search Izvor: " + query,
                    e
            );
        }
    }

    @Override
    public FetchedResource fetch(String url) {
        try {
            Document document = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(10_000)
                    .get();

            String externalId = extractArticleId(url);
            String title = "";

            // 1. Try article-specific title elements.
            Element titleElement = document.selectFirst(
                    ".article-title, .entry-title, .post-title, "
                            + ".publication-title, article h1, article h2"
            );

            if (titleElement != null) {
                title = titleElement.text().trim();
            }

            // 2. Try h2 headings if the title is missing
            // or contains only the website name.
            if (title.isBlank()
                    || title.equalsIgnoreCase("IZVOR")) {

                for (Element heading : document.select("h2")) {
                    String candidate = heading.text().trim();

                    if (!candidate.isBlank()
                            && !candidate.equalsIgnoreCase("IZVOR")
                            && !candidate.equalsIgnoreCase(
                            "Macedonian Journal Repository")) {
                        title = candidate;
                        break;
                    }
                }
            }

            // 3. Try Open Graph metadata.
            if (title.isBlank()
                    || title.equalsIgnoreCase("IZVOR")) {

                Element ogTitle = document.selectFirst(
                        "meta[property=og:title]"
                );

                if (ogTitle != null) {
                    title = ogTitle.attr("content").trim();
                }
            }

            // 4. Try the main h1 if it is not just the site name.
            if (title.isBlank()
                    || title.equalsIgnoreCase("IZVOR")) {

                Element h1 = document.selectFirst("h1");

                if (h1 != null) {
                    String candidate = h1.text().trim();

                    if (!candidate.isBlank()
                            && !candidate.equalsIgnoreCase("IZVOR")) {
                        title = candidate;
                    }
                }
            }

            // 5. Final fallback to the document title.
            if (title.isBlank()
                    || title.equalsIgnoreCase("IZVOR")) {

                title = document.title().trim();

                title = title.replaceAll(
                        "(?i)\\s*[-|–]\\s*IZVOR\\s*$",
                        ""
                ).trim();
            }

            Element body = document.body();

            String content = body != null
                    ? body.text().trim()
                    : "";

            return new FetchedResource(
                    externalId,
                    title,
                    content,
                    url,
                    LocalDateTime.now()
            );

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to fetch Izvor resource: " + url,
                    e
            );
        }
    }

    private String extractArticleId(String url) {
        int idIndex = url.indexOf("id=");

        if (idIndex == -1) {
            return url;
        }

        String id = url.substring(idIndex + 3);

        int ampersandIndex = id.indexOf("&");

        if (ampersandIndex != -1) {
            id = id.substring(0, ampersandIndex);
        }

        return id;
    }
}