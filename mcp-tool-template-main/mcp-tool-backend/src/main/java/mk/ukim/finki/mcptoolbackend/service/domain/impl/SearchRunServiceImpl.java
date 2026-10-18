package mk.ukim.finki.mcptoolbackend.service.domain.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import mk.ukim.finki.mcptoolbackend.analysis.LanguageDetector;
import mk.ukim.finki.mcptoolbackend.model.domain.Resource;
import mk.ukim.finki.mcptoolbackend.model.domain.SearchRun;
import mk.ukim.finki.mcptoolbackend.model.enums.SearchStatus;
import mk.ukim.finki.mcptoolbackend.repository.ResourceRepository;
import mk.ukim.finki.mcptoolbackend.repository.SearchRunRepository;
import mk.ukim.finki.mcptoolbackend.service.domain.SearchRunService;
import mk.ukim.finki.mcptoolbackend.source.FetchedResource;
import mk.ukim.finki.mcptoolbackend.source.SourceClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * TODO(student): Implement this service.
 *
 * <p>The dependencies you will need are already injected: {@link SourceClient}
 * to reach the assigned website, {@link LanguageDetector} to score Macedonian
 * content, and the repositories to persist the run and its resources.</p>
 */
@Service
public class SearchRunServiceImpl implements SearchRunService {
    private final SearchRunRepository searchRunRepository;
    private final ResourceRepository resourceRepository;
    private final SourceClient sourceClient;
    private final LanguageDetector languageDetector;

    public SearchRunServiceImpl(SearchRunRepository searchRunRepository,
                                ResourceRepository resourceRepository,
                                SourceClient sourceClient,
                                LanguageDetector languageDetector) {
        this.searchRunRepository = searchRunRepository;
        this.resourceRepository = resourceRepository;
        this.sourceClient = sourceClient;
        this.languageDetector = languageDetector;
    }

    @Override
    public List<SearchRun> findAll() {
//        throw new UnsupportedOperationException("TODO(student): Implement SearchRunService.findAll().");
        return searchRunRepository.findAll();
    }

    @Override
    public Optional<SearchRun> findById(Long id) {
//        throw new UnsupportedOperationException("TODO(student): Implement SearchRunService.findById().");
        return searchRunRepository.findById(id);
    }

    @Transactional
    @Override
    public SearchRun run(String query, int limit) {
        // TODO(student):
        //  1. Save a new SearchRun(query) with status RUNNING and startedAt = now.
        //  2. sourceClient.search(query, limit) -> for each FetchedResource, build a
        //     Resource, set fetchedAt, wordCount, and
        //     macedonianConfidence = languageDetector.macedonianConfidence(content).
        //  3. Persist the resources, set resultCount, mark the run COMPLETED
        //     (finishedAt = now). On any failure, mark it FAILED and rethrow.
//        throw new UnsupportedOperationException("TODO(student): Implement SearchRunService.run().");
        SearchRun searchRun = new SearchRun(query);
        searchRun.setStatus(SearchStatus.RUNNING);
        searchRun.setStartedAt(LocalDateTime.now());
        searchRun = searchRunRepository.save(searchRun);

        try {
            List<FetchedResource>fetchedResources=sourceClient.search(query,limit);

            for (FetchedResource fetchedResource : fetchedResources){
                Resource resource = new Resource(searchRun,fetchedResource.externalId(),fetchedResource.title(),fetchedResource.content(),fetchedResource.sourceUrl());
                resource.setFetchedAt(LocalDateTime.now());
                String content = fetchedResource.content();

                if (content!=null && !content.isBlank()){
                    resource.setWordCount(content.trim().split("\\s+").length);

                    resource.setMacedonianConfidence(languageDetector.macedonianConfidence(content));

                }else {
                    resource.setWordCount(0);
                    resource.setMacedonianConfidence(0.0);
                }

                resource.setLanguage("mk");
                resourceRepository.save(resource);
                searchRun.getResources().add(resource);
            }

            searchRun.setResultCount(fetchedResources.size());
            searchRun.setStatus(SearchStatus.COMPLETED);
            searchRun.setFinishedAt(LocalDateTime.now());

            return searchRunRepository.save(searchRun);
        }catch (Exception e){
            searchRun.setStatus(SearchStatus.FAILED);
            searchRun.setFinishedAt(LocalDateTime.now());
            throw e;
        }
    }
    @Transactional
    @Override
    public List<Resource> findResources(Long searchRunId) {
//        throw new UnsupportedOperationException("TODO(student): Implement SearchRunService.findResources().");
        return resourceRepository.findAllBySearchRunId(searchRunId);
    }
}
