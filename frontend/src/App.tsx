import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { DayPicker } from 'react-day-picker'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'react-day-picker/style.css'
import './App.css'

type AuthMode = 'login' | 'register'
type SortMode = 'soonest' | 'latest' | 'most-slots'
type SessionAction = 'join' | 'leave'

type SessionUser = {
  _id?: string
  id?: string
  name?: string
  email?: string
  avatarColor?: string
}

type MealSession = {
  _id?: string
  id: string
  title: string
  description: string
  location: string
  locationLat?: number
  locationLng?: number
  time: string
  slots: number
  creator: SessionUser | string
  participants: Array<SessionUser | string>
  isActive: boolean
  createdAt: string
}

type SessionFormState = {
  title: string
  description: string
  location: string
  time: string
  slots: string
}

type AuthFormState = {
  name: string
  email: string
  password: string
}

type UserProfile = {
  id: string
  name: string
  email: string
  bio: string
  favoriteCuisine: string
  yearOfStudy: string
  avatarColor: string
  createdAt?: string
  updatedAt?: string
}

type ProfileFormState = {
  name: string
  bio: string
  favoriteCuisine: string
  yearOfStudy: string
  avatarColor: string
}

type Coordinates = {
  lat: number
  lng: number
  source: 'geocoded' | 'fallback'
}

type DashboardPageProps = {
  actionSessionId: string | null
  currentUserId: string | null
  globalNotice: string
  joinedSession: MealSession | null
  onRefresh: () => Promise<void>
  onSearchChange: (value: string) => void
  onSessionAction: (sessionId: string, action: SessionAction) => Promise<MealSession | null>
  onSortModeChange: (mode: SortMode) => void
  searchQuery: string
  sessionError: string
  sessionLoading: boolean
  sessions: MealSession[]
  sortMode: SortMode
}

type SessionDetailsPageProps = {
  actionSessionId: string | null
  currentUserId: string | null
  joinedSession: MealSession | null
  onRefresh: () => Promise<void>
  onSessionAction: (sessionId: string, action: SessionAction) => Promise<MealSession | null>
  sessionError: string
  sessionLoading: boolean
  sessions: MealSession[]
}

type CreateSessionPageProps = {
  onCreateSession: (event: FormEvent<HTMLFormElement>) => Promise<void>
  sessionError: string
  sessionForm: SessionFormState
  submittingSession: boolean
  onSessionFormChange: (field: keyof SessionFormState, value: string) => void
}

type ProfilePageProps = {
  currentUserId: string | null
  globalNotice: string
  handleProfileSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  profile: UserProfile | null
  profileError: string
  profileForm: ProfileFormState
  profileLoading: boolean
  profileSaving: boolean
  sessions: MealSession[]
  onProfileFieldChange: (field: keyof ProfileFormState, value: string) => void
}

