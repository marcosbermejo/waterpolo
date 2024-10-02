import { Box, Button, FormControl, MenuItem, Modal, Select } from "@mui/material";
import clubs from './data/clubs.json';
import categories from './data/categories.json';
import React from "react";

export enum Period {
    PAST = -1,
    FUTURE = 1
}

export type SelectedFilter = {
    selectedPeriod: Period,
    selectedClub: string,
    selectedCategory: string
};

export type FilterProps = {
    open: boolean,
    defaultPeriod: Period,
    defaultCategory: string,
    defaultClub: string,
    setOpen: (open: boolean) => void,
    applyFilters: (selectedFilter: SelectedFilter) => void
}

export default function Filter({
    open,
    defaultPeriod,
    defaultClub,
    defaultCategory,
    setOpen,
    applyFilters,
}: FilterProps) {

    const [selectedPeriod, setSelectedPeriod] = React.useState<Period>(defaultPeriod);
    const [selectedClub, setSelectedClub] = React.useState<string>(defaultClub);
    const [selectedCategory, setSelectedCategory] = React.useState<string>(defaultCategory);

    return (
        <Modal
            open={open}
            onClose={() => setOpen(false)}
        >
            <Box sx={{
                position: 'absolute' as 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                maxWidth: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
            }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <Select value={selectedPeriod} displayEmpty onChange={(e) => setSelectedPeriod(+e.target.value)}>
                        <MenuItem value={Period.FUTURE}>Propers partits</MenuItem>
                        <MenuItem value={Period.PAST}>Partits passats</MenuItem>
                    </Select>
                </FormControl>

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
                    <Button sx={{ mt: 2 }} onClick={() => applyFilters({
                        selectedPeriod,
                        selectedClub,
                        selectedCategory
                    })} variant='outlined'>APLICAR FILTROS</Button>
                </Box>
            </Box>
        </Modal>
    )
}