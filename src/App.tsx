import React from 'react';
import { Api, Group, MatchResponse, Tournament, Team, Round, Facility, Category, categories, Club } from './Api';
import { Box, FormControl, MenuItem, Select, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import TeamItem from './Team';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { parse, format } from 'date-fns';


function App() {

  const [loading, setLoading] = React.useState<boolean>(false);
  const [club, setClub] = React.useState<string>('');
  const [category, setCategory] = React.useState<string>('');
  const [matches, setMatches] = React.useState<MatchResponse>({ data: [], included: [] });
  const [clubs, setClubs] = React.useState<Club[]>([])

  React.useEffect(() => {
    loadClubs();
  }, [])

  React.useEffect(() => {
    loadMatches(category, club);
  }, [category, club])

  const loadMatches = async (category: string, club: string) => {
    setLoading(true);
    const matches = await Api.getNextMatches(category, club);
    setLoading(false);
    setMatches(matches);
  }

  const loadClubs = async () => {
    const clubs = await Api.getClubs();
    setClubs(clubs);
  }

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

  const categoryName = (roundId?: string | null) => {
    if (!roundId) return '';

    const round = matches.included.find(({ type, id }) => type === 'round' && id === roundId) as Round;
    if (!round) return '';

    const group = matches.included.find(({ type, id }) => type === 'group' && id === round.relationships.group.data.id) as Group;
    if (!group) return '';

    const tournament = matches.included.find(({ type, id }) => type === 'tournament' && id === group.relationships.tournament.data.id) as Tournament;
    if (!tournament) return '';

    const category = matches.included.find(({ type, id }) => type === 'category' && id === tournament.relationships.category.data?.id) as Category;
    if (!category) return '';

    return category.attributes.name;
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
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ width: '200px' }}>
          <Select value={category} displayEmpty onChange={(e) => setCategory(e.target.value)}>
            <MenuItem key={'0'} value={''}>Totes les categories</MenuItem>
            {categories.map(({ id, name }) => <MenuItem key={id} value={id}>{name}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl sx={{ flexGrow: 1 }}>
          <Select value={club} displayEmpty onChange={(e) => setClub(e.target.value)}>
            <MenuItem key={'0'} value={''}>Tots els clubs</MenuItem>
            {clubs.map(({ id, attributes: { name } }) => <MenuItem key={id} value={id}>{name}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {
        loading && <Typography>Loading...</Typography>
      }

      {
        !loading && matches.data.length === 0 && <Typography>
          No hi ha dades de <strong>
          "{category ? categories.find(c => c.id === category)?.name : 'Totes les categories'}"
          </strong> per al club <strong>"{club ? clubs.find(c => c.id === club)?.attributes.name : 'Tots els clubs'}"</strong>
        </Typography>
      }


      {
        !loading && matches.data.map(({ id, meta, attributes, relationships: { round, facility } }) => {
          const roundText = roundName(round.data?.id);

          const tournament = tournamentName(round.data?.id);
          const facilityText = facilityName(facility.data?.id);
          const categoryText = categoryName(round.data?.id)

          const homeTeam = meta.home_team ? team(meta.home_team) : undefined
          const awayTeam = meta.away_team ? team(meta.away_team) : undefined

          const { day, hour } = parseDate(attributes.date);

          return (
            <Grid key={id} container spacing={2} border={1} mb={2}>
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
                  <Typography>{day}</Typography>
                  <Typography fontSize={28} fontWeight={700}>{hour}</Typography>
                  <Typography>{roundText}</Typography>
                  <Typography>{categoryText}</Typography>
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
