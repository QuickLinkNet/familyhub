import { Avatar, type AvatarProps } from '@mui/material';

interface MemberAvatarProps extends Omit<AvatarProps, 'children'> {
  name: string;
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function MemberAvatar({ name, ...props }: MemberAvatarProps) {
  return <Avatar {...props}>{getInitials(name) || '?'}</Avatar>;
}
