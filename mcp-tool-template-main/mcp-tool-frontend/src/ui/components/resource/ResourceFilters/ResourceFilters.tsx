import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Slider,
    TextField,
    Typography
} from '@mui/material';
import type { ResourceFilter } from '../../../../api/types/resource.ts';
import useSearchRuns from '../../../../hooks/useSearchRuns.ts';

interface ResourceFiltersProps {
    filter: ResourceFilter;
    onChange: (filter: ResourceFilter) => void;
}

/**
 * TODO(student): Implement the filter bar for the resource browser: search run,
 * minimum Macedonian confidence (slider), analyzed yes/no, donated yes/no, and
 * a free-text search over the content. Call onChange with the updated filter.
 */
const ResourceFilters = ({ filter, onChange }: ResourceFiltersProps) => {
    const { searchRuns } = useSearchRuns();

    const updateFilter = (changes: Partial<ResourceFilter>) => {
        onChange({
            ...filter,
            ...changes
        });
    };

    const clearFilters = () => {
        onChange({});
    };

    return (
        <Box sx={{ mb: 3 }}>
            <Box
                sx={{
                    display: 'flex',
                    gap: 2,
                    flexWrap: 'wrap',
                    alignItems: 'center'
                }}
            >
                <FormControl sx={{ minWidth: 220 }}>
                    <InputLabel id='search-run-label'>Search Run</InputLabel>
                    <Select
                        labelId='search-run-label'
                        value={filter.searchRunId ?? ''}
                        label='Search Run'
                        onChange={(event) => {
                            const value = event.target.value;
                            updateFilter({
                                searchRunId: value.toString() === '' ? undefined : Number(value)
                            });
                        }}
                    >
                        <MenuItem value=''>All Search Runs</MenuItem>

                        {searchRuns.map((searchRun) => (
                            <MenuItem key={searchRun.id} value={searchRun.id}>
                                #{searchRun.id} - {searchRun.query}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box sx={{ width: 220 }}>
                    <Typography gutterBottom>
                        Macedonian confidence: {Math.round((filter.minMacedonianConfidence ?? 0) * 100)}%
                    </Typography>

                    <Slider
                        value={filter.minMacedonianConfidence ?? 0}
                        min={0}
                        max={1}
                        step={0.05}
                        onChange={(_, value) => {
                            updateFilter({
                                minMacedonianConfidence: value as number
                            });
                        }}
                    />
                </Box>

                <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel id='analyzed-label'>Analyzed</InputLabel>
                    <Select
                        labelId='analyzed-label'
                        value={filter.analyzed === undefined ? '' : String(filter.analyzed)}
                        label='Analyzed'
                        onChange={(event) => {
                            const value = event.target.value;

                            updateFilter({
                                analyzed: value === '' ? undefined : value === 'true'
                            });
                        }}
                    >
                        <MenuItem value=''>All</MenuItem>
                        <MenuItem value='true'>Yes</MenuItem>
                        <MenuItem value='false'>No</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel id='donated-label'>Donated</InputLabel>
                    <Select
                        labelId='donated-label'
                        value={filter.donated === undefined ? '' : String(filter.donated)}
                        label='Donated'
                        onChange={(event) => {
                            const value = event.target.value;

                            updateFilter({
                                donated: value === '' ? undefined : value === 'true'
                            });
                        }}
                    >
                        <MenuItem value=''>All</MenuItem>
                        <MenuItem value='true'>Yes</MenuItem>
                        <MenuItem value='false'>No</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label='Search content'
                    value={filter.search ?? ''}
                    onChange={(event) => {
                        updateFilter({
                            search: event.target.value || undefined
                        });
                    }}
                />

                <Button variant='outlined' onClick={clearFilters}>
                    Clear
                </Button>
            </Box>
        </Box>
    );
};

export default ResourceFilters;