type AuthPageProps = {
  authError: string
  authForm: AuthFormState
  authLoading: boolean
  mode: AuthMode
  onAuthFormChange: (field: keyof AuthFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>, mode: AuthMode) => Promise<void>
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  import.meta.env.VITE_API_URL?.trim() ||
  'http://localhost:5050'
const TOKEN_STORAGE_KEY = 'platemates-token'
const PROFILE_STORAGE_KEY = 'platemates-profile'
const AUCKLAND_CENTER: Coordinates = { lat: -36.8485, lng: 174.7633, source: 'fallback' }
const UPI_EMAIL_REGEX = /^[A-Za-z]{4}\d{3}@aucklanduni\.ac\.nz$/

const locationFallbacks: Array<{ match: RegExp; coordinates: Coordinates }> = [
  { match: /dominion/i, coordinates: { lat: -36.8878, lng: 174.7468, source: 'fallback' } },
  { match: /cbd|queen street|auckland central/i, coordinates: AUCKLAND_CENTER },
  { match: /newmarket/i, coordinates: { lat: -36.8698, lng: 174.7773, source: 'fallback' } },
  { match: /mount eden|mt eden/i, coordinates: { lat: -36.8841, lng: 174.7464, source: 'fallback' } },
]

const emptySessionForm: SessionFormState = {
  title: '',
  description: '',
  location: '',
  time: '',
  slots: '4',
}

const emptyAuthForm: AuthFormState = {
  name: '',
  email: '',
  password: '',
}

const emptyProfileForm: ProfileFormState = {
  name: '',
  bio: '',
  favoriteCuisine: '',
  yearOfStudy: '',
  avatarColor: '#2e7d61',
}

const CUISINE_OPTIONS = [
  'Chinese',
  'Japanese',
  'Korean',
  'Thai',
  'Indian',
  'Malaysian',
  'Vietnamese',
  'Italian',
  'Middle Eastern',
  'Dessert',
]

const YEAR_OPTIONS = ['Foundation', 'Year 1', 'Year 2', 'Year 3', 'Year 4+', 'Postgraduate']

const AVATAR_SWATCHES = ['#2e7d61', '#c17a3f', '#8f4353', '#4f6ea8', '#7f5f9f']

const brandMapMarker = L.divIcon({
  className: 'leaflet-brand-marker-wrapper',
  html: '<span class="leaflet-brand-marker"><span class="leaflet-brand-marker-core"></span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_STORAGE_KEY) ?? '')
  const [authForm, setAuthForm] = useState<AuthFormState>(emptyAuthForm)
  const [sessionForm, setSessionForm] = useState<SessionFormState>(emptySessionForm)
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm)
  const [sessions, setSessions] = useState<MealSession[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('soonest')
  const [authLoading, setAuthLoading] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [submittingSession, setSubmittingSession] = useState(false)
  const [actionSessionId, setActionSessionId] = useState<string | null>(null)
  const [authError, setAuthError] = useState('')
  const [sessionError, setSessionError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [globalNotice, setGlobalNotice] = useState('')

  const currentUserId = useMemo(() => getUserIdFromToken(token), [token])

  useEffect(() => {
    if (!globalNotice) {
      return
    }

    const timeout = window.setTimeout(() => {
      setGlobalNotice('')
    }, 3000)

    return () => window.clearTimeout(timeout)
  }, [globalNotice])

  const joinedSession = useMemo(
    () =>
      sessions.find((session) =>
        session.participants.some((participant) => getParticipantId(participant) === currentUserId),
      ) ?? null,
    [currentUserId, sessions],
  )

  const visibleSessions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = sessions.filter((session) => {
      if (normalizedQuery.length === 0) {
        return true
      }

      return [session.title, session.description, session.location].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      )
    })

    return filtered.sort((left, right) => {
      if (sortMode === 'latest') {
        return Date.parse(right.createdAt) - Date.parse(left.createdAt)
      }

      if (sortMode === 'most-slots') {
        return getRemainingSlots(right) - getRemainingSlots(left)
      }

      return Date.parse(left.time) - Date.parse(right.time)
    })
  }, [searchQuery, sessions, sortMode])

  const refreshSessions = useCallback(async () => {
    if (!token) {
      return
    }

    setSessionLoading(true)
    setSessionError('')

    try {
      const data = await fetchJson<{ data: MealSession[] }>(`${API_BASE_URL}/api/meals`, { token })
      setSessions(data.data.map(normalizeMealSession))
    } catch (error) {
      setSessionError(getErrorMessage(error))
    } finally {
      setSessionLoading(false)
    }
  }, [token])

  const loadProfile = useCallback(() => {
    if (!token) {
      return
    }

    setProfileLoading(true)
    setProfileError('')

    try {
      const storedProfile = readStoredProfile()
      if (storedProfile) {
        setProfile(storedProfile)
        setProfileForm(toProfileForm(storedProfile))
      }
    } catch (error) {
      setProfileError(getErrorMessage(error))
    } finally {
      setProfileLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      setSessions([])
      setProfile(null)
      setProfileForm(emptyProfileForm)
      setSessionError('')
      setProfileError('')
      return
    }

    void refreshSessions()
    loadProfile()
  }, [loadProfile, refreshSessions, token])

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>, mode: AuthMode) {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    const trimmedEmail = authForm.email.trim().toLowerCase()
    const trimmedName = authForm.name.trim()

    if (mode === 'register') {
      if (!trimmedName) {
        setAuthError('Please enter your full name.')
        setAuthLoading(false)
        return
      }

      if (!UPI_EMAIL_REGEX.test(trimmedEmail)) {
        setAuthError('Use your UPI email in the format abcd123@aucklanduni.ac.nz.')
        setAuthLoading(false)
        return
      }
    }

    const endpoint = mode === 'login' ? 'login' : 'register'
    const payload =
      mode === 'login'
        ? {
            email: trimmedEmail,
            password: authForm.password,
          }
        : {
            name: trimmedName,
            email: trimmedEmail,
            password: authForm.password,
          }

    try {
      const data = await fetchJson<{ message?: string; data: { token: string; user: SessionUser } }>(
        `${API_BASE_URL}/api/auth/${endpoint}`,
        {
          method: 'POST',
          body: payload,
        },
      )

      const nextProfile = normalizeUserProfile(data.data.user)
      localStorage.setItem(TOKEN_STORAGE_KEY, data.data.token)
      persistProfile(nextProfile)
      setToken(data.data.token)
      setProfile(nextProfile)
      setProfileForm(toProfileForm(nextProfile))
      setAuthForm(emptyAuthForm)
      setGlobalNotice(data.message || (mode === 'login' ? 'Logged in successfully.' : 'Account created successfully.'))
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setAuthError(getErrorMessage(error))
    } finally {
      setAuthLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetchJson<{ message: string }>(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        token,
      })
    } catch {
      // Logout should still complete locally even if the backend request fails.
    } finally {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(PROFILE_STORAGE_KEY)
      setToken('')
      setAuthForm(emptyAuthForm)
      setProfile(null)
      setSessions([])
      setGlobalNotice('')
      navigate('/login', { replace: true })
    }
  }

  async function handleCreateSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      setSessionError('Please log in before creating a meal session.')
      return
    }

    setSubmittingSession(true)
    setSessionError('')

    try {
      if (!sessionForm.time) {
        throw new Error('Please choose a date and time for your session.')
      }

      const payload = {
        title: sessionForm.title.trim(),
        description: sessionForm.description.trim(),
        location: {
          address: sessionForm.location.trim(),
          lat: getFallbackCoordinates(sessionForm.location.trim()).lat,
          lng: getFallbackCoordinates(sessionForm.location.trim()).lng,
        },
        time: new Date(sessionForm.time).toISOString(),
        slots: Number(sessionForm.slots),
      }

      const data = await fetchJson<{ message?: string; data: MealSession }>(`${API_BASE_URL}/api/meals/create`, {
        method: 'POST',
        body: payload,
        token,
      })

      setSessionForm(emptySessionForm)
      setGlobalNotice(data.message || 'Meal session created successfully.')
      await refreshSessions()
      navigate('/dashboard')
    } catch (error) {
      setSessionError(getErrorMessage(error))
    } finally {
      setSubmittingSession(false)
    }
  }

  async function handleSessionAction(sessionId: string, action: SessionAction) {
    if (!token) {
      setSessionError('Please log in before joining or leaving a session.')
      return null
    }

    setActionSessionId(sessionId)
    setSessionError('')

    try {
      const data = await fetchJson<{ message: string; data: MealSession }>(
        `${API_BASE_URL}/api/meals/${sessionId}/${action}`,
        {
          method: 'POST',
          token,
        },
      )

      const normalizedSession = normalizeMealSession(data.data)

      setSessions((current) => {
        const exists = current.some((session) => getSessionId(session) === sessionId)
        const nextSessions = exists
          ? current.map((session) =>
              getSessionId(session) === sessionId ? normalizedSession : session,
            )
          : [normalizedSession, ...current]

        return nextSessions.filter((session) => session.isActive)
      })

      setGlobalNotice(data.message)
      return normalizedSession
    } catch (error) {
      const message = getErrorMessage(error)
      setSessionError(message)
      throw error instanceof Error ? error : new Error(message)
    } finally {
      setActionSessionId(null)
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!token) {
      setProfileError('Please log in before editing your profile.')
      return
    }

    setProfileSaving(true)
    setProfileError('')

    try {
      const nextProfile = normalizeUserProfile({
        ...(profile ?? {}),
        ...profileForm,
        _id: profile?.id || currentUserId || '',
        email: profile?.email || '',
      })
      persistProfile(nextProfile)
      setProfile(nextProfile)
      setProfileForm(toProfileForm(nextProfile))
      setGlobalNotice('Profile saved locally.')
    } catch (error) {
      setProfileError(getErrorMessage(error))
    } finally {
      setProfileSaving(false)
    }
  }

  const isAuthenticated = Boolean(token)

  return (
    <div className={`app-shell ${isAuthenticated ? '' : 'app-shell-auth'}`}>
      <BackgroundOrnaments />
      <div className={`app-frame ${isAuthenticated ? '' : 'app-frame-auth'}`}>
        {isAuthenticated ? (
          <header className="app-navbar card">
            <Link className="brand-lockup" to="/dashboard">
              <BrandLogo />
              <div>
                <strong>Platemates</strong>
                <span>Shared meals for Auckland students</span>
              </div>
            </Link>
            <Navbar onLogout={handleLogout} />
          </header>
        ) : null}

        <div className={`app-content ${isAuthenticated ? '' : 'app-content-auth'}`}>
          <Routes key={location.pathname} location={location}>
            <Route element={<Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />} path="/" />
            <Route
              element={
                <PublicOnlyRoute isAuthenticated={isAuthenticated}>
                  <AuthPage
                    authError={authError}
                    authForm={authForm}
                    authLoading={authLoading}
                    mode="login"
                    onAuthFormChange={(field, value) =>
                      setAuthForm((current) => ({ ...current, [field]: value }))
                    }
                    onSubmit={handleAuthSubmit}
                  />
                </PublicOnlyRoute>
              }
              path="/login"
            />
            <Route
              element={
                <PublicOnlyRoute isAuthenticated={isAuthenticated}>
                  <AuthPage
                    authError={authError}
                    authForm={authForm}
                    authLoading={authLoading}
                    mode="register"
                    onAuthFormChange={(field, value) =>
                      setAuthForm((current) => ({ ...current, [field]: value }))
                    }
                    onSubmit={handleAuthSubmit}
                  />
                </PublicOnlyRoute>
              }
              path="/register"
            />
            <Route
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <DashboardPage
                    actionSessionId={actionSessionId}
                    currentUserId={currentUserId}
                    globalNotice={globalNotice}
                    joinedSession={joinedSession}
                    onRefresh={refreshSessions}
                    onSearchChange={setSearchQuery}
                    onSessionAction={handleSessionAction}
                    onSortModeChange={setSortMode}
                    searchQuery={searchQuery}
                    sessionError={sessionError}
                    sessionLoading={sessionLoading}
                    sessions={visibleSessions}
                    sortMode={sortMode}
                  />
                </ProtectedRoute>
              }
              path="/dashboard"
            />
            <Route
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <SessionDetailsPage
                    actionSessionId={actionSessionId}
                    currentUserId={currentUserId}
                    joinedSession={joinedSession}
                    onRefresh={refreshSessions}
                    onSessionAction={handleSessionAction}
                    sessionError={sessionError}
                    sessionLoading={sessionLoading}
                    sessions={sessions}
                  />
                </ProtectedRoute>
              }
              path="/sessions/:sessionId"
            />
            <Route
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <CreateSessionPage
                    onCreateSession={handleCreateSession}
                    onSessionFormChange={(field, value) =>
                      setSessionForm((current) => ({ ...current, [field]: value }))
                    }
                    sessionError={sessionError}
                    sessionForm={sessionForm}
                    submittingSession={submittingSession}
                  />
                </ProtectedRoute>
              }
              path="/create-session"
            />
            <Route
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <ProfilePage
                    currentUserId={currentUserId}
                    globalNotice={globalNotice}
                    handleProfileSubmit={handleProfileSubmit}
                    onProfileFieldChange={(field, value) =>
                      setProfileForm((current) => ({ ...current, [field]: value }))
                    }
                    profile={profile}
                    profileError={profileError}
                    profileForm={profileForm}
                    profileLoading={profileLoading}
                    profileSaving={profileSaving}
                    sessions={sessions}
                  />
                </ProtectedRoute>
              }
              path="/profile"
            />
            <Route element={<Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />} path="*" />
          </Routes>
        </div>
      </div>
    </div>
  )
}

function ProtectedRoute({
  children,
  isAuthenticated,
}: {
  children: ReactNode
  isAuthenticated: boolean
}) {
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  return <>{children}</>
}

function PublicOnlyRoute({
  children,
  isAuthenticated,
}: {
  children: ReactNode
  isAuthenticated: boolean
}) {
  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  return <>{children}</>
}

function Navbar({ onLogout }: { onLogout: () => void | Promise<void> }) {
  return (
    <nav aria-label="Primary" className="top-nav">
      <div className="top-nav-links">
        <NavLink className={getNavClassName} to="/dashboard">
          <Icon name="spark" />
          Dashboard
        </NavLink>
        <NavLink className={getNavClassName} to="/create-session">
          <Icon name="plus" />
          Create Session
        </NavLink>
        <NavLink className={getNavClassName} to="/profile">
          <Icon name="user" />
          Profile
        </NavLink>
      </div>
      <button className="top-nav-logout" onClick={() => void onLogout()} type="button">
        <Icon name="logout" />
        Sign out
      </button>
    </nav>
  )
}

