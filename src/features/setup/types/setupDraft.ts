import type { SetupMemberInput, SetupRole } from './setup';
import { memberColors } from '../../../theme/memberPalette';

export interface SetupMemberDraft extends SetupMemberInput {
  clientId: string;
}

export const setupRoleLabels: Record<SetupRole, string> = {
  ADMIN: 'Admin',
  PARENT: 'Elternteil',
  CHILD: 'Kind'
};

export const createMemberDraft = (index: number, role: SetupRole = 'CHILD'): SetupMemberDraft => ({
  clientId: crypto.randomUUID(),
  name: '',
  role,
  color: memberColors[index % memberColors.length],
  password: '',
  pin: ''
});
