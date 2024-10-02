import React from 'react';
import { Api, Group, MatchResponse, Tournament, Team, Round, Facility, Category, Result } from './Api';
import clubs from './data/clubs.json';
import categories from './data/categories.json';
import Match, { MatchProps } from './Match';
import parseDate from './util/parseDate';
import Header from './Header';
import Loading from './Loading';
import Filter, { FilterProps, Period, SelectedFilter } from './Filter';
import Empty from './Empty';

const fcn = '314965';
const rfen = '210453';

function App() {

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [matches, setMatches] = React.useState<MatchResponse>({ data: [], included: [] });

  const params = new URLSearchParams(window.location.search);

  const defaultCategory = params.get('category') || '';
  const defaultClub = params.get('club') || '';
  const defaultPeriod = params.get('period') === '-1' ? Period.PAST : Period.FUTURE;

  const [selectedPeriod, setSelectedPeriod] = React.useState<Period>(defaultPeriod);
  const [selectedClub, setSelectedClub] = React.useState<string>(defaultClub);
  const [selectedCategory, setSelectedCategory] = React.useState<string>(defaultCategory);

  React.useEffect(() => {
    loadMatches({ selectedCategory: defaultCategory, selectedClub: defaultClub, selectedPeriod: defaultPeriod })
  }, [])

  const loadMatches = async (filter: SelectedFilter) => {
    setLoading(true);

    const allCategories = filter.selectedCategory === ''
    const allClubs = filter.selectedClub === ''

    const { fcnId: categoryFcnId, rfenId: categoryRfenId, gender } = categories.find(c => c.id === filter.selectedCategory) || {}
    const { fcnId: clubFcnId, rfenId: clubRfenId } = clubs.find(c => c.id === filter.selectedClub) || {}

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
      fcnMatches = await Api.getNextMatches(filter.selectedPeriod, fcn, categoryFcnId, clubFcnId);
    }

    if (isRfenSearch) {
      rfenMatches = await Api.getNextMatches(filter.selectedPeriod, rfen, categoryRfenId, clubRfenId);

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
    data.sort((a, b) => ((a.attributes.date || '')?.localeCompare(b.attributes.date || '')) * filter.selectedPeriod);

    setLoading(false);
    setMatches({ data, included });
  }

  const findObject = (objectId: string | undefined | null, objectType: 'round' | 'group' | 'tournament' | 'category' | 'team' | 'facility' | 'result' ) => (
    objectId
      ? matches.included.find(({ type, id }) => type === objectType && id === objectId)
      : null);


  const filterProps: FilterProps = {
    open,
    defaultCategory,
    defaultClub,
    defaultPeriod,
    setOpen,
    applyFilters: (filter) => {
      const url = new URL(window.location.href);
      if (filter.selectedCategory) url.searchParams.set('category', filter.selectedCategory); else url.searchParams.delete('category');
      if (filter.selectedClub) url.searchParams.set('club', filter.selectedClub); else url.searchParams.delete('club');
      if (filter.selectedPeriod) url.searchParams.set('period', filter.selectedPeriod.toString());
      window.history.pushState({}, '', url);

      setSelectedPeriod(filter.selectedPeriod);
      setSelectedCategory(filter.selectedCategory);
      setSelectedClub(filter.selectedClub);

      loadMatches(filter);
      setOpen(false);
    }
  }

  return (
    <div>

      <Header onOpenFilter={() => setOpen(true)} period={selectedPeriod} />
      <Filter {...filterProps} />

      {loading && <Loading />}

      {
        !loading && matches.data.length === 0 && <Empty {...{ selectedCategory, selectedClub, selectedPeriod }} />
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

          const result1 =  findObject(relationships.results.data ? relationships.results.data[0]?.id : null, 'result') as Result | null;
          const result2 =  findObject(relationships.results.data ? relationships.results.data[1]?.id : null, 'result') as Result | null;

          const { day, hour } = parseDate(attributes.date);

          const matchProps: MatchProps = {
            round,
            tournament,
            category,
            facility,
            homeTeam,
            awayTeam,
            homeTeamResult: homeTeam ? [result1, result2].find(r => r?.relationships.team.data.id === homeTeam.id) || null : null,
            awayTeamResult: awayTeam ? [result1, result2].find(r => r?.relationships.team.data.id === awayTeam.id) || null : null,
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
