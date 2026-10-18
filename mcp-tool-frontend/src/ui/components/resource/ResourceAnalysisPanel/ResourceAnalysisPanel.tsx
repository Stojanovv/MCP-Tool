import {
    Alert,
    Box,
    Chip,
    Divider,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import type { ResourceAnalysisResponse } from '../../../../api/types/resource.ts';

interface ResourceAnalysisPanelProps {
    analysis: ResourceAnalysisResponse | null;
}

/**
 * TODO(student): Render the analysis of a resource: the summary, the keywords,
 * the sentence/word counts and the Macedonian-language confidence. Show a
 * call-to-action to run the analysis when it is still null.
 */
const ResourceAnalysisPanel = ({
                                   analysis
                               }: ResourceAnalysisPanelProps) => {
    if (!analysis) {
        return (
            <Alert severity='info'>
                Ресурсот сè уште нема анализа. Кликни на „Analyze Resource“
                за да ја започнеш анализата.
            </Alert>
        );
    }

    const confidence = analysis.macedonianConfidence;
    const keywords = analysis.keywords
        ? analysis.keywords
            .split(/[,;\n]/)
            .map((keyword) => keyword.trim())
            .filter(Boolean)
        : [];

    const analyzedAt = analysis.analyzedAt
        ? new Date(analysis.analyzedAt).toLocaleString('mk-MK')
        : null;

    return (
        <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
            <Stack spacing={3}>
                <Box>
                    <Typography variant='h6' gutterBottom>
                        Резиме
                    </Typography>

                    <Typography
                        color={analysis.summary ? 'text.primary' : 'text.secondary'}
                        sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                    >
                        {analysis.summary || 'Нема достапно резиме.'}
                    </Typography>
                </Box>

                <Divider />

                <Box>
                    <Typography variant='h6' gutterBottom>
                        Клучни зборови
                    </Typography>

                    {keywords.length > 0 ? (
                        <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
                            {keywords.map((keyword, index) => (
                                <Chip key={`${keyword}-${index}`} label={keyword} />
                            ))}
                        </Stack>
                    ) : (
                        <Typography color='text.secondary'>
                            Нема достапни клучни зборови.
                        </Typography>
                    )}
                </Box>

                <Divider />

                <Box>
                    <Typography variant='h6' gutterBottom>
                        Статистика од анализата
                    </Typography>

                    <Stack direction='row' spacing={2} useFlexGap flexWrap='wrap'>
                        <Paper variant='outlined' sx={{ p: 2, minWidth: 130 }}>
                            <Typography color='text.secondary' variant='body2'>
                                Број на реченици
                            </Typography>
                            <Typography variant='h5'>
                                {analysis.sentenceCount ?? '—'}
                            </Typography>
                        </Paper>

                        <Paper variant='outlined' sx={{ p: 2, minWidth: 130 }}>
                            <Typography color='text.secondary' variant='body2'>
                                Македонски јазик
                            </Typography>
                            <Typography variant='h5'>
                                {confidence == null
                                    ? '—'
                                    : `${Math.round(confidence * 100)}%`}
                            </Typography>
                        </Paper>
                    </Stack>
                </Box>

                {analyzedAt && (
                    <>
                        <Divider />
                        <Typography variant='body2' color='text.secondary'>
                            Анализирано на: {analyzedAt}
                        </Typography>
                    </>
                )}
            </Stack>
        </Paper>
    );
};

export default ResourceAnalysisPanel;