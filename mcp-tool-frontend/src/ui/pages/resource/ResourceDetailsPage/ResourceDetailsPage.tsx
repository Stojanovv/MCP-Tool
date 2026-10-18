import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Stack,
    Typography
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import resourceApi from '../../../../api/resourceApi.ts';
import type { ResourceResponse } from '../../../../api/types/resource.ts';
import ResourceAnalysisPanel from '../../../components/resource/ResourceAnalysisPanel/ResourceAnalysisPanel.tsx';
/**
 * TODO(student): Show one resource in full: the complete content, the source
 * link, the language confidence, the donation status, and its analysis
 * (resourceApi.findById + the ResourceAnalysisPanel). Add an "Analyze" button
 * that calls resourceApi.analyze.
 */
const ResourceDetailsPage = () => {
    const { id } = useParams<{ id: string }>();

    const [resource, setResource] = useState<ResourceResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadResource = useCallback(async () => {
        if (!id) {
            setError('Resource ID is missing.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await resourceApi.findById(id);
            setResource(response.data);
        } catch (err) {
            console.error('Failed to load resource:', err);
            setError('Failed to load resource.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void loadResource();
    }, [loadResource]);

    const handleAnalyze = async () => {
        if (!id) return;

        try {
            setAnalyzing(true);
            setError(null);

            await resourceApi.analyze(id);
            await loadResource();

            window.dispatchEvent(new Event('resources-changed'));
        } catch (err) {
            console.error('Failed to analyze resource:', err);
            setError('Failed to analyze resource.');
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!resource) {
        return (
            <Box>
                <Alert severity='error' sx={{ mb: 2 }}>
                    {error ?? 'Resource not found.'}
                </Alert>

                <Button component={Link} to='/resources'>
                    Back to Resources
                </Button>
            </Box>
        );
    }

    const confidence = resource.macedonianConfidence;

    return (
        <Box>
            <Button component={Link} to='/resources' sx={{ mb: 2 }}>
                Back to Resources
            </Button>

            <Typography variant='h5' gutterBottom>
                {resource.title ?? `Resource #${resource.id}`}
            </Typography>

            {error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Stack
                direction='row'
                spacing={1}
                flexWrap='wrap'
                useFlexGap
                sx={{ mb: 3 }}
            >
                <Chip
                    label={`Macedonian: ${
                        confidence == null ? 'N/A' : `${Math.round(confidence * 100)}%`
                    }`}
                />

                <Chip label={resource.analysis ? 'Analyzed' : 'Not analyzed'} />

                <Chip
                    label={
                        resource.donationBatchId != null ? 'Donated' : 'Not donated'
                    }
                />
            </Stack>

            <Typography variant='h6' gutterBottom>
                Content
            </Typography>

            <Typography
                sx={{
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                    mb: 2
                }}
            >
                {resource.content ?? 'No content available.'}
            </Typography>

            {resource.sourceUrl && (
                <Button
                    component='a'
                    href={resource.sourceUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    sx={{ mb: 3 }}
                >
                    Open Source
                </Button>
            )}

            <Box sx={{ mb: 4 }}>
                <Button
                    variant='contained'
                    onClick={() => void handleAnalyze()}
                    disabled={analyzing}
                >
                    {analyzing ? 'Analyzing...' : 'Analyze Resource'}
                </Button>
            </Box>

            <Typography variant='h6' gutterBottom>
                Resource Analysis
            </Typography>

            {resource.analysis ? (
                <ResourceAnalysisPanel analysis={resource.analysis} />
            ) : (
                <Alert severity='info' sx={{ mb: 2 }}>
                    This resource has not been analyzed yet. Click Analyze Resource
                    to generate its analysis.
                </Alert>
            )}
        </Box>
    );
};

export default ResourceDetailsPage;