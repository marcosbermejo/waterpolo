import { Box, Typography } from "@mui/material";
import clubs from './data/clubs.json';
import categories from './data/categories.json';
import { Period } from "./Filter";

export type EmptyProps = {
    selectedCategory: string
    selectedClub: string
    selectedPeriod: Period
}

export default function Empty({ selectedCategory, selectedClub, selectedPeriod }: EmptyProps) {
    return (
        <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'} height={'50vh'}>
            <Typography>No hi ha {selectedPeriod === Period.FUTURE ? 'propers partits' : 'partits passats'} per a</Typography>
            <Typography>{selectedCategory ? categories.find(c => `${c.id}` === selectedCategory)?.name : 'Totes les categories'}</Typography>
            <Typography>{selectedClub ? clubs.find(c => `${c.id}` === selectedClub)?.name : 'Tots els clubs'}</Typography>
        </Box>
    )
}