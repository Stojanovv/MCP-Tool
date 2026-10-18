
// /**
//  * TODO(student): Show the resource: title, content preview, source link, the
//  * Macedonian-language confidence, whether it has been analyzed, and whether it
//  * is already part of a donation batch. Add navigation to /resources/{id}, an
//  * analyze action and a delete action (useResources().onAnalyze / onDelete).
//  */

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography
} from '@mui/material';
import { Link } from 'react-router';
import type { ResourceResponse } from '../../../../api/types/resource.ts';
import useResources from '../../../../hooks/useResources.ts';

interface ResourceCardProps {
  resource: ResourceResponse;
}

/**
 * Shows a resource with its main information and actions.
 */
const ResourceCard = ({ resource }: ResourceCardProps) => {
  const { onAnalyze, onDelete } = useResources({}, 0, 12, false);
  const confidence = resource.macedonianConfidence ?? 0;
  const contentPreview = resource.content
    ? resource.content.slice(0, 200)
    : 'No content available.';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant='subtitle2' sx={{ mb: 1 }}>
          {resource.title ?? `Resource #${resource.id}`}
        </Typography>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          {contentPreview}
          {resource.content && resource.content.length > 200 ? '...' : ''}
        </Typography>

        <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
          <Chip
            size='small'
            label={`Macedonian: ${Math.round(confidence * 100)}%`}
          />

          <Chip
            size='small'
            label={resource.analysis ? 'Analyzed' : 'Not analyzed'}
          />

          <Chip
            size='small'
            label={resource.donationBatchId ? 'Donated' : 'Not donated'}
          />
        </Stack>

        {resource.sourceUrl && (
          <Button
            component='a'
            href={resource.sourceUrl}
            target='_blank'
            rel='noopener noreferrer'
            size='small'
            sx={{ mt: 2 }}
          >
            Source
          </Button>
        )}
      </CardContent>

      <CardActions>
        <Button
          component={Link}
          to={`/resources/${resource.id}`}
          size='small'
        >
          Details
        </Button>

        <Button
          size='small'
          onClick={() => void onAnalyze(resource.id)}
          disabled={resource.analysis !== null}
        >
          Analyze
        </Button>

        <Button
          size='small'
          color='error'
          onClick={() => void onDelete(resource.id)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default ResourceCard;
