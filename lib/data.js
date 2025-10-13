// /lib/data.js
import { Home, HelpCircle,  GraduationCap, LayoutDashboard, VectorSquare,       UserPlus } from 'lucide-react'
import {
  ClipboardList,
  Layers,
  Video,
  TrendingUp,
  CheckCircle,
  CalendarDays,
  ExternalLink,
  Clock,
  MessageSquareWarning,
} from 'lucide-react';

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




// // /data/toolsData.js

export const toolCategories = [
  // ----------------------- 1. YOUTUBE TOOLS -----------------------
  {
    id: "youtube-tools",
    name: "YouTube Tools",
    description:
      "Powerful tools to supercharge your YouTube automation workflow — from scriptwriting to SEO optimization.",
    image:
      "https://images.unsplash.com/photo-1629334669421-0c1f0b4e1b60?auto=format&fit=crop&w=800&q=60",
    tools: [
      {
        id: 1,
        title: "Script Writer AI",
        desc: "Generate engaging YouTube scripts using AI with tone, emotion, and pacing control.",
        img: "https://images.unsplash.com/photo-1525186402429-b4ff38bedbec?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 2,
        title: "Thumbnail Generator",
        desc: "Create high-performing YouTube thumbnails automatically based on your title and style.",
        img: "https://images.unsplash.com/photo-1602526215834-df7b91cdd48d?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 3,
        title: "SEO Tag Optimizer",
        desc: "Generate ranking YouTube tags and keywords using real-time trending analytics.",
        img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 4,
        title: "Voice Over Studio",
        desc: "Convert your scripts into realistic AI voices across 120+ accents and tones.",
        img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 5,
        title: "Video Description Writer",
        desc: "Instantly generate SEO-friendly YouTube descriptions with time-stamps and CTAs.",
        img: "https://images.unsplash.com/photo-1611162617213-7d7a3b21e294?auto=format&fit=crop&w=800&q=60",
      },
    ],
  },

  // ----------------------- 2. CONTENT CREATION TOOLS -----------------------
  {
    id: "content-tools",
    name: "Content Creation Tools",
    description:
      "From idea generation to post-production — your complete creative studio in one place.",
    image:
      "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=800&q=60",
    tools: [
      {
        id: 1,
        title: "Blog Writer Pro",
        desc: "AI-powered blog generator that structures SEO-rich articles in your unique voice.",
        img: "https://images.unsplash.com/photo-1581092918013-1cc9a30be5cf?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 2,
        title: "Reel Script Builder",
        desc: "Create short, viral scripts tailored for Instagram Reels and TikTok trends.",
        img: "https://images.unsplash.com/photo-1621605818789-c7b39d77cb7b?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 3,
        title: "Auto Caption Maker",
        desc: "Instantly generate perfect captions and subtitles for social videos.",
        img: "https://images.unsplash.com/photo-1555435021-bd1f27e2aa2a?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 4,
        title: "Visual Hook Analyzer",
        desc: "Test and score your video openings for maximum retention and virality.",
        img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 5,
        title: "Brand Voice Generator",
        desc: "Maintain consistency across posts with automated tone calibration for your brand.",
        img: "https://images.unsplash.com/photo-1603575448878-868a8a681732?auto=format&fit=crop&w=800&q=60",
      },
    ],
  },

  // ----------------------- 3. EDUCATION TOOLS -----------------------
  {
    id: "education-tools",
    name: "Education & Teaching Tools",
    description:
      "Tools for online educators — streamline lectures, automate grading, and engage students.",
    image:
      "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=800&q=60",
    tools: [
      {
        id: 1,
        title: "Quiz Builder",
        desc: "Design interactive quizzes with auto-grading and student performance analytics.",
        img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 2,
        title: "AI Lecture Notes",
        desc: "Automatically generate structured notes from recorded lectures or live sessions.",
        img: "https://images.unsplash.com/photo-1584697964199-4e0b8b70d1a7?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 3,
        title: "Progress Tracker",
        desc: "Monitor students’ learning progress across courses and modules.",
        img: "https://images.unsplash.com/photo-1612831455549-45e4d3976a9c?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 4,
        title: "Assignment Auto-Grader",
        desc: "Save hours with AI-assisted assignment reviews and grading suggestions.",
        img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 5,
        title: "Student Feedback Bot",
        desc: "Collect instant student feedback and convert it into actionable insights.",
        img: "https://images.unsplash.com/photo-1581092334538-3b3c74d49b62?auto=format&fit=crop&w=800&q=60",
      },
    ],
  },

  // ----------------------- 4. DESIGN & BRANDING TOOLS -----------------------
  {
    id: "design-tools",
    name: "Design & Branding Tools",
    description:
      "Beautiful design tools to enhance your visual identity and creative consistency.",
    image:
      "https://images.unsplash.com/photo-1603985529862-9a81f088ef22?auto=format&fit=crop&w=800&q=60",
    tools: [
      {
        id: 1,
        title: "Logo Generator",
        desc: "Generate modern, unique logos for your brand using AI and color psychology.",
        img: "https://images.unsplash.com/photo-1506086679525-9d883617d4e0?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 2,
        title: "Color Palette Designer",
        desc: "Curate perfect color palettes inspired by real-world brands and design theory.",
        img: "https://images.unsplash.com/photo-1584270354949-bdcb8f1aef9c?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 3,
        title: "Poster & Banner Maker",
        desc: "Create professional posters and thumbnails in minutes — no Photoshop needed.",
        img: "https://images.unsplash.com/photo-1590608897129-79da98d159c5?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 4,
        title: "Font Matcher",
        desc: "Find font pairings that complement your brand’s style and message.",
        img: "https://images.unsplash.com/photo-1590608897129-79da98d159c5?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 5,
        title: "Social Media Template Kit",
        desc: "Access hundreds of ready-to-edit Canva and Figma templates for your brand.",
        img: "https://images.unsplash.com/photo-1624996379697-f01e0af39a86?auto=format&fit=crop&w=800&q=60",
      },
    ],
  },

  // ----------------------- 5. AI AUTOMATION TOOLS -----------------------
  {
    id: "automation-tools",
    name: "AI Automation Tools",
    description:
      "Cut down repetitive tasks with smart automation powered by AI — focus on creation, not repetition.",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=60",
    tools: [
      {
        id: 1,
        title: "Workflow Builder",
        desc: "Create powerful task automations without writing a single line of code.",
        img: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 2,
        title: "Auto Email Composer",
        desc: "Automate follow-ups, client responses, and reminders using contextual AI.",
        img: "https://images.unsplash.com/photo-1588702547919-26089e690ecc?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 3,
        title: "Schedule Syncer",
        desc: "Synchronize deadlines, meetings, and submissions across platforms automatically.",
        img: "https://images.unsplash.com/photo-1522202221022-364e43471f2d?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 4,
        title: "Data Extractor",
        desc: "Extract structured data from any text, webpage, or PDF file instantly.",
        img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=800&q=60",
      },
      {
        id: 5,
        title: "Smart Notifier",
        desc: "Get automated reminders and insights from all your connected apps in one place.",
        img: "https://images.unsplash.com/photo-1573164574231-3de7a6b2f1b2?auto=format&fit=crop&w=800&q=60",
      },
    ],
  },
];





// Cards Data For User-Dashboard



export const cards = [
   
  {
    title: 'Pending Tasks',
    value: pendingTasks,
    sub: 'Awaiting Submission',
    icon: <ClipboardList size={22} />,
    color: 'bg-yellow-100',
    text: 'text-yellow-600',
    link: '/student/tasks',
  },
  {
      title: 'Completed Tasks',
      value: tasksCompleted,
      sub: `of ${totalTasks} total`,
      icon: <CheckCircle size={22} />,
      color: 'bg-green-100',
      text: 'text-green-600',
      link: '/student/tasks',
    },
  {
    title: 'Mentorship Days Left',
    value: mentorshipDays,
    sub: 'in your program',
    icon: <Clock size={22} />,
    color: 'bg-blue-100',
    text: 'text-blue-600',
    link: '/student/dashboard',
  },
  {
    title: 'Issues Reported',
    value: issuesReported,
    sub: 'Reported to Admin',
    icon: <MessageSquareWarning size={22} />,
    color: 'bg-red-100',
    text: 'text-red-600',
    link: '/student/report',
  },
];