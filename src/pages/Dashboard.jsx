import { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Megaphone, X } from 'lucide-react'
import DailyBrief from '../components/dashboard/DailyBrief'
import WelcomeSection from '../components/dashboard/WelcomeSection'
import XpLevelDisplay from '../components/dashboard/XpLevelDisplay'
import StreakDisplay from '../components/dashboard/StreakDisplay'
import TodayFocus from '../components/dashboard/TodayFocus'
import AttendanceWidget from '../components/dashboard/AttendanceWidget'
import InternalsSummary from '../components/dashboard/InternalsSummary'
import UpcomingEvents from '../components/dashboard/UpcomingEvents'
import QuickActions from '../components/dashboard/QuickActions'
import DailyCheckin from '../components/dashboard/DailyCheckin'
import HabitWidget from '../components/dashboard/HabitWidget'
import StudyBuddy from '../components/dashboard/StudyBuddy'
import TodaySchedule from '../components/dashboard/TodaySchedule'
import UpcomingTasks from '../components/dashboard/UpcomingTasks'
import ExamCountdown from '../components/dashboard/ExamCountdown'
import GpaWidget from '../components/dashboard/GpaWidget'
import CustomizeDashboard from '../components/dashboard/CustomizeDashboard'
import OnboardingTour from '../components/dashboard/OnboardingTour'
import { getVisibleWidgets } from '../utils/widgetConfig'
import { Settings2 } from 'lucide-react'

const WIDGET_MAP = {
  dailyBrief: { component: DailyBrief },
  xpLevel: { component: XpLevelDisplay },
  streak: { component: StreakDisplay },
  dailyCheckin: { component: DailyCheckin },
  todayFocus: { component: TodayFocus },
  attendance: { component: AttendanceWidget },
  internals: { component: InternalsSummary },
  upcomingEvents: { component: UpcomingEvents },
  habit: { component: HabitWidget },
  quickActions: { component: QuickActions },
  todaySchedule: { component: TodaySchedule },
  upcomingTasks: { component: UpcomingTasks },
  examCountdown: { component: ExamCountdown },
  studyBuddy: { component: StudyBuddy },
  gpa: { component: GpaWidget }
}

