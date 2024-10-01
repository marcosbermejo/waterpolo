import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Period } from "./Filter";

export type HeaderProps = {
    period: Period
    onOpenFilter: () => void
}

export default function Header({ period, onOpenFilter }: HeaderProps) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Button color="inherit" onClick={onOpenFilter} variant='outlined' sx={{ mr: 2, position: 'absolute', right: 0 }}>FILTRES</Button>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                        {period === Period.FUTURE ? 'Propers partits' : 'Partits passats'}
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}