import { Box, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import TeamItem from './Team';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Category, Facility, Result, Round, Team, Tournament } from './Api';

export type MatchProps = {
    round: Round | null
    tournament: Tournament | null
    category: Category | null
    facility: Facility | null
    homeTeam: Team | null
    awayTeam: Team | null
    homeTeamResult: Result | null
    awayTeamResult: Result | null
    day: string
    hour: string
}

export default function Match({
    round,
    tournament,
    category,
    facility,
    homeTeam,
    awayTeam,
    homeTeamResult,
    awayTeamResult,
    day,
    hour,
}: MatchProps) {

    const hasResult = homeTeamResult?.attributes.value || awayTeamResult?.attributes.value;
    const hourStyles = hasResult ? {} : {fontSize:28, fontWeight: 700};
    return (
        <Grid container spacing={2} borderBottom={1} py={2}>
            <Grid size={12}>
                <Typography textAlign={'center'} fontWeight={'bold'}>
                    {tournament?.attributes.name}
                </Typography>
            </Grid>
            <Grid size={3}>
                <TeamItem team={homeTeam} />
            </Grid>
            <Grid size={1} sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Typography fontSize={40} fontWeight={'bold'}>{homeTeamResult?.attributes.value}</Typography>
            </Grid>
            <Grid size={4} spacing={1}>
                <Stack height={'100%'} textAlign={'center'} alignItems={'center'}>
                    <Typography>{day}</Typography>
                    <Typography {...hourStyles}>{hour}</Typography>
                    <Typography>{round?.attributes.name}</Typography>
                    <Typography>{category?.attributes.name}</Typography>
                    <Typography>{facility?.attributes.name}</Typography>

                </Stack>
            </Grid>
            <Grid size={1} sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                <Typography fontSize={40} fontWeight={'bold'}>{awayTeamResult?.attributes.value}</Typography>
            </Grid>
            <Grid size={3}>
                <TeamItem team={awayTeam} />
            </Grid>
        </Grid>
    )
}