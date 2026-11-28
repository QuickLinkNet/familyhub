import type { SvgIconComponent } from '@mui/icons-material';

export interface HelpTopic {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  icon: SvgIconComponent;
  adminOnly?: boolean;
}
