package mk.ukim.finki.mcptoolbackend.service.domain.impl;

import java.time.LocalDateTime;
import java.util.Optional;

import mk.ukim.finki.mcptoolbackend.analysis.AnalysisOutcome;
import mk.ukim.finki.mcptoolbackend.analysis.LanguageDetector;
import mk.ukim.finki.mcptoolbackend.analysis.ResourceAnalyzer;
import mk.ukim.finki.mcptoolbackend.model.domain.Resource;
import mk.ukim.finki.mcptoolbackend.model.domain.ResourceAnalysis;
import mk.ukim.finki.mcptoolbackend.model.dto.ResourceFilterDto;
import mk.ukim.finki.mcptoolbackend.repository.ResourceRepository;
import mk.ukim.finki.mcptoolbackend.service.domain.ResourceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.data.jpa.domain.Specification;

/**
 * TODO(student): Implement this service.
 *
 * <p>Build a {@code Specification<Resource>} from the non-null fields of the
 * {@link ResourceFilterDto} and call {@code resourceRepository.findAll(spec,
 * pageable)}. For {@code analyze}, delegate to {@link ResourceAnalyzer} and
 * {@link LanguageDetector}.</p>
 */
@Service
public class ResourceServiceImpl implements ResourceService {
    private final ResourceRepository resourceRepository;
    private final ResourceAnalyzer resourceAnalyzer;
    private final LanguageDetector languageDetector;

    public ResourceServiceImpl(ResourceRepository resourceRepository,
                               ResourceAnalyzer resourceAnalyzer,
                               LanguageDetector languageDetector) {
        this.resourceRepository = resourceRepository;
        this.resourceAnalyzer = resourceAnalyzer;
        this.languageDetector = languageDetector;
    }

    @Override
    public Page<Resource> findAll(ResourceFilterDto filter, Pageable pageable) {
//        throw new UnsupportedOperationException("TODO(student): Implement ResourceService.findAll() with a Specification.");
        Specification<Resource>specification=Specification.where(null);

        if (filter!=null){
            if (filter.searchRunId()!=null){
                specification=specification.and((root, query, criteriaBuilder) ->
                        criteriaBuilder.equal(root.get("searchRun").get("id"),filter.searchRunId()));
            }

        }

        if (filter.minMacedonianConfidence() != null) {
            specification = specification.and(
                    (root, query, cb) ->
                            cb.greaterThanOrEqualTo(
                                    root.get("macedonianConfidence"),
                                    filter.minMacedonianConfidence()
                            )
            );
        }

        if (filter.analyzed() != null) {
            specification = specification.and(
                    (root, query, cb) -> {
                        if (filter.analyzed()) {
                            return cb.isNotNull(root.get("analysis"));
                        } else {
                            return cb.isNull(root.get("analysis"));
                        }
                    }
            );
        }

        if (filter.donated() != null) {
            specification = specification.and(
                    (root, query, cb) -> {
                        if (filter.donated()) {
                            return cb.isNotNull(root.get("donationBatch"));
                        } else {
                            return cb.isNull(root.get("donationBatch"));
                        }
                    }
            );
        }

        if (filter.search() != null && !filter.search().isBlank()) {
            String search = "%" + filter.search().toLowerCase() + "%";

            specification = specification.and(
                    (root, query, cb) ->
                            cb.or(
                                    cb.like(
                                            cb.lower(root.get("title")),
                                            search
                                    ),
                                    cb.like(
                                            cb.lower(root.get("content")),
                                            search
                                    ),
                                    cb.like(
                                            cb.lower(root.get("externalId")),
                                            search
                                    )
                            )
            );
        }

        return resourceRepository.findAll(specification,pageable);
    }

    @Override
    public Optional<Resource> findById(Long id) {
//        throw new UnsupportedOperationException("TODO(student): Implement ResourceService.findById().");
        return resourceRepository.findById(id);
    }

    @Override
    public Optional<Resource> deleteById(Long id) {
//        throw new UnsupportedOperationException("TODO(student): Implement ResourceService.deleteById().");
        Optional<Resource> resource = findById(id);
        resourceRepository.delete(resource.orElseThrow());
        return resource;
    }

    @Override
    public Resource analyze(Long id) {
        // TODO(student):
        //  1. Load the resource (or throw ResourceNotFoundException).
        //  2. AnalysisOutcome outcome = resourceAnalyzer.analyze(title, content).
        //  3. Create/update a ResourceAnalysis from the outcome; set its
        //     macedonianConfidence from languageDetector; set analyzedAt = now.
        //  4. Persist and return the resource.
//        throw new UnsupportedOperationException("TODO(student): Implement ResourceService.analyze().");
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(()->new IllegalArgumentException("Resource not found: "+id));

        AnalysisOutcome outcome = resourceAnalyzer.analyze(resource.getTitle(),resource.getContent());

        ResourceAnalysis analysis = resource.getAnalysis();

        if (analysis==null){
            analysis=new ResourceAnalysis(resource);
        }

        analysis.setSummary(outcome.summary());

        if (outcome.keywords()!=null){
            analysis.setKeywords(String.join(", ", outcome.keywords()));
        }else {
            analysis.setKeywords("");
        }

        analysis.setSentenceCount(outcome.sentenceCount());

        analysis.setMacedonianConfidence(languageDetector.macedonianConfidence(resource.getContent()));

        analysis.setAnalyzedAt(LocalDateTime.now());

        resource.setAnalysis(analysis);

        return resourceRepository.save(resource);
    }
}
