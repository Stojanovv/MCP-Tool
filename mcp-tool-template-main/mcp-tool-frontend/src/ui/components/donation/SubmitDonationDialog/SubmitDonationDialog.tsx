import {
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    List,
    ListItem,
    ListItemText,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';

import resourceApi from '../../../../api/resourceApi.ts';
import type { ResourceResponse } from '../../../../api/types/resource.ts';
import type { CreateDonationBatchRequest } from '../../../../api/types/donation.ts';

interface SubmitDonationDialogProps {
    open: boolean;
    onClose: () => void;
    onCreate: (data: CreateDonationBatchRequest) => Promise<boolean>;
    actionLoading?: boolean;
}

/**
 * TODO(student): Implement the "create donation batch" flow: let the user pick
 * not-yet-donated resources (resourceApi.findAll with donated=false), review
 * their content, and create the batch via useDonations().onCreate.
 */
const SubmitDonationDialog = ({
                                  open,
                                  onClose,
                                  onCreate,
                                  actionLoading = false
                              }: SubmitDonationDialogProps) => {
    const [resources, setResources] = useState<ResourceResponse[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        const loadResources = async () => {
            try {
                setLoading(true);
                setError(null);
                setSelectedIds([]);

                const response = await resourceApi.findAll(
                    { donated: false },
                    0,
                    100
                );

                if (!cancelled) {
                    setResources(response.data.content);
                }
            } catch (err) {
                console.error('Failed to load available resources:', err);

                if (!cancelled) {
                    setError('Не може да се вчитаат достапните ресурси.');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void loadResources();

        return () => {
            cancelled = true;
        };
    }, [open]);

    const toggleResource = (id: number) => {
        setSelectedIds((current) =>
            current.includes(id)
                ? current.filter((selectedId) => selectedId !== id)
                : [...current, id]
        );
    };

    const handleCreate = async () => {
        if (selectedIds.length === 0) return;

        const success = await onCreate({ resourceIds: selectedIds });

        if (success) {
            setSelectedIds([]);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={actionLoading ? undefined : onClose} fullWidth maxWidth="md">
            <DialogTitle>New Donation Batch</DialogTitle>

            <DialogContent dividers>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Избери ги ресурсите што сакаш да ги вклучиш во пакетот за донирање.
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : resources.length === 0 && !error ? (
                    <Alert severity="info">
                        Нема достапни ресурси за донирање.
                    </Alert>
                ) : (
                    <>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Избрани ресурси: {selectedIds.length}
                        </Typography>

                        <Divider />

                        <List disablePadding>
                            {resources.map((resource) => (
                                <ListItem
                                    key={resource.id}
                                    divider
                                    disableGutters
                                    secondaryAction={
                                        <Checkbox
                                            edge="end"
                                            checked={selectedIds.includes(resource.id)}
                                            onChange={() => toggleResource(resource.id)}
                                            disabled={actionLoading}
                                            inputProps={{
                                                'aria-label': `Избери ${resource.title ?? `ресурс ${resource.id}`}`
                                            }}
                                        />
                                    }
                                >
                                    <ListItemText
                                        sx={{ pr: 5, py: 1 }}
                                        primary={resource.title || `Ресурс #${resource.id}`}
                                        secondary={
                                            <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                                                {resource.sourceUrl && (
                                                    <Typography
                                                        component="a"
                                                        href={resource.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        variant="body2"
                                                        sx={{ display: 'block', mb: 0.5, overflowWrap: 'anywhere' }}
                                                    >
                                                        {resource.sourceUrl}
                                                    </Typography>
                                                )}

                                                <Typography
                                                    component="span"
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        overflowWrap: 'anywhere',
                                                        whiteSpace: 'pre-line'
                                                    }}
                                                >
                                                    {resource.content
                                                        ? `${resource.content.slice(0, 250)}${resource.content.length > 250 ? '…' : ''}`
                                                        : 'Нема достапна содржина.'}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>

                        {resources.length === 100 && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Прикажани се првите 100 ресурси. Ако ти требаат повеќе, ќе треба да додадеме страницирање.
                            </Alert>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={actionLoading}>
                    Откажи
                </Button>

                <Button
                    variant="contained"
                    onClick={() => void handleCreate()}
                    disabled={
                        loading ||
                        actionLoading ||
                        selectedIds.length === 0 ||
                        resources.length === 0
                    }
                >
                    {actionLoading ? (
                        <CircularProgress size={22} color="inherit" />
                    ) : (
                        `Креирај пакет (${selectedIds.length})`
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SubmitDonationDialog;