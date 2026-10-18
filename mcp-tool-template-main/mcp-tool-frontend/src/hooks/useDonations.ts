import { useCallback, useEffect, useState  } from 'react';
import type { CreateDonationBatchRequest, DonationBatchResponse } from '../api/types/donation.ts';
import donationApi from "../api/donationApi.ts";
/**
 * TODO(student): Drive the donation workflow for the DonationsPage: list the
 * batches (donationApi.findAll) and expose create/approve/submit actions,
 * re-fetching after every mutation, with loading/error state. Mirror the
 * searchRunsProvider pattern.
 */
const useDonations = () => {
  const [donations,setDonations] = useState<DonationBatchResponse[]>([]);
  const [loading,setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await donationApi.findAll();
      setDonations(response.data);
    } catch (err) {
      console.error('Failed to load donations:', err);
      setError('Failed to load donation batches.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDonations();
  }, [loadDonations]);

  const onCreate = async (data: CreateDonationBatchRequest) => {
    try {
      setActionLoading(true);
      setError(null);

      await donationApi.add(data);
      await loadDonations();

      return true;
    } catch (err) {
      console.error('Failed to create donation batch:', err);
      setError('Failed to create donation batch.');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const onApprove = async (id: number) => {
    try {
      setActionLoading(true);
      setError(null);

      await donationApi.approve(id.toString());
      await loadDonations();

      return true;
    } catch (err) {
      console.error('Failed to approve donation batch:', err);
      setError('Failed to approve donation batch.');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const onSubmit = async (id: number) => {
    try {
      setActionLoading(true);
      setError(null);

      await donationApi.submit(id.toString());
      await loadDonations();

      return true;
    } catch (err) {
      console.error('Failed to submit donation batch:', err);
      setError('Failed to submit donation batch.');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    donations,
    loading,
    error,
    actionLoading,
    loadDonations,
    onCreate,
    onApprove,
    onSubmit
  };
};

export default useDonations;