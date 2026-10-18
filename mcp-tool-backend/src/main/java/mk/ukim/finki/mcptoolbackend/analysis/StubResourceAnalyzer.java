package mk.ukim.finki.mcptoolbackend.analysis;

import mk.ukim.finki.mcptoolbackend.model.domain.Resource;
import mk.ukim.finki.mcptoolbackend.repository.ResourceRepository;
import org.springframework.stereotype.Component;

/**
 * Placeholder so the application boots before the assignment is implemented.
 * TODO(student): Replace this bean with a real analyzer.
 */
@Component
public class StubResourceAnalyzer implements ResourceAnalyzer {


    @Override
    public AnalysisOutcome analyze(String title, String content) {
//        throw new UnsupportedOperationException("TODO(student): Implement ResourceAnalyzer.analyze().");
        if (content == null || content.isBlank()) {
            return new AnalysisOutcome(
                    "",
                    java.util.List.of(),
                    0,
                    0
            );
        }

        String text = content.trim();

        // Word count
        int wordCount = text.split("\\s+").length;

        // Sentence count
        int sentenceCount = text
                .split("[.!?]+")
                .length;

        // Simple summary
        String summary;
        String[] sentences = text.split("[.!?]+");

        if (sentences.length > 0) {
            summary = sentences[0].trim();
        } else {
            summary = text;
        }

        java.util.Map<String, Integer> frequencies = new java.util.HashMap<>();

        for (String word : text.toLowerCase().split("\\s+")) {
            String cleaned = word.replaceAll("[^\\p{L}\\p{N}]", "");

            if (cleaned.length() >= 4) {
                frequencies.put(
                        cleaned,
                        frequencies.getOrDefault(cleaned, 0) + 1
                );
            }
        }

        java.util.List<String> keywords = frequencies.entrySet()
                .stream()
                .sorted(java.util.Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .map(java.util.Map.Entry::getKey)
                .toList();

        return new AnalysisOutcome(
                summary,
                keywords,
                sentenceCount,
                wordCount
        );
    }
}