function BackgroundOrnaments() {
  return (
    <div aria-hidden="true" className="background-ornaments">
      <span className="ornament-blob ornament-blob-a" />
      <span className="ornament-blob ornament-blob-b" />
      <span className="ornament-blob ornament-blob-c" />
      <span className="ornament-particle ornament-particle-a" />
      <span className="ornament-particle ornament-particle-b" />
      <span className="ornament-particle ornament-particle-c" />
      <span className="ornament-particle ornament-particle-d" />
      <span className="food-trail food-trail-burger">
        <FoodTrailIcon kind="burger" />
      </span>
      <span className="food-trail food-trail-fries">
        <FoodTrailIcon kind="fries" />
      </span>
      <span className="food-trail food-trail-drumstick">
        <FoodTrailIcon kind="drumstick" />
      </span>
      <span className="food-trail food-trail-soda">
        <FoodTrailIcon kind="soda" />
      </span>
      <span className="food-trail food-trail-hotpot">
        <FoodTrailIcon kind="hotpot" />
      </span>
      <span className="food-trail food-trail-skewer">
        <FoodTrailIcon kind="skewer" />
      </span>
    </div>
  )
}

function GlassCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`.trim()}>{children}</section>
}

function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`section-kicker ${className}`.trim()}>{children}</p>
}

function PageHeader({
  title,
  eyebrow,
  actions,
}: {
  title: ReactNode
  eyebrow: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="section-heading">
      <div>
        <SectionLabel>{eyebrow}</SectionLabel>
        <h2>{title}</h2>
      </div>
      {actions}
    </div>
  )
}

function StatusChip({
  children,
  warn = false,
  className = '',
}: {
  children: ReactNode
  warn?: boolean
  className?: string
}) {
  return <span className={`pill ${warn ? 'pill-warn' : ''} ${className}`.trim()}>{children}</span>
}

function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryText,
  className = '',
}: {
  icon?: ReactNode
  title: ReactNode
  description: ReactNode
  action?: ReactNode
  secondaryText?: ReactNode
  className?: string
}) {
  return (
    <div className={`empty-state ${className}`.trim()}>
      {icon ? <div className="empty-state-icon">{icon}</div> : null}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
      {secondaryText ? <p className="muted-text">{secondaryText}</p> : null}
    </div>
  )
}

function BrandLogo() {
  return (
    <span aria-hidden="true" className="brand-mark">
      <svg className="brand-mark-svg" fill="none" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12.5" cy="14" r="3.5" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="31.5" cy="14" r="3.5" stroke="currentColor" strokeWidth="2.2" />
        <path
          d="M7.5 28C7.5 23.858 10.858 20.5 15 20.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
        <path
          d="M36.5 28C36.5 23.858 33.142 20.5 29 20.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2.2"
        />
        <ellipse cx="22" cy="24.5" rx="8" ry="4.8" stroke="currentColor" strokeWidth="2.2" />
        <path d="M16 24.5H28" stroke="currentColor" strokeLinecap="round" strokeWidth="2.2" />
      </svg>
    </span>
  )
}

function FoodTrailIcon({
  kind,
}: {
  kind: 'burger' | 'fries' | 'drumstick' | 'soda' | 'hotpot' | 'skewer'
}) {
  switch (kind) {
    case 'burger':
      return (
        <svg className="food-trail-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 11.5c.7-2.6 3.3-4.5 7-4.5s6.3 1.9 7 4.5" fill="#f4b352" stroke="#9a5f1d" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.5 12.5h15" stroke="#7a4a17" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M5.5 16.5h13l-1 2h-11z" fill="#8e5a2b" stroke="#6d441f" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M6.2 13.8h11.6" stroke="#5d8d3a" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M8 9.5h.01M11 8.8h.01M14.2 9.4h.01" stroke="#fff3d8" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )
    case 'fries':
      return (
        <svg className="food-trail-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 4.5v6M10.5 3.8v6.7M14 4.2v6.3M17 5v5.5" stroke="#f0c14d" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M6 10.5h12l-1.2 8h-9.6z" fill="#d85e3f" stroke="#98412a" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      )
    case 'drumstick':
      return (
        <svg className="food-trail-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.5 9.5c2.3-2.3 6-2.5 8-.5s1.8 5.7-.5 8c-2 2-5 2.7-7.8 2.1l-2.7-2.7c-.6-2.8.1-5.8 3-6.9Z" fill="#c97b48" stroke="#8b512b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m5.8 16.2-1.6 1.6" stroke="#f6e8cf" strokeWidth="1.5" strokeLinecap="round" />
          <path d="m4.2 15.1 1.2-1.2" stroke="#f6e8cf" strokeWidth="1.5" strokeLinecap="round" />
          <path d="m6.8 17.7 1.1-1.1" stroke="#f6e8cf" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'soda':
      return (
        <svg className="food-trail-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3.5h4" stroke="#f5ead2" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M13 3.5v2l3 2" stroke="#f5ead2" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 7.5h8l-1 13h-6z" fill="#db5f5b" stroke="#973f3b" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M10 11.2c.8-.5 1.2-.5 2 0s1.2.5 2 0" stroke="#ffd8d8" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'hotpot':
      return (
        <svg className="food-trail-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 8h10v6a5 5 0 0 1-5 5 5 5 0 0 1-5-5z" fill="#cb6b4c" stroke="#8f4b2f" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M5.5 9.5h1.8M16.7 9.5h1.8" stroke="#8f4b2f" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M9 5.5c0 1 .8 1.2.8 2.2M12 4.8c0 1 .8 1.3.8 2.4M15 5.5c0 .9.7 1.2.7 2.1" stroke="#f7dfb3" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M9 11.6c1 .7 1.9.7 2.9 0 .9-.7 1.8-.7 2.8 0" stroke="#ffd8b0" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'skewer':
      return (
        <svg className="food-trail-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 18.5 20 5.5" stroke="#6d441f" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="8" cy="15.3" r="2" fill="#d96e4b" stroke="#94492b" strokeWidth="1.1" />
          <circle cx="11.8" cy="12.3" r="2" fill="#f0c14d" stroke="#9d7021" strokeWidth="1.1" />
          <circle cx="15.8" cy="9.2" r="2" fill="#6f8d49" stroke="#536936" strokeWidth="1.1" />
        </svg>
      )
  }
}

function Icon({
  name,
}: {
  name:
    | 'arrow-left'
    | 'calendar'
    | 'chevron-left'
    | 'chevron-right'
    | 'clock'
    | 'close'
    | 'cuisine'
    | 'email'
    | 'external-link'
    | 'graduation-cap'
    | 'location'
    | 'logout'
    | 'plus'
    | 'refresh'
    | 'search'
    | 'seats'
    | 'spark'
    | 'user'
}) {
  const commonProps = {
    'aria-hidden': true,
    className: 'inline-icon',
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
  }

  switch (name) {
    case 'arrow-left':
      return (
        <svg {...commonProps}>
          <path d="M19 12H5" />
          <path d="m10 17-5-5 5-5" />
        </svg>
      )
    case 'chevron-left':
      return (
        <svg {...commonProps}>
          <path d="m14.5 6.5-5 5 5 5" />
        </svg>
      )
    case 'chevron-right':
      return (
        <svg {...commonProps}>
          <path d="m9.5 6.5 5 5-5 5" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...commonProps}>
          <rect x="4" y="6" width="16" height="14" rx="3" />
          <path d="M8 4.5v3" />
          <path d="M16 4.5v3" />
          <path d="M4 10h16" />
        </svg>
      )
    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
      )
    case 'close':
      return (
        <svg {...commonProps}>
          <path d="M6 6 18 18" />
          <path d="M18 6 6 18" />
        </svg>
      )
    case 'email':
      return (
        <svg {...commonProps}>
          <rect x="4" y="6" width="16" height="12" rx="2.5" />
          <path d="m5.5 8 6.5 5 6.5-5" />
        </svg>
      )
    case 'graduation-cap':
      return (
        <svg {...commonProps}>
          <path d="m3.5 10 8.5-4.5 8.5 4.5-8.5 4.5-8.5-4.5Z" />
          <path d="M7 12.1v4.2c1.2.9 3 1.5 5 1.5s3.8-.6 5-1.5v-4.2" />
        </svg>
      )
    case 'cuisine':
      return (
        <svg {...commonProps}>
          <path d="M8 8.2c0-1.9 1.5-3.4 3.4-3.4 1.5 0 2.5.7 3.1 1.8" />
          <path d="M5.2 12.3h13.6c0 3.2-2.8 5.7-6.8 5.7s-6.8-2.5-6.8-5.7Z" />
          <path d="M12 12.3v-3.2" />
          <path d="M16.8 8.1c.6-.9 1.4-1.5 2.2-1.9" />
        </svg>
      )
    case 'spark':
      return (
        <svg {...commonProps}>
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <path d="M6.4 6.4 9 9" />
          <path d="m15 15 2.6 2.6" />
          <path d="m15 9 2.6-2.6" />
          <path d="M6.4 17.6 9 15" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...commonProps}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      )
    case 'refresh':
      return (
        <svg {...commonProps}>
          <path d="M19.5 11.75a7.75 7.75 0 1 1-2.06-5.27" />
          <path d="M19.5 5.25v4.5H15" />
        </svg>
      )
    case 'user':
      return (
        <svg {...commonProps}>
          <path d="M18 21a6 6 0 0 0-12 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...commonProps}>
          <path d="M10 17l-5-5 5-5" />
          <path d="M5 12h10" />
          <path d="M14 5h4v14h-4" />
        </svg>
      )
    case 'location':
      return (
        <svg {...commonProps}>
          <path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.3" />
        </svg>
      )
    case 'external-link':
      return (
        <svg {...commonProps}>
          <path d="M14 5h5v5" />
          <path d="M10 14 19 5" />
          <path d="M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8v4.4l2.8 1.8" />
        </svg>
      )
    case 'seats':
      return (
        <svg {...commonProps}>
          <path d="M6 18v-4.5A2.5 2.5 0 0 1 8.5 11h7A2.5 2.5 0 0 1 18 13.5V18" />
          <path d="M8 11V8.5a2 2 0 1 1 4 0V11" />
          <path d="M12 11V8a2 2 0 1 1 4 0v3" />
        </svg>
      )
  }
}

function ProfilePreview({ profile }: { profile: UserProfile | null }) {
  const name = profile?.name || 'Profile loading...'
  const email = profile?.email || 'Not added yet'
  const favoriteCuisine = profile?.favoriteCuisine || 'Cuisine not added'
  const yearOfStudy = profile?.yearOfStudy || 'Year not added'
  const initial = name.trim().charAt(0).toUpperCase() || 'P'
  const emailTextRef = useRef<HTMLSpanElement | null>(null)
  const [showEmailTooltip, setShowEmailTooltip] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)

  useEffect(() => {
    function checkEmailOverflow() {
      const element = emailTextRef.current
      if (!element) {
        setShowEmailTooltip(false)
        return
      }

      setShowEmailTooltip(element.scrollWidth > element.clientWidth)
    }

    checkEmailOverflow()
    window.addEventListener('resize', checkEmailOverflow)

    return () => window.removeEventListener('resize', checkEmailOverflow)
  }, [email])

  useEffect(() => {
    if (!emailCopied) {
      return
    }

    const timeout = window.setTimeout(() => {
      setEmailCopied(false)
    }, 1600)

    return () => window.clearTimeout(timeout)
  }, [emailCopied])

  async function handleEmailCopy() {
    if (!email || email === 'Not added yet') {
      return
    }

    try {
      await navigator.clipboard.writeText(email)
      setEmailCopied(true)
    } catch {
      setEmailCopied(false)
    }
  }

  return (
    <div className="profile-summary profile-preview-card">
      <div className="profile-preview-heading">
        <span className="profile-preview-heading-icon" aria-hidden="true">
          <Icon name="user" />
        </span>
        <SectionLabel className="profile-preview-kicker">Profile Preview</SectionLabel>
      </div>

      <div className="profile-preview-main">
        <div
          className="profile-preview-avatar"
          style={{ background: `linear-gradient(145deg, ${profile?.avatarColor || '#c17a3f'}, #9c582f)` }}
        >
          <span>{initial}</span>
        </div>

        <div className="profile-preview-copy">
          <strong>{name}</strong>
          <button
            className="profile-preview-email"
            onClick={() => void handleEmailCopy()}
            title={showEmailTooltip ? email : undefined}
            type="button"
          >
            <Icon name="email" />
            <span className="profile-preview-email-text" ref={emailTextRef}>
              {email}
            </span>
            {showEmailTooltip ? (
              <span className="profile-preview-email-tooltip">
                {email}
              </span>
            ) : null}
          </button>
          {emailCopied ? <span className="profile-preview-copy-toast">Copied to clipboard</span> : null}
          <div className="profile-chip-row">
            <span className={`profile-chip-badge ${profile?.favoriteCuisine ? '' : 'is-muted'}`}>
              <Icon name="cuisine" />
              {favoriteCuisine}
            </span>
            <span className={`profile-chip-badge ${profile?.yearOfStudy ? '' : 'is-muted'}`}>
              <Icon name="graduation-cap" />
              {yearOfStudy}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-preview-contact-card">
        <span className="profile-preview-contact-icon" aria-hidden="true">
          <Icon name="email" />
        </span>
        <div className="profile-preview-contact-copy">
          <p className="profile-preview-contact-label">Contact</p>
          <p className="profile-preview-contact-value">{email}</p>
        </div>
      </div>
    </div>
  )
}

