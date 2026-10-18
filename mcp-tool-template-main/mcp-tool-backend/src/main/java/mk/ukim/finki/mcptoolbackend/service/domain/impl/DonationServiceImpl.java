package mk.ukim.finki.mcptoolbackend.service.domain.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import mk.ukim.finki.mcptoolbackend.integration.vezilka.DonationReceipt;
import mk.ukim.finki.mcptoolbackend.integration.vezilka.TextDonationRequest;
import mk.ukim.finki.mcptoolbackend.integration.vezilka.VezilkaClient;
import mk.ukim.finki.mcptoolbackend.model.domain.DonationBatch;
import mk.ukim.finki.mcptoolbackend.model.domain.Resource;
import mk.ukim.finki.mcptoolbackend.model.enums.DonationStatus;
import mk.ukim.finki.mcptoolbackend.model.exception.InvalidDonationStateException;
import mk.ukim.finki.mcptoolbackend.repository.DonationBatchRepository;
import mk.ukim.finki.mcptoolbackend.repository.ResourceRepository;
import mk.ukim.finki.mcptoolbackend.service.domain.DonationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * TODO(student): Implement this service.
 *
 * <p>Enforce the DRAFT -> APPROVED -> SUBMITTED lifecycle (throw
 * {@code InvalidDonationStateException} on illegal transitions), and on
 * {@code submit} build a {@code TextDonationRequest} per resource and call
 * {@link VezilkaClient}. Store the returned reference on the batch.</p>
 */
@Service
public class DonationServiceImpl implements DonationService {
    private final DonationBatchRepository donationBatchRepository;
    private final ResourceRepository resourceRepository;
    private final VezilkaClient vezilkaClient;

    public DonationServiceImpl(DonationBatchRepository donationBatchRepository,
                               ResourceRepository resourceRepository,
                               VezilkaClient vezilkaClient) {
        this.donationBatchRepository = donationBatchRepository;
        this.resourceRepository = resourceRepository;
        this.vezilkaClient = vezilkaClient;
    }

    @Override
    public List<DonationBatch> findAll() {
//        throw new UnsupportedOperationException("TODO(student): Implement DonationService.findAll().");
        return donationBatchRepository.findAll();
    }

    @Override
    public Optional<DonationBatch> findById(Long id) {
//        throw new UnsupportedOperationException("TODO(student): Implement DonationService.findById().");
        return donationBatchRepository.findById(id);
    }

    @Override
    @Transactional
    public DonationBatch create(List<Long> resourceIds) {
//        throw new UnsupportedOperationException("TODO(student): Implement DonationService.create().");
        if (resourceIds==null || resourceIds.isEmpty()){
            throw new IllegalArgumentException("At least one resouce is required.");
        }
        List<Resource> resources = resourceRepository.findAllByIdIn(resourceIds);

        if (resources.size()!=resourceIds.size()){
            throw new IllegalArgumentException("One or more resources were not found.");
        }

        DonationBatch batch=new DonationBatch(DonationStatus.DRAFT);
        for (Resource r : resources){
            r.setDonationBatch(batch);
        }

        batch.setResources(resources);

        return donationBatchRepository.save(batch);
    }

    @Override
    @Transactional
    public DonationBatch approve(Long id) {
//        throw new UnsupportedOperationException("TODO(student): Implement DonationService.approve().");
        DonationBatch batch = donationBatchRepository.findById(id).orElseThrow(()->new IllegalArgumentException("Donation batch not found: "+id));

        if (batch.getStatus() != DonationStatus.DRAFT){
            throw new InvalidDonationStateException(id,batch.getStatus());
        }

        batch.setStatus(DonationStatus.APPROVED);

        return donationBatchRepository.save(batch);
    }

    @Override
    @Transactional
    public DonationBatch submit(Long id) {
//        throw new UnsupportedOperationException("TODO(student): Implement DonationService.submit().");
        DonationBatch batch = donationBatchRepository.findById(id).orElseThrow(()->new IllegalArgumentException("Donation batch not found: "+id));

        if (batch.getStatus()!=DonationStatus.APPROVED){
            throw new InvalidDonationStateException(id,batch.getStatus());
        }

        for (Resource r : batch.getResources()){
            TextDonationRequest request=new TextDonationRequest(
                    r.getTitle(),
                    r.getContent(),
                    r.getSourceUrl()
            );

            DonationReceipt receipt = vezilkaClient.submitTextDonation(request);

            batch.setVezilkaReference(receipt.reference());
            batch.setSubmittedAt(LocalDateTime.now());
        }

        batch.setStatus(DonationStatus.SUBMITTED);
        return donationBatchRepository.save(batch);
    }

    @Override
    @Transactional
    public void refreshSubmittedStatuses() {
//        throw new UnsupportedOperationException("TODO(student): Implement DonationService.refreshSubmittedStatuses().");
        List<DonationBatch>submittedBatches=donationBatchRepository.findAllByStatus(DonationStatus.SUBMITTED);

        for (DonationBatch batch : submittedBatches){
            String ref = batch.getVezilkaReference();

            if (ref==null || ref.isBlank()){
                continue;
            }
            DonationStatus status = vezilkaClient.checkStatus(ref);

            if (status!=null){
                batch.setStatus(status);
                donationBatchRepository.save(batch);
            }
        }
    }
}
