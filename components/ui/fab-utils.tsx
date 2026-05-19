export type FABAction = {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  action?: () => void;
  color?: string;
};
