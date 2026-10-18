import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import type { DonationBatchResponse } from '../../../../api/types/donation.ts';

interface DonationBatchCardProps {
  batch: DonationBatchResponse;
  onApprove: (id: number) => Promise<boolean>;
  onSubmit: (id: number) => Promise<boolean>;
  actionLoading?: boolean;
}


/**
 * TODO(student): Show the batch: number of resources, status, the Vezilka
 * reference once submitted, and approve/submit actions
 * (useDonations().onApprove / onSubmit) enabled according to the status.
 */
const statusColor = (
    status: DonationBatchResponse['status']
): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'DRAFT':
      return 'default';
    case 'APPROVED':
      return 'primary';
    case 'SUBMITTED':
      return 'warning';
    case 'ACCEPTED':
      return 'success';
    case 'REJECTED':
    case 'FAILED':
      return 'error';
    default:
      return 'default';
  }
};

const DonationBatchCard = ({
                             batch,
                             onApprove,
                             onSubmit,
                             actionLoading = false
                           }: DonationBatchCardProps) => {
  const handleApprove = async () => {
    await onApprove(batch.id);
  };

  const handleSubmit = async () => {
    await onSubmit(batch.id);
  };

  return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1
                }}
            >
              <Typography variant="h6">
                Batch #{batch.id}
              </Typography>

              <Chip
                  label={batch.status}
                  color={statusColor(batch.status)}
                  size="small"
              />
            </Box>

            <Divider />

            <Typography variant="body2">
              <strong>Resources:</strong> {batch.resourceCount}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              <strong>Created:</strong>{' '}
              {batch.createdAt
                  ? new Date(batch.createdAt).toLocaleString()
                  : 'N/A'}
            </Typography>

            {batch.submittedAt && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Submitted:</strong>{' '}
                  {new Date(batch.submittedAt).toLocaleString()}
                </Typography>
            )}

            {batch.vezilkaReference && (
                <Typography
                    variant="body2"
                    sx={{ overflowWrap: 'anywhere' }}
                >
                  <strong>Vezilka reference:</strong>{' '}
                  {batch.vezilkaReference}
                </Typography>
            )}

            {batch.resourceIds?.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Resource IDs:</strong>{' '}
                  {batch.resourceIds.join(', ')}
                </Typography>
            )}

            {batch.status === 'DRAFT' && (
                <Button
                    variant="contained"
                    fullWidth
                    disabled={actionLoading}
                    onClick={() => void handleApprove()}
                >
                  {actionLoading ? (
                      <CircularProgress size={22} color="inherit" />
                  ) : (
                      'Approve'
                  )}
                </Button>
            )}

            {batch.status === 'APPROVED' && (
                <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    disabled={actionLoading}
                    onClick={() => void handleSubmit()}
                >
                  {actionLoading ? (
                      <CircularProgress size={22} color="inherit" />
                  ) : (
                      'Submit to Vezilka'
                  )}
                </Button>
            )}

            {batch.status === 'SUBMITTED' && (
                <Typography variant="body2" color="text.secondary">
                  Пакетот е испратен и чека одговор.
                </Typography>
            )}

            {batch.status === 'ACCEPTED' && (
                <Typography variant="body2" color="success.main">
                  Пакетот е прифатен.
                </Typography>
            )}

            {(batch.status === 'REJECTED' || batch.status === 'FAILED') && (
                <Typography variant="body2" color="error.main">
                  Пакетот не е успешно обработен.
                </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
  );
};

export default DonationBatchCard;