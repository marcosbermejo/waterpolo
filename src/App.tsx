import React from 'react';
import { Api, Group, MatchResponse, Tournament, Team, Round, Facility, Category } from './Api';
import { AppBar, Box, Button, CircularProgress, FormControl, MenuItem, Modal, Select, Stack, Toolbar, Typography } from '@mui/material';
import clubs from './data/clubs.json';
import categories from './data/categories.json';
import Match, { MatchProps } from './Match';
import parseDate from './util/parseDate';
import Header from './Header';
import Loading from './Loading';
import Filter, { FilterProps } from './Filter';

const fcn = '314965';
const rfen = '210453';

function App() {

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [matches, setMatches] = React.useState<MatchResponse>({ data: [], included: [] });

  const params = new URLSearchParams(window.location.search);
  const [selectedClub, setSelectedClub] = React.useState<string>(params.get('club') || '');
  const [selectedCategory, setSelectedCategory] = React.useState<string>(params.get('categoria') || '');

  const loadMatches = async () => {
    setLoading(true);

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

  const findObject = (objectId: string | undefined | null, objectType: 'round' | 'group' | 'tournament' | 'category' | 'team' | 'facility') => (
    objectId
      ? matches.included.find(({ type, id }) => type === objectType && id === objectId)
      : null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    loadMatches()
  }, [])

  const filterProps: FilterProps = {
    open,
    selectedCategory,
    selectedClub,
    setOpen,
    setSelectedCategory,
    setSelectedClub,
    applyFilters: () => {
      const url = new URL(window.location.origin);
      if (selectedCategory) url.searchParams.append('categoria', selectedCategory);
      if (selectedClub) url.searchParams.append('club', selectedClub);
      window.history.pushState({}, '', url);
      loadMatches();
      setOpen(false);
    }
  }

  return (
    <div>

      <Header onOpenFilter={() => setOpen(true)} />
      <Filter {...filterProps} />

      { loading && <Loading /> }

      {
        !loading && matches.data.length === 0 && <Typography>
          No hi ha dades de <strong>
            "{selectedCategory ? categories.find(c => `${c.id}` === selectedCategory)?.name : 'Totes les categories'}"
          </strong> per al club <strong>
            "{selectedClub ? clubs.find(c => `${c.id}` === selectedClub)?.name : 'Tots els clubs'}"</strong>.
        </Typography>
      }

      {
        !loading && matches.data.map(({ id, meta, attributes, relationships }) => {

          const round = findObject(relationships.round.data?.id, 'round') as Round | null;
          const group = findObject(round?.relationships.group.data.id, 'group') as Group | null;
          const tournament = findObject(group?.relationships.tournament.data.id, 'tournament') as Tournament | null;
          const category = findObject(tournament?.relationships.category.data?.id, 'category') as Category | null;
          const facility = findObject(relationships.facility.data?.id, 'facility') as Facility | null;

          const homeTeam = findObject(meta.home_team, 'team') as Team | null;
          const awayTeam = findObject(meta.away_team, 'team') as Team | null;

          const { day, hour } = parseDate(attributes.date);

          const matchProps: MatchProps = {
            round,
            tournament,
            category,
            facility,
            homeTeam,
            awayTeam,
            day,
            hour
          }

          return <Match key={id} {...matchProps} />
        })
      }
    </div>
  );
}

export default App;