function ActivitySessionCard({ session }: { session: MealSession }) {
  const copy = getSessionCopy(session)
  const statusLabel = getActivitySessionStatus(session)

  return (
    <Link className="activity-session-card" key={getSessionId(session)} to={`/sessions/${getSessionId(session)}`}>
      <div className="activity-session-top">
        <strong>{copy.title}</strong>
        <StatusChip className="activity-status-chip" warn={statusLabel !== 'Open'}>
          {statusLabel}
        </StatusChip>
      </div>
      <div className="activity-session-meta">
        <span className="activity-meta-item">
          <Icon name="location" />
          <span>{copy.location}</span>
        </span>
        <span aria-hidden="true" className="meta-divider">·</span>
        <span className="activity-meta-item">
          <Icon name="clock" />
          <span>{formatDateTime(session.time)}</span>
        </span>
      </div>
      <div className="activity-session-footer">
        <span className="activity-meta-item">
          <Icon name="seats" />
          <span>{session.participants.length} / {session.slots} people</span>
        </span>
      </div>
    </Link>
  )
}

function ActivityColumn({
  title,
  sessions,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: {
  title: string
  sessions: MealSession[]
  emptyTitle: string
  emptyDescription: string
  emptyAction?: ReactNode
}) {
  return (
    <section className="activity-column">
      <div className="activity-column-header">
        <h3>{title}</h3>
        <span>{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}</span>
      </div>

      {sessions.length === 0 ? (
        <div className="activity-column-empty">
          <strong>{emptyTitle}</strong>
          <p>{emptyDescription}</p>
          {emptyAction}
        </div>
      ) : (
        <div className="activity-column-body">
          <div className="activity-session-list">
            {sessions.map((session) => (
              <ActivitySessionCard key={getSessionId(session)} session={session} />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function LeafletMapResizeWatcher() {
  const map = useMap()

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      map.invalidateSize()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [map])

  return null
}

function MapPreview({
  location,
  latitude,
  longitude,
}: {
  location: string
  latitude: number
  longitude: number
}) {
  const position: [number, number] = [latitude, longitude]
  const openInMapsHref =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const isModalVisible = isExpanded || isClosing

  function openModal() {
    setIsClosing(false)
    setIsExpanded(true)
  }

  function closeModal() {
    setIsClosing(true)
    window.setTimeout(() => {
      setIsExpanded(false)
      setIsClosing(false)
    }, 180)
  }

  useEffect(() => {
    if (!isModalVisible) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalVisible])

  return (
    <>
      <div className="map-preview-shell">
        <button
          aria-label="Open larger map"
          className="map-preview-frame map-preview-button"
          onClick={openModal}
          type="button"
        >
          <MapContainer center={position} className="leaflet-map" scrollWheelZoom={false} zoom={14} zoomControl={false}>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              maxZoom={20}
              subdomains="abcd"
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <Marker icon={brandMapMarker} position={position} />
          </MapContainer>
          <div aria-hidden="true" className="map-preview-overlay" />
          <span className="map-preview-hint">Click to enlarge</span>
        </button>

        <div className="map-heading">
          <p className="muted-text">Pin is based on the session location.</p>
          <a className="secondary-link map-open-button" href={openInMapsHref} rel="noreferrer" target="_blank">
            <Icon name="external-link" />
            Open in Maps
          </a>
        </div>
      </div>

      {isModalVisible
        ? createPortal(
            <div
              className={`map-modal-overlay ${isClosing ? 'is-closing' : 'is-open'}`}
              onClick={closeModal}
              role="presentation"
            >
              <div
                aria-modal="true"
                className={`map-modal-card ${isClosing ? 'is-closing' : 'is-open'}`}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
              >
                <div className="map-modal-header">
                  <div>
                    <h3>Session location</h3>
                    <p>{location}</p>
                  </div>
                  <button
                    aria-label="Close map"
                    className="ghost-button map-modal-close"
                    onClick={closeModal}
                    type="button"
                  >
                    <Icon name="close" />
                  </button>
                </div>

                <div className="map-modal-frame">
                  <MapContainer center={position} className="leaflet-map leaflet-map-expanded" scrollWheelZoom zoom={15}>
                    <LeafletMapResizeWatcher />
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                      maxZoom={20}
                      subdomains="abcd"
                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <Marker icon={brandMapMarker} position={position} />
                  </MapContainer>
                  <div aria-hidden="true" className="map-preview-overlay" />
                </div>

                <div className="map-modal-footer">
                  <a className="secondary-link map-open-button" href={openInMapsHref} rel="noreferrer" target="_blank">
                    <Icon name="external-link" />
                    Open in Maps
                  </a>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

function DateTimeField({
  minimum,
  value,
  onChange,
}: {
  minimum: string
  value: string
  onChange: (value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)
  const [popoverStyle, setPopoverStyle] = useState<{ top: number; left: number; width: number } | null>(null)
  const selectedDateTime = parseDateTimeLocalValue(value)
  const minimumDateTime = parseDateTimeLocalValue(minimum) ?? new Date()
  const selectedTime = selectedDateTime ? formatTimeInputValue(selectedDateTime) : ''
  const [visibleMonth, setVisibleMonth] = useState<Date>(selectedDateTime ?? minimumDateTime)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (!wrapperRef.current?.contains(target) && !popoverRef.current?.contains(target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    function updatePopoverPosition() {
      const trigger = triggerRef.current
      if (!trigger) {
        return
      }

      const rect = trigger.getBoundingClientRect()
      const desiredWidth = Math.max(rect.width, 332)
      const maxWidth = Math.min(desiredWidth, window.innerWidth - 24)
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - maxWidth - 12)
      const top = rect.bottom + 8

      setPopoverStyle({
        top,
        left,
        width: maxWidth,
      })
    }

    updatePopoverPosition()
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', updatePopoverPosition)
    window.addEventListener('scroll', updatePopoverPosition, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', updatePopoverPosition)
      window.removeEventListener('scroll', updatePopoverPosition, true)
    }
  }, [isOpen])

  function handleDateSelect(day?: Date) {
    if (!day) {
      return
    }

    const nextDate = mergeDateAndTime(day, selectedTime || formatTimeInputValue(minimumDateTime))
    onChange(nextDate)
    setVisibleMonth(day)
    setIsOpen(false)
  }

  function handleTimeChange(nextTime: string) {
    const baseDate = selectedDateTime ?? minimumDateTime
    onChange(mergeDateAndTime(baseDate, nextTime))
  }

  return (
    <div className="datetime-field" ref={wrapperRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="datetime-trigger"
        onClick={() => setIsOpen((current) => !current)}
        ref={triggerRef}
        type="button"
      >
        <span className="datetime-trigger-icon" aria-hidden="true">
          <Icon name="calendar" />
        </span>
        <span className={`datetime-trigger-copy ${selectedDateTime ? '' : 'is-placeholder'}`}>
          {selectedDateTime ? formatDateForPicker(selectedDateTime) : 'Choose a date'}
        </span>
      </button>

      {isOpen && popoverStyle
        ? createPortal(
            <div className="datepicker-popover" ref={popoverRef} role="dialog" style={popoverStyle}>
              <DayPicker
                className="platemates-daypicker"
                components={{
                  Chevron: ({ orientation, className }) => (
                    <span className={className} aria-hidden="true">
                      <Icon name={orientation === 'left' ? 'chevron-left' : 'chevron-right'} />
                    </span>
                  ),
                }}
                disabled={{ before: new Date(minimumDateTime.getFullYear(), minimumDateTime.getMonth(), minimumDateTime.getDate()) }}
                mode="single"
                month={selectedDateTime ?? visibleMonth}
                onMonthChange={setVisibleMonth}
                onSelect={handleDateSelect}
                selected={selectedDateTime ?? undefined}
                showOutsideDays
                styles={{
                  month_caption: { fontWeight: '600' },
                }}
              />
            </div>,
            document.body,
          )
        : null}

      <label className="datetime-time-field">
        <span>Time</span>
        <input min={selectedDateTime ? undefined : formatTimeInputValue(minimumDateTime)} onChange={(event) => handleTimeChange(event.target.value)} required type="time" value={selectedTime} />
      </label>
    </div>
  )
}

function AuthPage({
  authError,
  authForm,
  authLoading,
  mode,
  onAuthFormChange,
  onSubmit,
}: AuthPageProps) {
  return (
    <main className="auth-layout">
      <GlassCard className="auth-page-card">
        <div className="auth-panel">
          <aside className="auth-showcase">
            <div className="auth-showcase-header">
              <div className="brand-lockup">
                <BrandLogo />
                <div>
                  <strong>Platemates</strong>
                  <span>Shared meals for Auckland students.</span>
                </div>
              </div>
            </div>

            <div className="auth-showcase-copy">
              <p className="section-kicker">Private dining circle</p>
              <h1>{mode === 'login' ? 'Return to your table.' : 'Reserve your place.'}</h1>
              <p className="hero-copy">
                A quieter way to organise shared meals, with thoughtful hosts, elegant scheduling, and
                less friction between intent and arrival.
              </p>
            </div>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span className="meta-icon">
                  <Icon name="spark" />
                </span>
                <div>
                  <strong>Curated plans</strong>
                  <p>Minimal interfaces for quick decisions and calm logistics.</p>
                </div>
              </div>
              <div className="auth-feature-item">
                <span className="meta-icon">
                  <Icon name="clock" />
                </span>
                <div>
                  <strong>Time-aware sessions</strong>
                  <p>See what is happening next without scanning noisy cards.</p>
                </div>
              </div>
              <div className="auth-feature-item">
                <span className="meta-icon">
                  <Icon name="location" />
                </span>
                <div>
                  <strong>Local by design</strong>
                  <p>Every plan is anchored around real Auckland locations and availability.</p>
                </div>
              </div>
            </div>
          </aside>

          <div className="auth-form-shell">
            <div className="auth-form-header">
              <div>
                <p className="section-kicker">{mode === 'login' ? 'Welcome back' : 'New member'}</p>
                <h2>{mode === 'login' ? 'Sign in' : 'Create account'}</h2>
              </div>
              <span className="pill auth-pill">{mode === 'login' ? 'Member access' : 'Join now'}</span>
            </div>

            <form className="stack-form" onSubmit={(event) => void onSubmit(event, mode)}>
              {mode === 'register' ? (
                <label>
                  <span>Name</span>
                  <input
                    onChange={(event) => onAuthFormChange('name', event.target.value)}
                    placeholder="Your full name"
                    required
                    value={authForm.name}
                  />
                </label>
              ) : null}

              <label>
                <span>University email</span>
                <input
                  onChange={(event) => onAuthFormChange('email', event.target.value)}
                  placeholder="abcd123@aucklanduni.ac.nz"
                  required
                  type="email"
                  value={authForm.email}
                />
              </label>

              {mode === 'register' ? (
                <p className="field-hint">Use your UPI email, for example abcd123@aucklanduni.ac.nz.</p>
              ) : null}

              <label>
                <span>Password</span>
                <input
                  onChange={(event) => onAuthFormChange('password', event.target.value)}
                  placeholder="Enter your password"
                  required
                  type="password"
                  value={authForm.password}
                />
              </label>

              {authError ? <p className="feedback error">{authError}</p> : null}

              <button className="primary-button" disabled={authLoading} type="submit">
                {authLoading ? 'Working...' : mode === 'login' ? 'Continue' : 'Create account'}
              </button>
            </form>

            <p className="auth-switch-text">
              {mode === 'login' ? 'Need an account?' : 'Already have an account?'}{' '}
              <Link className="inline-link" to={mode === 'login' ? '/register' : '/login'}>
                {mode === 'login' ? 'Register' : 'Login'}
              </Link>
            </p>
          </div>
        </div>
      </GlassCard>
    </main>
  )
}

function DashboardPage({
  actionSessionId,
  currentUserId,
  globalNotice,
  joinedSession,
  onRefresh,
  onSearchChange,
  onSessionAction,
  onSortModeChange,
  searchQuery,
  sessionError,
  sessionLoading,
  sessions,
  sortMode,
}: DashboardPageProps) {
  const activeSessionTitle = joinedSession ? getSessionCopy(joinedSession).title : null
  const activeSessionId = joinedSession ? getSessionId(joinedSession) : null

  return (
    <main className="page-shell dashboard-shell">
      <GlassCard className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <SectionLabel>Dashboard</SectionLabel>
          <h1>Find a table, share a meal.</h1>
          <p className="hero-copy">
            Browse student meal plans around Auckland and join one that fits your time, place, and
            vibe.
          </p>
          <div className="dashboard-hero-actions">
            <Link className="primary-button" to="/create-session">
              <Icon name="plus" />
              Create Session
            </Link>
            <button className="ghost-button" disabled={sessionLoading} onClick={() => void onRefresh()} type="button">
              <Icon name="spark" />
              {sessionLoading ? 'Refreshing...' : 'Browse Sessions'}
            </button>
          </div>
        </div>
      </GlassCard>

      <section className="dashboard-main-grid">
        <GlassCard className="page-card dashboard-list-panel">
          <div className="dashboard-list-header">
            <div>
              <SectionLabel>Sessions</SectionLabel>
              <h2>Active meal sessions</h2>
            </div>
            <div className="dashboard-list-controls">
              <label className="sort-field sort-field-enhanced">
                <span className="sr-only">Sort by</span>
                <select onChange={(event) => onSortModeChange(event.target.value as SortMode)} value={sortMode}>
                  <option value="soonest">Soonest</option>
                  <option value="latest">Newest posts</option>
                  <option value="most-slots">Most open slots</option>
                </select>
              </label>
              <button
                className="ghost-button toolbar-button toolbar-refresh-button"
                disabled={sessionLoading}
                onClick={() => void onRefresh()}
                type="button"
              >
                <Icon name="refresh" />
                {sessionLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="toolbar toolbar-stacked">
            <label className="search-field search-field-enhanced">
              <span aria-hidden="true" className="search-field-icon">
                <Icon name="search" />
              </span>
              <span className="sr-only">Search sessions</span>
              <input
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search food, suburb, time, or vibe"
                value={searchQuery}
              />
              {searchQuery ? (
                <button
                  aria-label="Clear search"
                  className="search-clear-button"
                  onClick={() => onSearchChange('')}
                  type="button"
                >
                  <Icon name="close" />
                </button>
              ) : null}
            </label>
          </div>

          {sessionError ? <p className="feedback error">{sessionError}</p> : null}
          {globalNotice ? <p className="feedback success">{globalNotice}</p> : null}

          {sessionLoading ? (
            <EmptyState description="Fetching the latest meal invites from the backend." title="Loading sessions..." />
          ) : sessions.length === 0 ? (
            <EmptyState
              action={
                <Link className="primary-button" to="/create-session">
                  Create the first session
                </Link>
              }
              className="dashboard-empty-state"
              description="Start the first plan and invite others to share a table."
              icon={<BrandLogo />}
              secondaryText="New sessions will appear here when other students create plans."
              title="No meal sessions yet"
            />
          ) : (
            <div className="session-grid">
              {sessions.map((session) => {
                const sessionId = getSessionId(session)
                const participantCount = session.participants.length
                const participantLabel = `${participantCount} / ${session.slots}`
                const actionState = getSessionActionState(session, currentUserId, joinedSession)
                const copy = getSessionCopy(session)

                return (
                  <article className="session-card" key={sessionId}>
                    <Link className="session-card-body session-card-link" to={`/sessions/${sessionId}`}>
                      <div className="session-card-top">
                        <StatusChip warn={actionState.label === 'Session Full'}>{actionState.badge}</StatusChip>
                        <span className="session-card-link-copy">View details</span>
                      </div>
                      <h3>{copy.title}</h3>
                      <div className="session-card-meta session-card-meta-compact">
                        <div className="meta-inline">
                          <span aria-hidden="true" className="meta-icon">
                            <Icon name="location" />
                          </span>
                          <span>{copy.location}</span>
                        </div>
                        <div className="meta-inline">
                          <span aria-hidden="true" className="meta-icon">
                            <Icon name="clock" />
                          </span>
                          <span>{formatDateTime(session.time)}</span>
                        </div>
                        <div className="meta-inline">
                          <span aria-hidden="true" className="meta-icon">
                            <Icon name="seats" />
                          </span>
                          <span>{participantLabel} joined</span>
                        </div>
                      </div>
                      <p>{copy.description}</p>
                      <dl className="meta-list meta-list-compact">
                        <div>
                          <dt>Host</dt>
                          <dd>{getCreatorName(session.creator)}</dd>
                        </div>
                      </dl>
                    </Link>

                    <div className="session-card-actions">
                      <Link className="secondary-link" to={`/sessions/${sessionId}`}>
                        View
                      </Link>
                      <button
                        className={`primary-button ${actionState.action === 'leave' ? 'danger-button' : ''}`}
                        disabled={actionState.disabled || actionSessionId === sessionId}
                        onClick={() => void onSessionAction(sessionId, actionState.action)}
                        type="button"
                      >
                        {actionSessionId === sessionId
                          ? actionState.action === 'join'
                            ? 'Joining...'
                            : 'Leaving...'
                          : actionState.label}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </GlassCard>

        <aside className="dashboard-sidebar">
          <GlassCard className="summary-card status-card">
            <span className="status-label">Your status</span>
            <div className="status-card-copy">
              <strong>{joinedSession ? '1 active session' : 'No active session yet'}</strong>
              <p>{joinedSession ? activeSessionTitle : 'Browse open tables or create a new plan to get started.'}</p>
            </div>
            {joinedSession && activeSessionId ? (
              <Link className="primary-button status-card-cta" to={`/sessions/${activeSessionId}`}>
                Open session
              </Link>
            ) : (
              <Link className="primary-button status-card-cta" to="/create-session">
                Create session
              </Link>
            )}
          </GlassCard>

          <GlassCard className="summary-card quick-actions-card">
            <span className="status-label">Quick actions</span>
            <Link className="primary-button quick-actions-primary" to="/create-session">
              <Icon name="plus" />
              Create session
            </Link>
            <button
              className="secondary-link quick-actions-secondary"
              disabled={sessionLoading}
              onClick={() => void onRefresh()}
              type="button"
            >
              <Icon name="refresh" />
              {sessionLoading ? 'Refreshing sessions...' : 'Refresh sessions'}
            </button>
            <Link className="ghost-button quick-actions-ghost" to="/profile">
              <Icon name="user" />
              View profile
            </Link>
          </GlassCard>
        </aside>
      </section>
    </main>
  )
}

function SessionDetailsPage({
  actionSessionId,
  currentUserId,
  joinedSession,
  onRefresh,
  onSessionAction,
  sessionError,
  sessionLoading,
  sessions,
}: SessionDetailsPageProps) {
  const { sessionId } = useParams()
  const [fetchedSession, setFetchedSession] = useState<MealSession | null>(() =>
    sessions.find((item) => getSessionId(item) === sessionId) ?? null,
  )
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [detailNotice, setDetailNotice] = useState('')

  useEffect(() => {
    if (!sessionId) {
      return
    }

    let cancelled = false

    async function loadSessionDetails() {
      setDetailLoading(true)
      setDetailError('')

      try {
        const data = await fetchJson<{ data: MealSession[] }>(`${API_BASE_URL}/api/meals`)
        if (cancelled) {
          return
        }

        const matchedSession = data.data.map(normalizeMealSession).find((item) => getSessionId(item) === sessionId)
        setFetchedSession(matchedSession ?? null)
      } catch (error) {
        if (!cancelled) {
          setDetailError(getErrorMessage(error))
        }
      } finally {
        if (!cancelled) {
          setDetailLoading(false)
        }
      }
    }

    void loadSessionDetails()

    return () => {
      cancelled = true
    }
  }, [sessionId])

  const session = useMemo(
    () => sessions.find((item) => getSessionId(item) === sessionId) ?? fetchedSession,
    [fetchedSession, sessionId, sessions],
  )

  const coordinates = useSessionCoordinates(session?.location ?? '', session?.locationLat, session?.locationLng)

  async function handleDetailsAction(action: SessionAction) {
    if (!session) {
      return
    }

    setDetailError('')

    try {
      const updatedSession = await onSessionAction(getSessionId(session), action)
      if (updatedSession) {
        setFetchedSession(updatedSession)
      }
      setDetailNotice(action === 'join' ? 'Joined session successfully.' : 'Left session successfully.')
      await onRefresh()
    } catch (error) {
      setDetailError(getErrorMessage(error))
    }
  }

  if (sessionLoading || detailLoading) {
    return (
      <main className="details-layout">
        <GlassCard className="details-page-card">
          <EmptyState description="Fetching the latest session data before showing details." title="Loading session..." />
        </GlassCard>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="details-layout">
        <GlassCard className="details-page-card">
          <EmptyState
            action={
              <Link className="secondary-link" to="/dashboard">
                Back to Dashboard
              </Link>
            }
            description="This session may have been deleted or has not loaded yet."
            title="Session not found"
          />
        </GlassCard>
      </main>
    )
  }

  const actionState = getSessionActionState(session, currentUserId, joinedSession)
  const isHost = getParticipantId(session.creator) === currentUserId
  const remainingSpots = Math.max(getRemainingSlots(session), 0)
  const isFull = remainingSpots <= 0
  const isClosed = actionState.label === 'Session Closed'
  const copy = getSessionCopy(session)
  const summaryStatus = isClosed
    ? 'Closed'
    : isFull
      ? 'Full · 0 spots left'
      : `Open · ${remainingSpots} spot${remainingSpots === 1 ? '' : 's'} left`
  const summaryAction = isHost
    ? null
    : {
        className: `primary-button ${actionState.action === 'leave' ? 'danger-button' : ''}`,
        disabled: actionState.disabled || actionSessionId === getSessionId(session),
        label:
          actionSessionId === getSessionId(session)
            ? actionState.action === 'join'
              ? 'Joining...'
              : 'Leaving...'
            : actionState.label,
        onClick: () => void handleDetailsAction(actionState.action),
      }

  return (
    <main className="page-shell details-layout">
      <GlassCard className="details-page-card">
        <Link className="inline-link details-back-link" to="/dashboard">
          <Icon name="arrow-left" />
          Back to Dashboard
        </Link>

        {sessionError ? <p className="feedback error">{sessionError}</p> : null}
        {detailError ? <p className="feedback error">{detailError}</p> : null}
        {detailNotice ? <p className="feedback success">{detailNotice}</p> : null}
        {isClosed ? <div className="details-status-banner">This session is closed and no longer accepting joins.</div> : null}

        <div className="details-page-grid">
          <div className="details-column">
            <section className="details-hero">
              <div className="details-hero-heading">
                <div className="details-hero-copy">
                  <div className="details-summary-topline">
                    <h2>{copy.title || 'Untitled session'}</h2>
                    {isClosed ? (
                      <StatusChip className="details-summary-chip" warn>
                        Closed
                      </StatusChip>
                    ) : null}
                  </div>
                  <p className="details-status-line">{summaryStatus}</p>
                </div>
                {summaryAction ? (
                  <div className="details-hero-actions">
                    <button
                      className={summaryAction.className}
                      disabled={summaryAction.disabled}
                      onClick={summaryAction.onClick}
                      type="button"
                    >
                      {summaryAction.label}
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="details-meta-row">
                <div className="meta-inline">
                  <span aria-hidden="true" className="meta-icon">
                    <Icon name="location" />
                  </span>
                  <span>{copy.location}</span>
                  <span aria-hidden="true" className="meta-divider">·</span>
                  <span className="meta-icon">
                    <Icon name="clock" />
                  </span>
                  <span>{formatDateTime(session.time)}</span>
                  <span aria-hidden="true" className="meta-divider">·</span>
                  <span className="meta-icon">
                    <Icon name="seats" />
                  </span>
                  <span>{session.participants.length}/{session.slots} joined</span>
                </div>
              </div>
              <p className="details-host-line">
                <span aria-hidden="true" className="meta-icon">
                  <Icon name="user" />
                </span>
                Hosted by <strong>{getCreatorName(session.creator)}</strong>
              </p>
            </section>

            <section className="details-section">
              <h3>Description</h3>
              <p>{copy.description}</p>
            </section>

            <section className="details-section participant-panel">
              <h3>Participants</h3>
              {session.participants.length === 0 ? (
                <p className="muted-text">No participants yet.</p>
              ) : (
                <div className="participant-list">
                  {session.participants.map((participant, index) => {
                    const name =
                      typeof participant === 'string'
                        ? `Participant ${index + 1}`
                        : participant.name || participant.email || `Participant ${index + 1}`
                    return (
                      <div className="participant-item" key={`${getParticipantId(participant)}-${index}`}>
                        <span
                          className="avatar-dot"
                          style={{
                            backgroundColor:
                              typeof participant === 'string'
                                ? '#2e7d61'
                                : participant.avatarColor || '#2e7d61',
                          }}
                        />
                        <span>{name}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="map-card">
            <div className="map-card-header">
              <h3>Map</h3>
            </div>
            <MapPreview latitude={coordinates.lat} location={session.location} longitude={coordinates.lng} />
          </aside>
        </div>
      </GlassCard>
    </main>
  )
}

function CreateSessionPage({
  onCreateSession,
  onSessionFormChange,
  sessionError,
  sessionForm,
  submittingSession,
}: CreateSessionPageProps) {
  const slotCount = Number(sessionForm.slots) || 2
  const decreaseSlots = () => onSessionFormChange('slots', String(Math.max(2, slotCount - 1)))
  const increaseSlots = () => onSessionFormChange('slots', String(Math.min(12, slotCount + 1)))

  return (
    <main className="page-shell create-page-shell">
      <GlassCard className="page-card create-page-card">
        <div className="create-page-header">
          <Link className="inline-link create-back-link" to="/dashboard">
            <Icon name="arrow-left" />
            Back to dashboard
          </Link>
          <div>
            <SectionLabel>Create Session</SectionLabel>
            <h2>Start a new meal plan</h2>
            <p className="muted-text">Set the place, time, and group size.</p>
          </div>
        </div>

        {sessionError ? <p className="feedback error">{sessionError}</p> : null}

        <form className="stack-form create-flow-form" onSubmit={onCreateSession}>
          <label className="create-primary-field">
            <span>Title</span>
            <input
              onChange={(event) => onSessionFormChange('title', event.target.value)}
              placeholder="Hotpot on Dominion Road"
              required
              value={sessionForm.title}
            />
          </label>

          <label>
            <span>Location</span>
            <input
              onChange={(event) => onSessionFormChange('location', event.target.value)}
              placeholder="Dominion Road, Auckland"
              required
              value={sessionForm.location}
            />
          </label>

          <div className="create-section-group">
            <div className="create-section-heading">
              <span>Time &amp; group size</span>
            </div>

            <div className="form-row create-form-row">
              <div className="field-shell">
                <span>Time</span>
                <DateTimeField
                  minimum={getDateTimeLocalMinimum()}
                  onChange={(value) => onSessionFormChange('time', value)}
                  value={sessionForm.time}
                />
              </div>

              <div className="field-shell">
                <span>Group size</span>
                <div className="slot-stepper" role="group" aria-label="Group size">
                  <button
                    aria-label="Decrease group size"
                    className="slot-stepper-button"
                    disabled={slotCount <= 2}
                    onClick={decreaseSlots}
                    type="button"
                  >
                    −
                  </button>
                  <div className="slot-stepper-value" aria-live="polite">
                    <strong>{slotCount}</strong>
                    <span>people</span>
                  </div>
                  <button
                    aria-label="Increase group size"
                    className="slot-stepper-button"
                    disabled={slotCount >= 12}
                    onClick={increaseSlots}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <label>
            <span>Description <em>(optional)</em></span>
            <textarea
              onChange={(event) => onSessionFormChange('description', event.target.value)}
              placeholder="Looking for 3 people to share dishes after class."
              rows={4}
              value={sessionForm.description}
            />
          </label>

          <input name="slots" type="hidden" value={sessionForm.slots} />

          <button className="primary-button create-submit-button" disabled={submittingSession} type="submit">
            {submittingSession ? 'Creating...' : 'Create Session'}
          </button>
        </form>
      </GlassCard>
    </main>
  )
}

function ProfilePage({
  currentUserId,
  globalNotice,
  handleProfileSubmit,
  onProfileFieldChange,
  profile,
  profileError,
  profileForm,
  profileLoading,
  profileSaving,
  sessions,
}: ProfilePageProps) {
  const hostingSessions = useMemo(
    () => sessions.filter((session) => getParticipantId(session.creator) === currentUserId),
    [currentUserId, sessions],
  )
  const joinedSessions = useMemo(
    () =>
      sessions.filter((session) =>
        session.participants.some((participant) => getParticipantId(participant) === currentUserId),
      ),
    [currentUserId, sessions],
  )

  return (
    <main className="page-grid">
      <GlassCard className="page-card">
        <PageHeader eyebrow="Profile" title="Manage your account" />

        {profileError ? <p className="feedback error">{profileError}</p> : null}
        {globalNotice ? <p className="feedback success">{globalNotice}</p> : null}

        <div className="profile-layout">
          <form className="stack-form profile-form" onSubmit={handleProfileSubmit}>
            <label>
              <span>Name</span>
              <input
                disabled={profileLoading || profileSaving}
                onChange={(event) => onProfileFieldChange('name', event.target.value)}
                value={profileForm.name}
              />
            </label>

            <label>
              <span>Bio</span>
              <textarea
                disabled={profileLoading || profileSaving}
                onChange={(event) => onProfileFieldChange('bio', event.target.value)}
                rows={4}
                value={profileForm.bio}
              />
            </label>

            <div className="form-row">
              <label>
                <span>Favorite cuisine</span>
                <select
                  className="profile-select"
                  disabled={profileLoading || profileSaving}
                  onChange={(event) => onProfileFieldChange('favoriteCuisine', event.target.value)}
                  value={profileForm.favoriteCuisine}
                >
                  <option value="">Select a cuisine</option>
                  {CUISINE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Year of study</span>
                <select
                  className="profile-select"
                  disabled={profileLoading || profileSaving}
                  onChange={(event) => onProfileFieldChange('yearOfStudy', event.target.value)}
                  value={profileForm.yearOfStudy}
                >
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="swatch-field">
              <span>Avatar accent</span>
              <div className="swatch-row" role="radiogroup" aria-label="Avatar accent">
                {AVATAR_SWATCHES.map((swatch) => {
                  const isSelected = profileForm.avatarColor === swatch
                  return (
                    <button
                      aria-label={`Choose ${swatch} accent`}
                      aria-checked={isSelected}
                      className={`swatch-button ${isSelected ? 'is-selected' : ''}`}
                      disabled={profileLoading || profileSaving}
                      key={swatch}
                      onClick={() => onProfileFieldChange('avatarColor', swatch)}
                      role="radio"
                      style={{ backgroundColor: swatch }}
                      type="button"
                    />
                  )
                })}
              </div>
            </label>

            <button className="primary-button profile-save-button" disabled={profileLoading || profileSaving} type="submit">
              {profileSaving ? 'Saving profile...' : 'Save profile'}
            </button>
          </form>

          <ProfilePreview profile={profile} />
        </div>
      </GlassCard>

      <GlassCard className="page-card">
        <PageHeader eyebrow="My activity" title="Hosted and joined sessions" />
        <div className="activity-grid">
          <ActivityColumn
            emptyDescription="Hosted sessions will appear here once you create a plan."
            emptyTitle="No hosted sessions yet"
            sessions={hostingSessions}
            title="Hosting"
          />
          <ActivityColumn
            emptyAction={
              <Link className="secondary-link activity-empty-action" to="/dashboard">
                Browse sessions
              </Link>
            }
            emptyDescription="Sessions you join will appear here."
            emptyTitle="No joined sessions yet"
            sessions={joinedSessions}
            title="Joined"
          />
        </div>
      </GlassCard>
    </main>
  )
}

function useSessionCoordinates(location: string, explicitLat?: number, explicitLng?: number) {
  const explicitCoordinates = useMemo(
    () =>
      Number.isFinite(explicitLat) && Number.isFinite(explicitLng)
        ? { lat: explicitLat as number, lng: explicitLng as number, source: 'fallback' as const }
        : null,
    [explicitLat, explicitLng],
  )
  const fallbackCoordinates = useMemo(() => getFallbackCoordinates(location), [location])
  const [geocodedCoordinates, setGeocodedCoordinates] = useState<(Coordinates & { query: string }) | null>(null)

  useEffect(() => {
    if (explicitCoordinates || !location.trim()) {
      return
    }

    const controller = new AbortController()

    void fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Unable to geocode location.')
        }

        const results = (await response.json()) as Array<{ lat: string; lon: string }>
        const first = results[0]
        if (!first) {
          return
        }

        setGeocodedCoordinates({
          lat: Number(first.lat),
          lng: Number(first.lon),
          source: 'geocoded',
          query: location,
        })
      })
      .catch(() => {
        setGeocodedCoordinates(null)
      })

    return () => {
      controller.abort()
    }
  }, [explicitCoordinates, location])

  return explicitCoordinates ?? (geocodedCoordinates?.query === location ? geocodedCoordinates : null) ?? fallbackCoordinates
}

function readStoredProfile() {
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return normalizeUserProfile(JSON.parse(raw) as Partial<UserProfile>)
  } catch {
    return null
  }
}

function persistProfile(profile: UserProfile) {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
}

async function fetchJson<T>(
  url: string,
  options?: {
    method?: 'GET' | 'POST' | 'PATCH'
    body?: Record<string, unknown>
    token?: string
  },
): Promise<T> {
  const response = await fetch(url, {
    method: options?.method ?? 'GET',
    headers: {
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options?.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  })

  const text = await response.text()
  const data = text ? (JSON.parse(text) as Record<string, unknown>) : {}

  if (!response.ok) {
    throw new Error(typeof data.message === 'string' ? data.message : 'Request failed')
  }

  return data as T
}

function normalizeMealSession(session: MealSession) {
  const rawLocation = session.location as unknown
  const normalizedLocation =
    typeof rawLocation === 'string'
      ? rawLocation
      : typeof rawLocation === 'object' && rawLocation && 'address' in rawLocation
        ? String((rawLocation as { address?: string }).address || '')
        : ''
  const locationLat =
    typeof rawLocation === 'object' && rawLocation && 'lat' in rawLocation
      ? Number((rawLocation as { lat?: number }).lat)
      : undefined
  const locationLng =
    typeof rawLocation === 'object' && rawLocation && 'lng' in rawLocation
      ? Number((rawLocation as { lng?: number }).lng)
      : undefined

  return {
    ...session,
    id: session.id || session._id || '',
    location: normalizedLocation,
    locationLat: Number.isFinite(locationLat) ? locationLat : undefined,
    locationLng: Number.isFinite(locationLng) ? locationLng : undefined,
  }
}

function getSessionCopy(session: MealSession) {
  const title = session.title.trim()
  const description = session.description.trim()
  const location = session.location.trim()

  const titleLooksLikeTest =
    /^(ass|dd|fffff+|发发发|test|debug dinner|verification dinner)$/i.test(title) ||
    /^([a-zA-Z])\1{2,}$/.test(title)

  const descriptionLooksLikeTest =
    /integration test meal|re-test after proposal-aligned frontend changes|test/i.test(description) ||
    /^([a-zA-Z])\1{3,}$/.test(description)

  const locationLooksLikePlaceholder =
    !location || /^(d|dd|s|test|tbd|todo|na|n\/a)$/i.test(location) || /^([a-zA-Z])\1{1,}$/.test(location)

  const locationFallback = locationLooksLikePlaceholder ? 'Location not specified' : location

  return {
    title: titleLooksLikeTest ? 'Late-night noodles' : title || 'Untitled session',
    description: descriptionLooksLikeTest
      ? 'Looking for students to share hotpot after class.'
      : description,
    location: locationFallback,
  }
}

function getActivitySessionStatus(session: MealSession) {
  if (!session.isActive || new Date(session.time).getTime() <= Date.now()) {
    return 'Closed'
  }

  if (getRemainingSlots(session) <= 0) {
    return 'Full'
  }

  return 'Open'
}

function toProfileForm(profile: UserProfile): ProfileFormState {
  return {
    name: profile.name || '',
    bio: profile.bio || '',
    favoriteCuisine: profile.favoriteCuisine || '',
    yearOfStudy: profile.yearOfStudy || '',
    avatarColor: profile.avatarColor || '#2e7d61',
  }
}

function normalizeUserProfile(user: Partial<UserProfile> & Partial<SessionUser>) {
  return {
    id: user.id || user._id || '',
    name: user.name || 'Auckland Student',
    email: user.email || '',
    bio: 'Shared table enthusiast.',
    favoriteCuisine: 'Hotpot',
    yearOfStudy: 'Year 3',
    avatarColor: user.avatarColor || '#2e7d61',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function getParticipantId(participant: SessionUser | string) {
  if (typeof participant === 'string') {
    return participant
  }

  return participant.id || participant._id || ''
}

function getSessionId(session: MealSession) {
  return session.id || session._id || ''
}

function getCreatorName(creator: SessionUser | string) {
  if (typeof creator === 'string') {
    return creator
  }

  return creator.name || creator.email || creator._id || 'Unknown host'
}

function getRemainingSlots(session: MealSession) {
  return session.slots - session.participants.length
}

function getSessionActionState(
  session: MealSession,
  currentUserId: string | null,
  joinedSession: MealSession | null,
) {
  if (!session.isActive || new Date(session.time).getTime() <= Date.now()) {
    return {
      action: 'join' as SessionAction,
      badge: 'Closed',
      disabled: true,
      label: 'Session Closed',
    }
  }

  const isJoined = session.participants.some(
    (participant) => getParticipantId(participant) === currentUserId,
  )
  const isFull = getRemainingSlots(session) <= 0
  const isInOtherSession =
    Boolean(joinedSession) && getSessionId(joinedSession ?? session) !== getSessionId(session)

  if (isJoined) {
    return {
      action: 'leave' as SessionAction,
      badge: `${getRemainingSlots(session)} spots left`,
      disabled: false,
      label: 'Leave Session',
    }
  }

  if (isFull) {
    return {
      action: 'join' as SessionAction,
      badge: 'Session Full',
      disabled: true,
      label: 'Session Full',
    }
  }

  if (isInOtherSession) {
    return {
      action: 'join' as SessionAction,
      badge: `${getRemainingSlots(session)} spots left`,
      disabled: true,
      label: 'You are already in another session',
    }
  }

  return {
    action: 'join' as SessionAction,
    badge: `${getRemainingSlots(session)} spots left`,
    disabled: false,
    label: 'Join Session',
  }
}

function getFallbackCoordinates(location: string) {
  const matched = locationFallbacks.find((entry) => entry.match.test(location))
  return matched?.coordinates ?? AUCKLAND_CENTER
}

function getUserIdFromToken(token: string) {
  if (!token) {
    return null
  }

  try {
    const payloadSegment = token.split('.')[1]
    if (!payloadSegment) {
      return null
    }

    const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(window.atob(normalized))
    return typeof decoded.userId === 'string' ? decoded.userId : null
  } catch {
    return null
  }
}

function formatDateTime(value: string) {
  const date = new Date(value)
  const datePart = new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric',
    month: 'short',
  }).format(date)
  const timePart = new Intl.DateTimeFormat('en-NZ', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)

  return `${datePart} · ${timePart}`
}

function formatDateForPicker(value: Date) {
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(value)
}

function parseDateTimeLocalValue(value: string) {
  if (!value) {
    return null
  }

  const [datePart, timePart] = value.split('T')

  if (!datePart || !timePart) {
    return null
  }

  const [year, month, day] = datePart.split('-').map(Number)
  const [hour, minute] = timePart.split(':').map(Number)

  if ([year, month, day, hour, minute].some((part) => Number.isNaN(part))) {
    return null
  }

  return new Date(year, month - 1, day, hour, minute)
}

function formatTimeInputValue(value: Date) {
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function mergeDateAndTime(date: Date, timeValue: string) {
  const [hour, minute] = timeValue.split(':').map(Number)
  const nextDate = new Date(date)
  nextDate.setHours(Number.isNaN(hour) ? 0 : hour, Number.isNaN(minute) ? 0 : minute, 0, 0)

  const year = nextDate.getFullYear()
  const month = String(nextDate.getMonth() + 1).padStart(2, '0')
  const day = String(nextDate.getDate()).padStart(2, '0')
  const hours = String(nextDate.getHours()).padStart(2, '0')
  const minutes = String(nextDate.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function getDateTimeLocalMinimum() {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}

function getNavClassName({ isActive }: { isActive: boolean }) {
  return `top-nav-link ${isActive ? 'is-active' : ''}`
}

export default App
