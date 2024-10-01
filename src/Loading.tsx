import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loading() {
    return (
        <Box display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'} height={'50vh'}>
            <CircularProgress />
            <Typography mt={2}>Loading...</Typography>
        </Box>
    )
}