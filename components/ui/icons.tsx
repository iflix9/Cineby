import {
  RefreshCcw,
  AlertTriangle,
  Play,
  Star,
  Calendar,
  Loader2,
  ChevronDown,
  Search,
  List,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  HeartCrack,
  Info,
  Check,
  Popcorn,
  Sparkles,
  Download,
  Plus,
  ListOrdered,
  Clapperboard,
  Tv,
  Fan,
  AudioLines,
  Projector,
  PartyPopper,
  Library,
  SlidersHorizontal,
  Home,
  Code,
  LayoutGrid,
  User,
  X,
  LogIn,
  ExternalLink,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

export interface IconProps extends Omit<LucideProps, 'ref'> {
  size?: number | string;
  className?: string;
  strokeWidth?: number;
}

function withDefaults(Icon: LucideIcon) {
  return function EnhancedIcon({
    size = 20,
    strokeWidth = 1.5,
    className,
    ...props
  }: IconProps) {
    return (
      <Icon
        size={size}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
      />
    );
  };
}

export const Icons = {
  refreshCcw: withDefaults(RefreshCcw),
  alertTriangle: withDefaults(AlertTriangle),
  play: withDefaults(Play),
  star: withDefaults(Star),
  calendar: withDefaults(Calendar),
  spinner: withDefaults(Loader2),
  chevronDown: withDefaults(ChevronDown),
  search: withDefaults(Search),
  list: withDefaults(List),
  chevronLeft: withDefaults(ChevronLeft),
  chevronRight: withDefaults(ChevronRight),
  clock: withDefaults(Clock),
  heart: withDefaults(Heart),
  heartCrack: withDefaults(HeartCrack),
  info: withDefaults(Info),
  check: withDefaults(Check),
  popcorn: withDefaults(Popcorn),
  sparkles: withDefaults(Sparkles),
  download: withDefaults(Download),
  plus: withDefaults(Plus),
  listOrdered: withDefaults(ListOrdered),
  clapperboard: withDefaults(Clapperboard),
  tv: withDefaults(Tv),
  pinwheel: withDefaults(Fan),
  audioLines: withDefaults(AudioLines),
  projector: withDefaults(Projector),
  partyPopper: withDefaults(PartyPopper),
  library: withDefaults(Library),
  slidersHorizontal: withDefaults(SlidersHorizontal),
  home: withDefaults(Home),
  code: withDefaults(Code),
  layoutGrid: withDefaults(LayoutGrid),
  user: withDefaults(User),
  x: withDefaults(X),
  logIn: withDefaults(LogIn),
  externalLink: withDefaults(ExternalLink),
};