export default function Dashboard() {
  const { currentTheme } = useTheme()
  const [visibleIds, setVisibleIds] = useState([])
  const [showCustomize, setShowCustomize] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [dismissed, setDismissed] = useState(new Set())

  useEffect(() => {
    setVisibleIds(getVisibleWidgets().map(w => w.id))
    const fetchAnnouncements = async () => {
      try {
        const q = query(collection(db, 'announcements'), where('active', '==', true), orderBy('createdAt', 'desc'), limit(5))
        const snap = await getDocs(q)
        setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      } catch (e) { console.warn('Failed to fetch announcements:', e) }
    }
    fetchAnnouncements()
  }, [])

  const refreshWidgets = () => {
    setVisibleIds(getVisibleWidgets().map(w => w.id))
  }

  const show = (id) => visibleIds.includes(id)
  const layout = currentTheme?.vars?.['--dashboard-layout'] || 'standard'

  const topWidgets = ['xpLevel', 'streak', 'dailyCheckin']
  const midWidgets = ['attendance', 'internals', 'upcomingEvents', 'habit', 'quickActions', 'todayFocus']
  const bottomWidgets = ['todaySchedule', 'upcomingTasks', 'examCountdown', 'gpa', 'studyBuddy']

  const renderLayout = () => {
    switch (layout) {
      case 'sidebar':
        return (
          <>
            {show('dailyBrief') && <DailyBrief />}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
                {show('streak') && <StreakDisplay />}
                {show('habit') && <HabitWidget />}
                {show('examCountdown') && <ExamCountdown />}
              </div>
              <div className="lg:col-span-3 space-y-4 order-1 lg:order-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {show('xpLevel') && <XpLevelDisplay />}
                  {show('dailyCheckin') && <DailyCheckin />}
                  {show('todayFocus') && <TodayFocus />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    {show('attendance') && <AttendanceWidget />}
                    {show('upcomingTasks') && <UpcomingTasks />}
                  </div>
                  <div className="space-y-4">
                    {show('internals') && <InternalsSummary />}
                    {show('todaySchedule') && <TodaySchedule />}
                  </div>
                </div>
                {show('quickActions') && <QuickActions />}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {show('gpa') && <GpaWidget />}
                  {show('studyBuddy') && <div className="md:col-span-2">{<StudyBuddy />}</div>}
                  {!show('studyBuddy') && show('gpa') && <div />}
                </div>
              </div>
            </div>
          </>
        )
      case 'compact':
        return (
          <>
            {show('dailyBrief') && <DailyBrief />}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {show('xpLevel') && <XpLevelDisplay />}
              {show('streak') && <StreakDisplay />}
              {show('dailyCheckin') && <DailyCheckin />}
              {show('todayFocus') && <TodayFocus />}
              {show('examCountdown') && <ExamCountdown />}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-4">
                {show('habit') && <HabitWidget />}
                {show('quickActions') && <QuickActions />}
              </div>
              <div className="md:col-span-2 space-y-4">
                {show('attendance') && <AttendanceWidget />}
                {show('internals') && <InternalsSummary />}
                {show('upcomingTasks') && <UpcomingTasks />}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {show('todaySchedule') && <TodaySchedule />}
              {show('gpa') && <GpaWidget />}
            </div>
            {show('studyBuddy') && <StudyBuddy />}
          </>
        )
      case 'grid':
        return (
          <>
            {show('dailyBrief') && <DailyBrief />}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {show('xpLevel') && <XpLevelDisplay />}
              {show('streak') && <StreakDisplay />}
              {show('dailyCheckin') && <DailyCheckin />}
              {show('todayFocus') && <TodayFocus />}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {show('attendance') && <AttendanceWidget />}
              {show('internals') && <InternalsSummary />}
              {show('upcomingEvents') && <UpcomingEvents />}
              {show('habit') && <HabitWidget />}
              {show('quickActions') && <QuickActions />}
              {show('todaySchedule') && <TodaySchedule />}
              {show('upcomingTasks') && <UpcomingTasks />}
              {show('examCountdown') && <ExamCountdown />}
              {show('gpa') && <GpaWidget />}
            </div>
            {show('studyBuddy') && <StudyBuddy />}
          </>
        )
      case 'stacked':
        return (
          <>
            {show('dailyBrief') && <DailyBrief />}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {show('xpLevel') && <div className="flex-1 min-w-[140px]"><XpLevelDisplay /></div>}
                {show('streak') && <div className="flex-1 min-w-[140px]"><StreakDisplay /></div>}
                {show('dailyCheckin') && <div className="flex-1 min-w-[140px]"><DailyCheckin /></div>}
                {show('todayFocus') && <div className="flex-1 min-w-[140px]"><TodayFocus /></div>}
              </div>
              <div className="space-y-4">
                {show('examCountdown') && <ExamCountdown />}
                {show('attendance') && <AttendanceWidget />}
                {show('internals') && <InternalsSummary />}
                {show('habit') && <HabitWidget />}
                {show('quickActions') && <QuickActions />}
                {show('todaySchedule') && <TodaySchedule />}
                {show('upcomingTasks') && <UpcomingTasks />}
                {show('gpa') && <GpaWidget />}
              </div>
              {show('studyBuddy') && <StudyBuddy />}
            </div>
          </>
        )
      default:
        return (
          <>
            {show('dailyBrief') && <DailyBrief />}
            {topWidgets.some(show) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {show('xpLevel') && <XpLevelDisplay />}
                {show('streak') && <StreakDisplay />}
                {show('dailyCheckin') && <DailyCheckin />}
                {show('todayFocus') && <div className="hidden md:block" />}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {midWidgets.some(show) && (
                <>
                  <div className="md:col-span-2 space-y-4">
                    {show('attendance') && <AttendanceWidget />}
                    {show('internals') && <InternalsSummary />}
                    {show('upcomingEvents') && <UpcomingEvents />}
                  </div>
                  <div className="space-y-4">
                    {show('habit') && <HabitWidget />}
                    {show('quickActions') && <QuickActions />}
                    {show('todayFocus') && <TodayFocus />}
                  </div>
                </>
              )}
            </div>
            {bottomWidgets.some(show) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {show('todaySchedule') && <TodaySchedule />}
                {show('upcomingTasks') && <UpcomingTasks />}
                {show('examCountdown') && <ExamCountdown />}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {show('gpa') && <GpaWidget />}
              {show('studyBuddy') && <div className="md:col-span-2">{<StudyBuddy />}</div>}
              {!show('studyBuddy') && show('gpa') && <div />}
            </div>
          </>
        )
    }
  }

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <WelcomeSection />
        <button onClick={() => setShowCustomize(true)}
          className="p-2 rounded-xl hover:bg-hover text-muted hover:text-primary transition-colors cursor-pointer border-0 bg-transparent" title="Customize Dashboard">
          <Settings2 size={18} />
        </button>
      </div>

      {announcements.filter(a => !dismissed.has(a.id)).slice(0, 1).map(a => (
        <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <Megaphone size={16} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-primary flex-1">{a.message}</p>
          <button onClick={() => setDismissed(prev => new Set([...prev, a.id]))}
            className="p-0.5 rounded hover:bg-black/10 text-muted cursor-pointer border-0 bg-transparent">
            <X size={14} />
          </button>
        </div>
      ))}

      {renderLayout()}

      <CustomizeDashboard isOpen={showCustomize} onClose={() => setShowCustomize(false)} onSave={refreshWidgets} />
      <OnboardingTour />
    </div>
  )
}
