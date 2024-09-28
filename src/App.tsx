import React from 'react';
import { Api, Group, MatchResponse, Tournament, Team, Round, Facility } from './Api';
import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import TeamItem from './Team';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { parse, format } from 'date-fns';

function App() {

  const [matches, setMatches] = React.useState<MatchResponse>({ data: [], included: [] });

  const loadMatches = async () => {
    const matches = await Api.getNextMatches();
    setMatches(matches);
  }

  React.useEffect(() => {
    loadMatches();
  }, [])

  const tournamentName = (roundId?: string | null) => {
    if (!roundId) return '';

    const round = matches.included.find(({ type, id }) => type === 'round' && id === roundId) as Round;
    if (!round) return '';

    const group = matches.included.find(({ type, id }) => type === 'group' && id === round.relationships.group.data.id) as Group;
    if (!group) return '';

    const tournament = matches.included.find(({ type, id }) => type === 'tournament' && id === group.relationships.tournament.data.id) as Tournament;
    if (!tournament) return '';

    return tournament.attributes.name;
  }

  const team = (teamId: string) => {
    return matches.included.find(({ type, id }) => type === 'team' && id === teamId) as Team;
  }

  const roundName = (roundId?: string | null) => {
    if (!roundId) return '';

    const round = matches.included.find(({ type, id }) => type === 'round' && id === roundId) as Round;
    if (!round) return '';

    return round.attributes.name;
  }

  const facilityName = (facilityId?: string | null) => {
    if (!facilityId) return '';

    const facility = matches.included.find(({ type, id }) => type === 'facility' && id === facilityId) as Facility;
    if (!facility) return '';

    return facility.attributes.name;
  }

  const parseDate = (date: string | null): { day: string, hour: string } => {
    if (!date) return { day: '', hour: '' };

    const parsedDate = parse(`${date} Z`, 'yyyy-MM-dd HH:mm:ss X', new Date());
    if (!parsedDate) return { day: '', hour: '' };

    return {
      day: format(parsedDate, 'dd/MM'),
      hour: format(parsedDate, 'HH:mm'),
    }
  };

  return (
    <div>
      {
        matches.data.map(({ id, meta, attributes, relationships: { round, facility } }) => {
          const roundText = roundName(round.data?.id);
          const tournament = tournamentName(round.data?.id);
          const facilityText = facilityName(facility.data?.id);

          const homeTeam = meta.home_team ? team(meta.home_team) : undefined
          const awayTeam = meta.away_team ? team(meta.away_team) : undefined

          const { day, hour } = parseDate(attributes.date);

          return (
            <Grid container spacing={2} border={1} mb={2}>
              <Grid size={12}>
                <Typography textAlign={'center'} fontWeight={'bold'}>
                  {tournament}
                </Typography>
              </Grid>
              <Grid size={4}>
                <TeamItem team={homeTeam} />
              </Grid>
              <Grid size={4} spacing={1}>
                <Stack height={'100%'} textAlign={'center'} alignItems={'center'}>
                  <Typography sx={{ '&::first-letter': { textTransform: 'uppercase' } }}>{day}</Typography>
                  <Typography fontSize={28} fontWeight={700}>{hour}</Typography>
                  <Typography sx={{ userSelect: 'none' }}>{roundText}</Typography>
                </Stack>
              </Grid>
              <Grid size={4}>
                <TeamItem team={awayTeam} />
              </Grid>
              <Grid size={12}>
                <Stack direction='row' px={2} mt={2} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography display={'flex'} alignItems={'center'}>
                    <LocationOnIcon sx={{ mr: 1, fontSize: 14 }} />
                    {facilityText}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          )
        })
      }
    </div>
  );
}

export default App;
