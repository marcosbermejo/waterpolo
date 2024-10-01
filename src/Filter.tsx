import { Box, Button, FormControl, MenuItem, Modal, Select } from "@mui/material";
import clubs from './data/clubs.json';
import categories from './data/categories.json';
import React from "react";

export type FilterProps = {
    open: boolean,
    selectedCategory: string,
    selectedClub: string,
    setOpen: (open: boolean) => void,
    applyFilters: () => void
    setSelectedCategory: (category: string) => void
    setSelectedClub: (club: string) => void
}

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

export default function Filter({
    open,
    selectedCategory,
    selectedClub,
    setOpen,
    applyFilters,
    setSelectedCategory,
    setSelectedClub,
}: FilterProps) {

    return (
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
                    <Button sx={{ mt: 2 }} onClick={() => applyFilters()} variant='outlined'>APLICAR FILTROS</Button>
                </Box>
            </Box>
        </Modal>
    )
}