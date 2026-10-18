import { Box, CircularProgress, Pagination, Typography } from '@mui/material';
import { useState } from 'react';
import type { ResourceFilter } from '../../../../api/types/resource.ts';
import useResources from '../../../../hooks/useResources.ts';
import ResourceFilters from '../../../components/resource/ResourceFilters/ResourceFilters.tsx';
import ResourceGrid from '../../../components/resource/ResourceGrid/ResourceGrid.tsx';

/**
 * The collected-resource browser.
 * TODO(student): Implement useResources, ResourceFilters and ResourceCard, and
 * add pagination controls (the backend endpoint is already paged).
 */
const ResourcesPage = () => {
    const [filter, setFilter] = useState<ResourceFilter>({});
    const [page, setPage] = useState<number>(0);

    const { resources, loading } = useResources(filter, page, 12);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value - 1);
    };

    return (
        <Box>
            <Typography variant='h5' sx={{ mb: 2 }}>Resources</Typography>

            <ResourceFilters
                filter={filter}
                onChange={(newFilter) => {
                    setFilter(newFilter);
                    setPage(0);
                }}
            />

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress/>
                </Box>
            )}

            {!loading && (!resources || resources.content.length === 0) && (
                <Typography color='text.secondary'>
                    No resources yet. Run a search first.
                </Typography>
            )}

            {!loading && resources && (
                <>
                    <ResourceGrid resources={resources.content}/>

                    {resources.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination
                                count={resources.totalPages}
                                page={resources.number + 1}
                                onChange={handlePageChange}
                                color='primary'
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default ResourcesPage;