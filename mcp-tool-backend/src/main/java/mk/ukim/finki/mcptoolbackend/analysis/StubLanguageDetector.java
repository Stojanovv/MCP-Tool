package mk.ukim.finki.mcptoolbackend.analysis;

import org.springframework.stereotype.Component;
import com.optimaize.langdetect.DetectedLanguage;
import com.optimaize.langdetect.LanguageDetectorBuilder;
import com.optimaize.langdetect.ngram.NgramExtractor;
import com.optimaize.langdetect.profiles.LanguageProfile;
import com.optimaize.langdetect.profiles.LanguageProfileReader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.List;
/**
 * Placeholder so the application boots before the assignment is implemented.
 * TODO(student): Replace this bean with a real Macedonian-language detector.
 */
@Component
public class StubLanguageDetector implements LanguageDetector {
    private final com.optimaize.langdetect.LanguageDetector detector;

    public StubLanguageDetector() {
        try {
            List<LanguageProfile> profiles =
                    new LanguageProfileReader().readAllBuiltIn();

            NgramExtractor ngramExtractor =
                    NgramExtractor.gramLengths(1, 2, 3);

            detector = LanguageDetectorBuilder
                    .create(ngramExtractor)
                    .withProfiles(profiles)
                    .build();

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Failed to initialize language detector",
                    e
            );
        }
    }
    @Override
    public double macedonianConfidence(String text) {
//        throw new UnsupportedOperationException("TODO(student): Implement LanguageDetector.macedonianConfidence().");
        if (text == null || text.isBlank()) {
            return 0.0;
        }

        List<DetectedLanguage> results =
                detector.getProbabilities(text);

        for (DetectedLanguage result : results) {
            if ("mk".equals(result.getLocale().getLanguage())) {
                return result.getProbability();
            }
        }

        return 0.0;
    }
}
