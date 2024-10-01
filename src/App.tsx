import React from 'react';
import { Api, Group, MatchResponse, Tournament, Team, Round, Facility, Category } from './Api';
import { AppBar, Box, Button, CircularProgress, FormControl, MenuItem, Modal, Select, Stack, Toolbar, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import TeamItem from './Team';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { parse, format } from 'date-fns';
import clubs from './data/clubs.json';
import categories from './data/categories.json';

const fcn = '314965';
const rfen = '210453';

function App() {
  const params = new URLSearchParams(window.location.search);


  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [selectedClub, setSelectedClub] = React.useState<string>(params.get('club') || '');
  const [selectedCategory, setSelectedCategory] = React.useState<string>(params.get('categoria') || '');

  const [matches, setMatches] = React.useState<MatchResponse>({ data: [], included: [] });

  const loadMatches = async () => {
    setLoading(true);

    console.log(selectedCategory, selectedClub)

    const allCategories = selectedCategory === ''
    const allClubs = selectedClub === ''

    const { fcnId: categoryFcnId, rfenId: categoryRfenId, gender } = categories.find(c => c.id === selectedCategory) || {}
    const { fcnId: clubFcnId, rfenId: clubRfenId } = clubs.find(c => c.id === selectedClub) || {}

    let fcnMatches: MatchResponse = { data: [], included: [] };
    let rfenMatches: MatchResponse = { data: [], included: [] };

    const isFcnSearch = (allCategories && allClubs)
      || (allCategories && clubFcnId)
      || (categoryFcnId && allClubs)
      || (categoryFcnId && clubFcnId)

    const isRfenSearch = (allCategories && allClubs)
      || (allCategories && clubRfenId)
      || (categoryRfenId && allClubs)
      || (categoryRfenId && clubRfenId)

    if (isFcnSearch) {
      fcnMatches = await Api.getNextMatches(fcn, categoryFcnId, clubFcnId);
    }

    if (isRfenSearch) {
      rfenMatches = await Api.getNextMatches(rfen, categoryRfenId, clubRfenId);

      if (gender) {
        const genderTournamentIds = rfenMatches.included
          .filter(({ type, attributes }) => type === 'tournament' && attributes.gender === gender)
          .map(({ id }) => id);

        const genderGroups = rfenMatches.included
          .filter((element) => element.type === 'group' && genderTournamentIds.includes(element.relationships.tournament.data.id))
          .map(({ id }) => id);

        const genderRounds = rfenMatches.included
          .filter((element) => element.type === 'round' && genderGroups.includes(element.relationships.group.data.id))
          .map(({ id }) => id);

        rfenMatches.data = rfenMatches.data.filter(({ relationships: { round } }) => round.data?.id && genderRounds.includes(round.data.id))
      }

    }

    const included = fcnMatches.included.concat(rfenMatches.included);
    const data = fcnMatches.data.concat(rfenMatches.data);
    data.sort((a, b) => (a.attributes.date || '')?.localeCompare(b.attributes.date || ''));

    setLoading(false);
    setMatches({ data, included });
  }

  React.useEffect(() => {
    loadMatches()
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

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    maxWidth: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

  return (
    <div>

      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" onClick={() => setOpen(true)} variant='outlined' sx={{ mr: 2, position: 'absolute' }}>FILTRES</Button>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
              Pròxims partits
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>



      {
        loading && <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'} height={'50vh'}>
          <CircularProgress />
          <Typography mt={2}>Loading...</Typography>
        </Box>
      }

      {
        !loading && matches.data.length === 0 && <Typography>
          No hi ha dades de <strong>
            "{selectedCategory ? categories.find(c => `${c.id}` === selectedCategory)?.name : 'Totes les categories'}"
          </strong> per al club <strong>
            "{selectedClub ? clubs.find(c => `${c.id}` === selectedClub)?.name : 'Tots els clubs'}"</strong>.
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
            <Grid key={id} container spacing={2} borderBottom={1} mb={2}>
              <Grid size={12}>
                <Typography textAlign={'center'} fontWeight={'bold'} mt={2}>
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

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select value={selectedCategory} displayEmpty onChange={(e) => setSelectedCategory(e.target.value)}>
              <MenuItem key={'0'} value={''}>Totes les categories</MenuItem>
              {categories.map(({ id, name }) => <MenuItem key={id} value={id}>{name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <Select value={selectedClub} displayEmpty onChange={(e) => setSelectedClub(e.target.value)}>
              <MenuItem key={'0'} value={''}>Tots els clubs</MenuItem>
              {clubs.map(({ id, name }, i) => <MenuItem key={i} value={id}>{name}</MenuItem>)}
            </Select>
          </FormControl>

          <Box display='flex' justifyContent='flex-end'>
            <Button sx={{ mt: 2 }} onClick={() => {
              const url = new URL(window.location.origin);
              if (selectedCategory) url.searchParams.append('categoria', selectedCategory);
              if (selectedClub) url.searchParams.append('club', selectedClub);
              window.history.pushState({}, '', url);
              loadMatches();
              setOpen(false);
            }} variant='outlined'>APLICAR FILTROS</Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

export default App;
