import { Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Stack, Typography } from '@mui/material';
import { CheckCircleOutlineRounded } from '@mui/icons-material';
import type { HelpTopic } from '../types/help';

export function HelpTopicCard({ topic }: { topic: HelpTopic }) {
  const Icon = topic.icon;
  return (
    <Card component="section" id={topic.id} sx={{ height: '100%', scrollMarginTop: theme => theme.spacing(12) }}>
      <CardContent sx={{ height: '100%' }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Icon color="primary" />
            <Typography variant="h6">{topic.title}</Typography>
          </Stack>
          <Typography color="text.secondary">{topic.summary}</Typography>
          <List disablePadding aria-label={`Schritte: ${topic.title}`}>
            {topic.steps.map(step => (
              <ListItem key={step} disableGutters alignItems="flex-start">
                <ListItemIcon sx={{ minWidth: 34, mt: 0.25 }}><CheckCircleOutlineRounded color="success" fontSize="small" /></ListItemIcon>
                <ListItemText primary={step} />
              </ListItem>
            ))}
          </List>
        </Stack>
      </CardContent>
    </Card>
  );
}
