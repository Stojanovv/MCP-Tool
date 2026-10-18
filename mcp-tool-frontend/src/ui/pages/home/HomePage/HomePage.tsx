import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography
} from '@mui/material';
import useStats from '../../../../hooks/useStats.ts';
/**
 * TODO(student): Turn this into a small dashboard using useStats (which calls
 * GET /api/stats — the same data as the `corpus_stats` MCP tool): total search
 * runs, resources, analyzed resources, donation batches and donated resources.
 */
const HomePage = () => {
  const { stats, loading, error } = useStats();

  const statCards = [
    {
      title: 'Search Runs',
      value: stats?.searchRuns,
      description: 'Total searches performed'
    },
    {
      title: 'Resources',
      value: stats?.resources,
      description: 'Total resources collected'
    },
    {
      title: 'Analyzed Resources',
      value: stats?.analyzedResources,
      description: 'Resources successfully analyzed'
    },
    {
      title: 'Donation Batches',
      value: stats?.donationBatches,
      description: 'Total donation batches'
    },
    {
      title: 'Donated Resources',
      value: stats?.donatedResources,
      description: 'Resources donated to Vezilka'
    }
  ];

  return (
      <Box sx={{ m: 0, p: 0 }}>
        <Container maxWidth='xl' sx={{ mt: 3, py: 3 }}>
          <Typography variant='h4' gutterBottom>
            MCP Tool for doniraj.vezilka.ai 🧵
          </Typography>

          <Typography variant='body1' sx={{ mb: 4 }}>
            This is an MCP (Model Context Protocol) server that searches and
            analyzes a specific Macedonian-language website and donates the
            results to the Vezilka language-preservation platform. Use the Search
            Runs page to collect resources, the Resources page to browse and
            analyze them, the Donations page to submit batches, and the MCP
            Playground to invoke the server's tools directly.
          </Typography>

          <Typography variant='h5' gutterBottom sx={{ mb: 3 }}>
            Corpus Dashboard
          </Typography>

          {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress />
              </Box>
          )}

          {error && (
              <Alert severity='error' sx={{ mb: 3 }}>
                {error}
              </Alert>
          )}

          {!loading && !error && stats && (
              <Grid container spacing={3}>
                {statCards.map((stat) => (
                    <Grid key={stat.title} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                      <Card
                          variant='outlined'
                          sx={{
                            height: '100%',
                            borderRadius: 2,
                            transition: '0.2s',
                            '&:hover': {
                              boxShadow: 3,
                              transform: 'translateY(-3px)'
                            }
                          }}
                      >
                        <CardContent>
                          <Typography
                              variant='body2'
                              color='text.secondary'
                              gutterBottom
                          >
                            {stat.title}
                          </Typography>

                          <Typography
                              variant='h4'
                              component='div'
                              sx={{ fontWeight: 700, my: 1 }}
                          >
                            {stat.value ?? 0}
                          </Typography>

                          <Typography variant='caption' color='text.secondary'>
                            {stat.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                ))}
              </Grid>
          )}

          {!loading && !error && !stats && (
              <Alert severity='info'>
                No dashboard statistics are available.
              </Alert>
          )}
        </Container>
      </Box>
  );
};

export default HomePage;