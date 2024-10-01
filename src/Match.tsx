import { Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import TeamItem from './Team';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Category, Facility, Round, Team, Tournament } from './Api';

export type MatchProps = {
    round: Round | null
    tournament: Tournament | null
    category: Category | null
    facility: Facility | null
    homeTeam: Team | null
    awayTeam: Team | null
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
    day,
    hour,
}: MatchProps) {


    return (
        <Grid container spacing={2} borderBottom={1} mb={2}>
            <Grid size={12}>
                <Typography textAlign={'center'} fontWeight={'bold'} mt={2}>
                    {tournament?.attributes.name}
                </Typography>
            </Grid>
            <Grid size={4}>
                <TeamItem team={homeTeam} />
            </Grid>
            <Grid size={4} spacing={1}>
                <Stack height={'100%'} textAlign={'center'} alignItems={'center'}>
                    <Typography>{day}</Typography>
                    <Typography fontSize={28} fontWeight={700}>{hour}</Typography>
                    <Typography>{round?.attributes.name}</Typography>
                    <Typography>{category?.attributes.name}</Typography>
                </Stack>
            </Grid>
            <Grid size={4}>
                <TeamItem team={awayTeam} />
            </Grid>
            <Grid size={12}>
                <Stack direction='row' px={2} mt={2} justifyContent={'space-between'} alignItems={'center'}>
                    <Typography display={'flex'} alignItems={'center'}>
                        <LocationOnIcon sx={{ mr: 1, fontSize: 14 }} />
                        {facility?.attributes.name}
                    </Typography>
                </Stack>
            </Grid>
        </Grid>
    )
}