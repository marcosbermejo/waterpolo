import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";

export type HeaderProps = {
    onOpenFilter: () => void
}

export default function Header({ onOpenFilter }: HeaderProps) {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Button color="inherit" onClick={onOpenFilter} variant='outlined' sx={{ mr: 2, position: 'absolute' }}>FILTRES</Button>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
                        Pròxims partits
                    </Typography>
                </Toolbar>
            </AppBar>
        </Box>
    )
}