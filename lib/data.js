// /lib/data.js
import { Home, HelpCircle,  GraduationCap, LayoutDashboard, VectorSquare,       UserPlus } from 'lucide-react'

export const NavItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Trainings', path: '/trainings', icon: GraduationCap },
  { 
    name: 'Tools', 
    path: '/tools', 
    icon: VectorSquare,
    children: [
      { name: 'Tool 1', path: '/tools/tool1' },
      { name: 'Tool 2', path: '/tools/tool2' },
      { name: 'Tool 3', path: '/tools/tool3' },
    ]
  },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Enroll Now', path: '/enroll', icon: UserPlus },
]
