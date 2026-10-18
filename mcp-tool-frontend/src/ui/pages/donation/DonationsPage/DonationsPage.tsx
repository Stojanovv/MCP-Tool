import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';

import useDonations from '../../../../hooks/useDonations.ts';
import DonationBatchCard from '../../../components/donation/DonationBatchCard/DonationBatchCard.tsx';
import SubmitDonationDialog from '../../../components/donation/SubmitDonationDialog/SubmitDonationDialog.tsx';

/**
 * The donation dashboard towards doniraj.vezilka.ai.
 * TODO(student): Implement useDonations, DonationBatchCard and
 * SubmitDonationDialog, plus overall donation statistics.
 */
const DonationsPage = () => {
  const {
    donations,
    loading,
    error,
    actionLoading,
    onCreate,
    onApprove,
    onSubmit
  } = useDonations();

  const [newBatchDialogOpen, setNewBatchDialogOpen] = useState(false);

  const totalBatches = donations.length;

  const totalResources = donations.reduce(
      (total, batch) => total + batch.resourceCount,
      0
  );

  const submittedBatches = donations.filter(
      (batch) =>
          batch.status === 'SUBMITTED' ||
          batch.status === 'ACCEPTED'
  ).length;

  const acceptedBatches = donations.filter(
      (batch) => batch.status === 'ACCEPTED'
  ).length;

  const statistics = [
    { title: 'Total Batches', value: totalBatches },
    { title: 'Resources in Batches', value: totalResources },
    { title: 'Submitted Batches', value: submittedBatches },
    { title: 'Accepted Batches', value: acceptedBatches }
  ];

  return (
      <Box>
        <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              gap: 2
            }}
        >
          <Typography variant="h5">Donations</Typography>

          <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewBatchDialogOpen(true)}
          >
            New Batch
          </Button>
        </Box>

        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
        )}

        {!loading && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {statistics.map((stat) => (
                  <Grid key={stat.title} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ height: '100%' }}>
                      <CardContent>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                        >
                          {stat.title}
                        </Typography>

                        <Typography variant="h4" fontWeight="bold">
                          {stat.value}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
              ))}
            </Grid>
        )}

        {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
        ) : (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Donation Batches
              </Typography>

              {donations.length === 0 && (
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    No donation batches yet. Create a batch to get started.
                  </Typography>
              )}

              <Grid container spacing={2}>
                {donations.map((batch) => (
                    <Grid key={batch.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <DonationBatchCard
                          batch={batch}
                          onApprove={onApprove}
                          onSubmit={onSubmit}
                          actionLoading={actionLoading}
                      />
                    </Grid>
                ))}
              </Grid>
            </>
        )}

        <SubmitDonationDialog
            open={newBatchDialogOpen}
            onClose={() => setNewBatchDialogOpen(false)}
            onCreate={onCreate}
            actionLoading={actionLoading}
        />
      </Box>
  );
};

export default DonationsPage;