import { Grid } from '@mui/material';
import type { ResourceResponse } from '../../../../api/types/resource.ts';
import ResourceCard from '../ResourceCard/ResourceCard.tsx';

interface ResourceGridProps {
  resources: ResourceResponse[];
}

const ResourceGrid = ({ resources }: ResourceGridProps) => {
  return (
    <Grid container spacing={2}>
      {resources.map((resource) => (
        <Grid key={resource.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <ResourceCard resource={resource}/>
        </Grid>
      ))}
    </Grid>
  );
};

export default ResourceGrid;
