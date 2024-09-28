import { Stack, Typography, Paper, Box } from "@mui/material";
import { Team } from "./Api";

type TeamProps = {
  team?: Team,
  direction?: 'column' | 'row',
  size?: number,
  fontSize?: number | { xs?: number, sm?: number },
  defaultText?: string
}

export default function Item({ team, direction = 'column', size = 80, fontSize = 12, defaultText }: TeamProps) {
  return (
    <Stack alignItems="center" flexDirection={direction} useFlexGap={true} spacing={1}>
      <Paper elevation={3}>
        {
          team
            ? <img src={team.meta.avatar.large || ''} alt={team.attributes.name || ''} style={{ width: '100%', maxWidth: size, display:'block' }} loading="lazy"/>
            : (
              <Box bgcolor={'grey.300'} width={size} height={size} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                <Typography fontSize={28}>?</Typography>
              </Box>)
        }
        
      </Paper>
      <Stack minHeight={'2em'} justifyContent={'center'}>
        <Typography variant="subtitle2" fontSize={fontSize} fontWeight={'bold'} textAlign="center">
          {team ? team.attributes.name : defaultText}
        </Typography>
      </Stack>

    </Stack>
  )
}