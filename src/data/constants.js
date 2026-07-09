export const XP_RULES = {
  FOCUS_SESSION: 50,
  DAILY_CHECKIN: 10,
  ATTENDANCE_UPDATE: 15,
  STUDY_TASK_COMPLETE: 30,
  NOTES_UPLOAD: 100,
  QUIZ_COMPLETE: 40,
  HELPING_STUDENT: 75,
  STREAK_BONUS: {
    3: 50,
    7: 150,
    30: 500
  }
}

export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Freshman' },
  { level: 2, xp: 100, title: 'Scholar' },
  { level: 3, xp: 300, title: 'Learner' },
  { level: 4, xp: 600, title: 'Thinker' },
  { level: 5, xp: 1000, title: 'Achiever' },
  { level: 6, xp: 1500, title: 'Brilliant' },
  { level: 7, xp: 2200, title: 'Genius' },
  { level: 8, xp: 3000, title: 'Prodigy' },
  { level: 9, xp: 4000, title: 'Legend' },
  { level: 10, xp: 5500, title: 'Scholar Supreme' }
]

export const ACHIEVEMENTS = [
  { id: 'first_login', title: 'First Login', description: 'Welcome to Student OS!', icon: 'LogIn', xp: 10 },
  { id: 'streak_3', title: '3-Day Streak', description: 'Logged in for 3 days straight', icon: 'Flame', xp: 50 },
  { id: 'streak_7', title: '7-Day Streak', description: 'A full week of learning!', icon: 'Flame', xp: 150 },
  { id: 'streak_30', title: 'Monthly Warrior', description: '30-day streak! Unstoppable!', icon: 'Trophy', xp: 500 },
  { id: 'first_notes', title: 'Notes Sharer', description: 'Uploaded your first notes', icon: 'FileText', xp: 100 },
  { id: 'focus_10', title: 'Focus Master', description: 'Completed 10 focus sessions', icon: 'Timer', xp: 200 },
  { id: 'attendance_saver', title: 'Attendance Saver', description: 'Maintained 85%+ attendance for a month', icon: 'CheckCircle', xp: 150 },
  { id: 'quiz_master', title: 'Quiz Master', description: 'Completed 5 quizzes', icon: 'Brain', xp: 100 },
  { id: 'top_100', title: 'Leaderboard Star', description: 'Reached top 100 on the leaderboard', icon: 'Award', xp: 300 },
  { id: 'helpful', title: 'Helpful Student', description: 'Helped 5 other students', icon: 'Heart', xp: 250 },
  { id: 'level_5', title: 'Rising Star', description: 'Reached Level 5', icon: 'Star', xp: 200 },
  { id: 'level_10', title: 'Student OS Legend', description: 'Reached Level 10!', icon: 'Crown', xp: 1000 }
]

export const AI_CREDITS = {
  free: { daily: 20, maxHistory: 7 },
  premium: { daily: 100, maxHistory: 60 }
}

export const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/attendance', label: 'Attendance', icon: 'CalendarCheck' },
  { path: '/internals', label: 'Internals', icon: 'BarChart3' },
  { path: '/calendar', label: 'Calendar', icon: 'Calendar' },
  { path: '/focus', label: 'Focus', icon: 'Clock' },
  { path: '/ai', label: 'AI Workspace', icon: 'Sparkles' },
  { path: '/notes', label: 'Notes Hub', icon: 'BookOpen' },
  { path: '/students', label: 'Students', icon: 'Users' },
  { path: '/leaderboard', label: 'Leaderboard', icon: 'Trophy' },
  { path: '/profile', label: 'Profile', icon: 'User' },
  { path: '/settings', label: 'Settings', icon: 'Settings' }
]

export const MARKS_COMPONENTS = [
  { id: 'cia1', label: 'CIA 1', defaultConducted: 20 },
  { id: 'cia2', label: 'CIA 2', defaultConducted: 20 },
  { id: 'skill1', label: 'Skill Assessment 1', defaultConducted: 15 },
  { id: 'skill2', label: 'Skill Assessment 2', defaultConducted: 15 },
  { id: 'model', label: 'Model Exam', defaultConducted: 100 },
  { id: 'lab', label: 'Lab', defaultConducted: 50 },
  { id: 'record', label: 'Record', defaultConducted: 10 }
]

export const GRADES = [
  { grade: 'S', min: 90, description: 'Outstanding' },
  { grade: 'A', min: 80, description: 'Excellent' },
  { grade: 'B', min: 70, description: 'Good' },
  { grade: 'C', min: 60, description: 'Average' },
  { grade: 'D', min: 50, description: 'Pass' },
  { grade: 'F', min: 0, description: 'Fail' }
]
