import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { DayPicker } from 'react-day-picker'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'react-day-picker/style.css'
import authSceneUrl from './assets/pexels-lumeon-labs-2154956182-33473442.jpg'
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

type SearchSuggestion = {
  session: MealSession
  copy: ReturnType<typeof getSessionCopy>
  distanceKm: number | null
  score: number
}

type DashboardPageProps = {
  actionSessionId: string | null
  allSessions: MealSession[]
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
  closingSessionId: string | null
  currentUserId: string | null
  onCloseSession: (sessionId: string) => Promise<MealSession | null>
  joinedSession: MealSession | null
  onRefresh: () => Promise<void>
  onSessionAction: (sessionId: string, action: SessionAction) => Promise<MealSession | null>
  sessionError: string
  sessionLoading: boolean
  sessions: MealSession[]
}

type CreateSessionPageProps = {
  allSessions: MealSession[]
  onCreateSession: (event: FormEvent<HTMLFormElement>) => Promise<void>
  sessionError: string
  sessionForm: SessionFormState
  submittingSession: boolean
  onSessionFormChange: (field: keyof SessionFormState, value: string) => void
}

type ProfilePageProps = {
  globalNotice: string
  handleProfileSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  profile: UserProfile | null
  profileError: string
  profileForm: ProfileFormState
  profileLoading: boolean
  profileSaving: boolean
  token: string
  onProfileFieldChange: (field: keyof ProfileFormState, value: string) => void
}

type AuthPageProps = {
  authError: string
  authForm: AuthFormState
  authLoading: boolean
  onAuthFormChange: (field: keyof AuthFormState, value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>, mode: AuthMode) => Promise<void>
}

type AuthOutletContext = AuthPageProps

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:5050'
const TOKEN_STORAGE_KEY = 'platemates-token'
const AUCKLAND_CENTER: Coordinates = { lat: -36.8485, lng: 174.7633, source: 'fallback' }

const locationFallbacks: Array<{ match: RegExp; coordinates: Coordinates }> = [
  { match: /dominion/i, coordinates: { lat: -36.8878, lng: 174.7468, source: 'fallback' } },
  { match: /cbd|queen street|auckland central/i, coordinates: AUCKLAND_CENTER },
  { match: /newmarket/i, coordinates: { lat: -36.8698, lng: 174.7773, source: 'fallback' } },
  { match: /mount eden|mt eden/i, coordinates: { lat: -36.8841, lng: 174.7464, source: 'fallback' } },
]

const titleSuggestionSeeds = [
  'Hotpot on Dominion Road',
  'Hotpot dinner',
  'Hotpot near me',
  'Sushi after class',
  'Late-night noodles',
  'Study dinner in Newmarket',
  'BBQ in the CBD',
  'Dessert run after lectures',
]

const placeSuggestionSeeds = [
  { name: 'Dominion Road', address: 'Dominion Road, Auckland', lat: -36.8878, lng: 174.7468 },
  { name: 'Auckland CBD', address: 'Queen Street, Auckland CBD', lat: -36.8485, lng: 174.7633 },
  { name: 'Newmarket', address: 'Broadway, Newmarket, Auckland', lat: -36.8698, lng: 174.7773 },
  { name: 'Mount Eden', address: 'Mount Eden Road, Auckland', lat: -36.8841, lng: 174.7464 },
  { name: 'Ponsonby', address: 'Ponsonby Road, Auckland', lat: -36.8574, lng: 174.7466 },
  { name: 'Parnell', address: 'Parnell Road, Auckland', lat: -36.8547, lng: 174.7846 },
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
  const [closingSessionId, setClosingSessionId] = useState<string | null>(null)
  const [authError, setAuthError] = useState('')
  const [sessionError, setSessionError] = useState('')
  const [profileError, setProfileError] = useState('')
  const [globalNotice, setGlobalNotice] = useState('')

  const currentUserId = useMemo(() => getUserIdFromToken(token), [token])
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  useEffect(() => {
    const image = new Image()
    image.src = authSceneUrl
  }, [])

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
    void loadProfile()
  }, [token])

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
    const normalizedQuery = debouncedSearchQuery.trim().toLowerCase()

    const filtered = sessions.filter((session) => {
      if (normalizedQuery.length === 0) {
        return true
      }

      return [session.title, session.description, session.location].some((value) =>
        fuzzyMatchScore(value, normalizedQuery) > -1,
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
  }, [debouncedSearchQuery, sessions, sortMode])

  async function refreshSessions() {
    if (!token) {
      return
    }

    setSessionLoading(true)
    setSessionError('')

    try {
      const data = await fetchJson<MealSession[]>(`${API_BASE_URL}/api/meal`, { token })
      setSessions(data.map(normalizeMealSession))
    } catch (error) {
      setSessionError(getErrorMessage(error))
    } finally {
      setSessionLoading(false)
    }
  }

  async function loadProfile() {
    if (!token) {
      return
    }

    setProfileLoading(true)
    setProfileError('')

    try {
      const data = await fetchJson<{ user: UserProfile }>(`${API_BASE_URL}/api/auth/me`, { token })
      setProfile(data.user)
      setProfileForm(toProfileForm(data.user))
    } catch (error) {
      setProfileError(getErrorMessage(error))
    } finally {
      setProfileLoading(false)
    }
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>, mode: AuthMode) {
    event.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    const endpoint = mode === 'login' ? 'login' : 'register'
    const payload =
      mode === 'login'
        ? {
            email: authForm.email.trim(),
            password: authForm.password,
          }
        : {
            name: authForm.name.trim(),
            email: authForm.email.trim(),
            password: authForm.password,
          }

    try {
      const data = await fetchJson<{ token: string; user: UserProfile }>(
        `${API_BASE_URL}/api/auth/${endpoint}`,
        {
          method: 'POST',
          body: payload,
        },
      )

      localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
      setToken(data.token)
      setProfile(data.user)
      setProfileForm(toProfileForm(data.user))
      setAuthForm(emptyAuthForm)
      setGlobalNotice(mode === 'login' ? 'Logged in successfully.' : 'Account created successfully.')
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
        location: sessionForm.location.trim(),
        time: new Date(sessionForm.time).toISOString(),
        slots: Number(sessionForm.slots),
      }

      await fetchJson<{ session: MealSession }>(`${API_BASE_URL}/api/meal/create`, {
        method: 'POST',
        body: payload,
        token,
      })

      setSessionForm(emptySessionForm)
      setGlobalNotice('Meal session created successfully.')
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
      const data = await fetchJson<{ message: string; session: MealSession }>(
        `${API_BASE_URL}/api/meal/${sessionId}/${action}`,
        {
          method: 'POST',
          token,
        },
      )

      const normalizedSession = normalizeMealSession(data.session)

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

  async function handleCloseSession(sessionId: string) {
    if (!token) {
      setSessionError('Please log in before closing a session.')
      return null
    }

    setClosingSessionId(sessionId)
    setSessionError('')

    try {
      const data = await fetchJson<{ message: string; session: MealSession }>(
        `${API_BASE_URL}/api/meal/${sessionId}/close`,
        {
          method: 'POST',
          token,
        },
      )

      const normalizedSession = normalizeMealSession(data.session)
      setSessions((current) => current.filter((session) => getSessionId(session) !== sessionId))
      setGlobalNotice(data.message)
      return normalizedSession
    } catch (error) {
      const message = getErrorMessage(error)
      setSessionError(message)
      throw error instanceof Error ? error : new Error(message)
    } finally {
      setClosingSessionId(null)
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
      const data = await fetchJson<{ message: string; user: UserProfile }>(
        `${API_BASE_URL}/api/auth/profile`,
        {
          method: 'PATCH',
          body: profileForm,
          token,
        },
      )
      setProfile(data.user)
      setProfileForm(toProfileForm(data.user))
      setGlobalNotice(data.message)
    } catch (error) {
      setProfileError(getErrorMessage(error))
    } finally {
      setProfileSaving(false)
    }
  }

  const isAuthenticated = Boolean(token)
  const routeMotionKey =
    !isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')
      ? 'auth'
      : location.pathname

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
          <div className="route-content-shell" key={routeMotionKey}>
            <Routes location={location}>
              <Route element={<Navigate replace to={isAuthenticated ? '/dashboard' : '/login'} />} path="/" />
              <Route
                element={
                  <PublicOnlyRoute isAuthenticated={isAuthenticated}>
                    <AuthLayout
                      authError={authError}
                      authForm={authForm}
                      authLoading={authLoading}
                      onAuthFormChange={(field, value) =>
                        setAuthForm((current) => ({ ...current, [field]: value }))
                      }
                      onSubmit={handleAuthSubmit}
                    />
                  </PublicOnlyRoute>
                }
              >
                <Route element={<AuthModePanel mode="login" />} path="/login" />
                <Route element={<AuthModePanel mode="register" />} path="/register" />
              </Route>
              <Route
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <DashboardPage
                      actionSessionId={actionSessionId}
                      allSessions={sessions}
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
                      closingSessionId={closingSessionId}
                      currentUserId={currentUserId}
                      joinedSession={joinedSession}
                      onCloseSession={handleCloseSession}
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
                      allSessions={sessions}
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
                      token={token}
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
    | 'minus'
    | 'plus'
    | 'refresh'
    | 'search'
    | 'seats'
    | 'spark'
    | 'user'
}) {
  const commonProps = {
    'aria-hidden': true,
    className: `inline-icon icon icon-${name}`,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2.1,
    viewBox: '0 0 24 24',
  }

  switch (name) {
    case 'arrow-left':
      return (
        <svg {...commonProps}>
          <path d="M19 12H6" />
          <path d="m11 17-5-5 5-5" />
        </svg>
      )
    case 'chevron-left':
      return (
        <svg {...commonProps}>
          <path d="m14 6.75-4.75 5.25L14 17.25" />
        </svg>
      )
    case 'chevron-right':
      return (
        <svg {...commonProps}>
          <path d="m10 6.75 4.75 5.25L10 17.25" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="5.5" width="15" height="14" rx="3.25" />
          <path d="M8 3.75v3.5" />
          <path d="M16 3.75v3.5" />
          <path d="M4.5 9.5h15" />
        </svg>
      )
    case 'search':
      return (
        <svg {...commonProps}>
          <circle cx="11" cy="11" r="6.25" />
          <path d="m16 16 3.75 3.75" />
        </svg>
      )
    case 'close':
      return (
        <svg {...commonProps}>
          <path d="M7 7 17 17" />
          <path d="M17 7 7 17" />
        </svg>
      )
    case 'email':
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="6.25" width="15" height="11.5" rx="2.75" />
          <path d="m5.75 8.25 6.25 4.9 6.25-4.9" />
        </svg>
      )
    case 'graduation-cap':
      return (
        <svg {...commonProps}>
          <path d="m3.75 10 8.25-4.25L20.25 10 12 14.25 3.75 10Z" />
          <path d="M7 12.35v3.8c1.2.95 3.05 1.6 5 1.6s3.8-.65 5-1.6v-3.8" />
        </svg>
      )
    case 'cuisine':
      return (
        <svg {...commonProps}>
          <path d="M8.1 8.35a3.2 3.2 0 0 1 3.2-3.1c1.45 0 2.45.66 3.08 1.78" />
          <path d="M5.35 12.4h13.3c0 3.1-2.75 5.6-6.65 5.6s-6.65-2.5-6.65-5.6Z" />
          <path d="M12 12.4V9.2" />
          <path d="M16.9 8.2c.58-.86 1.32-1.48 2.08-1.84" />
        </svg>
      )
    case 'spark':
      return (
        <svg {...commonProps}>
          <path d="M12 3.75v3.5" />
          <path d="M12 16.75v3.5" />
          <path d="M3.75 12h3.5" />
          <path d="M16.75 12h3.5" />
          <path d="m6.8 6.8 2.45 2.45" />
          <path d="m14.75 14.75 2.45 2.45" />
          <path d="m14.75 9.25 2.45-2.45" />
          <path d="m6.8 17.2 2.45-2.45" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...commonProps}>
          <path d="M12 6v12" />
          <path d="M6 12h12" />
        </svg>
      )
    case 'minus':
      return (
        <svg {...commonProps}>
          <path d="M6 12h12" />
        </svg>
      )
    case 'refresh':
      return (
        <svg {...commonProps}>
          <path d="M18.35 11.85a6.35 6.35 0 1 1-1.82-4.4" />
          <path d="M14.75 5.95h4.15v4.15" />
          <path d="m18.9 5.95-4.55 4.55" />
        </svg>
      )
    case 'user':
      return (
        <svg {...commonProps}>
          <path d="M18.25 20.25a6.25 6.25 0 0 0-12.5 0" />
          <circle cx="12" cy="8" r="3.75" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...commonProps}>
          <path d="m9.75 16.75-4.5-4.75 4.5-4.75" />
          <path d="M5.25 12h9.5" />
          <path d="M14.75 4.75h4v14.5h-4" />
        </svg>
      )
    case 'location':
      return (
        <svg {...commonProps}>
          <path d="M12 20.75s5.75-4.9 5.75-10.55a5.75 5.75 0 1 0-11.5 0c0 5.65 5.75 10.55 5.75 10.55Z" />
          <circle cx="12" cy="10" r="2.15" />
        </svg>
      )
    case 'external-link':
      return (
        <svg {...commonProps}>
          <path d="M14.5 5.25h4.25V9.5" />
          <path d="M9.5 14.5 18.75 5.25" />
          <path d="M18.75 13.5v3a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9A2.25 2.25 0 0 1 7.5 5.25h3" />
        </svg>
      )
    case 'clock':
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="8.25" />
          <path d="M12 7.9v4.35l2.9 1.75" />
        </svg>
      )
    case 'seats':
      return (
        <svg {...commonProps}>
          <path d="M6.25 18v-4.35a2.4 2.4 0 0 1 2.4-2.4h6.7a2.4 2.4 0 0 1 2.4 2.4V18" />
          <path d="M8 11.25V8.7a1.95 1.95 0 1 1 3.9 0v2.55" />
          <path d="M12.1 11.25V8.2a1.95 1.95 0 1 1 3.9 0v3.05" />
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
      <div className="activity-session-card-top">
        <strong className="activity-session-title">{copy.title}</strong>
        <StatusChip className={`status-badge activity-status-chip ${statusLabel !== 'Open' ? 'closed' : 'open'}`} warn={statusLabel !== 'Open'}>
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
      <div className="activity-session-people">
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
        <span className="activity-column-count">{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}</span>
      </div>

      {sessions.length === 0 ? (
        <div className="activity-column-empty">
          <strong>{emptyTitle}</strong>
          <p>{emptyDescription}</p>
          {emptyAction}
        </div>
      ) : (
        <div className="activity-column-body">
          <div className="activity-list">
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
    const timeout = window.setTimeout(() => {
      map.invalidateSize()
    }, 260)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
    }
  }, [map])

  return null
}

function MapPreviewCard({
  location,
  latitude,
  longitude,
  onOpen,
}: {
  location: string
  latitude: number
  longitude: number
  onOpen: () => void
}) {
  const position: [number, number] = [latitude, longitude]
  const openInMapsHref = getMapsHref(location, latitude, longitude)

  return (
    <div className="map-preview-shell">
      <button
        aria-label="Open larger map"
        className="map-preview-frame map-preview-button"
        onClick={onOpen}
        type="button"
      >
        <MapContainer
          attributionControl
          center={position}
          className="leaflet-map leaflet-map-preview"
          doubleClickZoom={false}
          dragging={false}
          fadeAnimation
          inertia={false}
          markerZoomAnimation
          scrollWheelZoom={false}
          touchZoom={false}
          zoom={14}
          zoomAnimation
          zoomControl={false}
        >
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
  )
}

function MapModal({
  isOpen,
  isClosing,
  latitude,
  location,
  longitude,
  onClose,
}: {
  isOpen: boolean
  isClosing: boolean
  latitude: number
  location: string
  longitude: number
  onClose: () => void
}) {
  const position: [number, number] = [latitude, longitude]
  const openInMapsHref = getMapsHref(location, latitude, longitude)
  const isVisible = isOpen || isClosing

  useEffect(() => {
    if (!isVisible) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible, onClose])

  if (!isVisible) {
    return null
  }

  return createPortal(
    <div
      className={`map-modal-overlay ${isClosing ? 'is-closing' : 'is-open'}`}
      onClick={onClose}
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
            <p>{location || 'Location not specified'}</p>
          </div>
          <button
            aria-label="Close map"
            className="ghost-button map-modal-close"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="map-modal-frame">
          <MapContainer
            attributionControl
            center={position}
            className="leaflet-map leaflet-map-expanded leaflet-map-interactive"
            bounceAtZoomLimits={false}
            doubleClickZoom
            dragging
            easeLinearity={0.22}
            fadeAnimation
            inertia
            inertiaDeceleration={3000}
            inertiaMaxSpeed={1500}
            markerZoomAnimation
            scrollWheelZoom
            touchZoom
            wheelDebounceTime={32}
            wheelPxPerZoomLevel={100}
            zoom={15}
            zoomDelta={0.5}
            zoomAnimation
            zoomControl={false}
            zoomSnap={0.25}
          >
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
  const [isExpanded, setIsExpanded] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

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

  return (
    <>
      <MapPreviewCard latitude={latitude} location={location} longitude={longitude} onOpen={openModal} />
      <MapModal
        isClosing={isClosing}
        isOpen={isExpanded}
        latitude={latitude}
        location={location}
        longitude={longitude}
        onClose={closeModal}
      />
    </>
  )
}

function LoopingWheelPicker({
  values,
  selectedValue,
  onSelect,
  formatValue,
  disabledValues,
}: {
  values: number[]
  selectedValue: number
  onSelect: (value: number) => void
  formatValue: (value: number) => string
  disabledValues?: Set<number>
}) {
  const itemHeight = 44
  const viewportHeight = 220
  const centerOffset = (viewportHeight - itemHeight) / 2
  const baseCount = values.length
  const middleStartIndex = baseCount
  const renderedValues = useMemo(() => [...values, ...values, ...values], [values])
  const listRef = useRef<HTMLDivElement | null>(null)
  const scrollTimerRef = useRef<number | null>(null)
  const isProgrammaticScrollRef = useRef(false)
  const [activeVirtualIndex, setActiveVirtualIndex] = useState(middleStartIndex + values.indexOf(selectedValue))
  const activeVirtualIndexRef = useRef(middleStartIndex + values.indexOf(selectedValue))

  useEffect(() => {
    const selectedIndex = values.indexOf(selectedValue)
    if (selectedIndex < 0) {
      return
    }

    const currentVirtualIndex = activeVirtualIndexRef.current
    const candidateIndexes = [
      selectedIndex,
      selectedIndex + baseCount,
      selectedIndex + baseCount * 2,
      selectedIndex - baseCount,
      selectedIndex + baseCount * 3,
    ]
    const nextVirtualIndex = candidateIndexes.reduce((closestIndex, candidateIndex) =>
      Math.abs(candidateIndex - currentVirtualIndex) < Math.abs(closestIndex - currentVirtualIndex)
        ? candidateIndex
        : closestIndex,
    )

    const container = listRef.current
    if (!container) {
      activeVirtualIndexRef.current = nextVirtualIndex
      setActiveVirtualIndex(nextVirtualIndex)
      return
    }

    const targetTop = nextVirtualIndex * itemHeight
    if (Math.abs(container.scrollTop - targetTop) < 1) {
      activeVirtualIndexRef.current = nextVirtualIndex
      setActiveVirtualIndex(nextVirtualIndex)
      return
    }

    activeVirtualIndexRef.current = nextVirtualIndex
    setActiveVirtualIndex(nextVirtualIndex)
    isProgrammaticScrollRef.current = true
    container.scrollTo({ top: targetTop, behavior: 'auto' })
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 0)
  }, [selectedValue, values, middleStartIndex, baseCount])

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        window.clearTimeout(scrollTimerRef.current)
      }
    }
  }, [])

  function getValueFromVirtualIndex(virtualIndex: number) {
    const normalized = ((virtualIndex % baseCount) + baseCount) % baseCount
    return values[normalized]
  }

  function recenterVirtualIndex(virtualIndex: number) {
    if (virtualIndex < baseCount * 0.5) {
      return virtualIndex + baseCount
    }

    if (virtualIndex > baseCount * 2.5) {
      return virtualIndex - baseCount
    }

    return virtualIndex
  }

  function getNearestRenderIndex(scrollTop: number) {
    return Math.round(scrollTop / itemHeight)
  }

  function setVirtualIndex(nextVirtualIndex: number) {
    activeVirtualIndexRef.current = nextVirtualIndex
    setActiveVirtualIndex(nextVirtualIndex)
  }

  function snapToIndex(virtualIndex: number, shouldSelect: boolean) {
    const container = listRef.current
    if (!container) {
      return
    }

    const normalizedValue = getValueFromVirtualIndex(virtualIndex)
    const recenteredIndex = recenterVirtualIndex(virtualIndex)

    isProgrammaticScrollRef.current = true
    setVirtualIndex(virtualIndex)
    container.scrollTo({ top: virtualIndex * itemHeight, behavior: 'smooth' })
    window.setTimeout(() => {
      if (recenteredIndex !== virtualIndex) {
        container.scrollTo({ top: recenteredIndex * itemHeight, behavior: 'auto' })
        setVirtualIndex(recenteredIndex)
      }
      isProgrammaticScrollRef.current = false
    }, 220)

    if (shouldSelect && !disabledValues?.has(normalizedValue) && normalizedValue !== selectedValue) {
      onSelect(normalizedValue)
    }
  }

  function handleScroll() {
    const container = listRef.current
    if (!container || isProgrammaticScrollRef.current) {
      return
    }

    let nearestVirtualIndex = getNearestRenderIndex(container.scrollTop)

    if (container.scrollTop < baseCount * itemHeight * 0.5) {
      container.scrollTop += baseCount * itemHeight
      nearestVirtualIndex += baseCount
    } else if (container.scrollTop > baseCount * itemHeight * 2.5) {
      container.scrollTop -= baseCount * itemHeight
      nearestVirtualIndex -= baseCount
    }

    setVirtualIndex(nearestVirtualIndex)

    if (scrollTimerRef.current) {
      window.clearTimeout(scrollTimerRef.current)
    }

    scrollTimerRef.current = window.setTimeout(() => {
      snapToIndex(getNearestRenderIndex(container.scrollTop), true)
    }, 90)
  }

  return (
    <div className="timepicker-wheel-shell">
      <div className="timepicker-wheel-mask" aria-hidden="true" />
      <div className="timepicker-wheel-highlight" aria-hidden="true" />
      <div
        className="timepicker-wheel"
        onScroll={handleScroll}
        ref={listRef}
        style={{ ['--wheel-center-offset' as string]: `${centerOffset}px` }}
      >
        <div aria-hidden="true" className="timepicker-wheel-spacer" />
        {renderedValues.map((value, index) => {
          const disabled = disabledValues?.has(value) ?? false
          const isActive = index === activeVirtualIndex

          return (
            <button
              aria-pressed={isActive}
              className={`timepicker-wheel-item ${isActive ? 'is-active' : ''}`}
              data-active={isActive || undefined}
              disabled={disabled}
              key={`${value}-${index}`}
              onClick={() => snapToIndex(index, true)}
              type="button"
            >
              {formatValue(value)}
            </button>
          )
        })}
        <div aria-hidden="true" className="timepicker-wheel-spacer" />
      </div>
    </div>
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
  const [openPanel, setOpenPanel] = useState<'date' | 'time' | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const dateTriggerRef = useRef<HTMLButtonElement | null>(null)
  const timeTriggerRef = useRef<HTMLButtonElement | null>(null)
  const datePopoverRef = useRef<HTMLDivElement | null>(null)
  const timePopoverRef = useRef<HTMLDivElement | null>(null)
  const [datePopoverStyle, setDatePopoverStyle] = useState<{ top: number; left: number; width: number } | null>(null)
  const [timePopoverStyle, setTimePopoverStyle] = useState<{ top: number; left: number; width: number } | null>(null)
  const selectedDateTime = parseDateTimeLocalValue(value)
  const minimumDateTime = parseDateTimeLocalValue(minimum) ?? new Date()
  const selectedTime = selectedDateTime ? formatTimeInputValue(selectedDateTime) : formatTimeInputValue(minimumDateTime)
  const [selectedHour, selectedMinute] = selectedTime.split(':').map(Number)
  const [visibleMonth, setVisibleMonth] = useState<Date>(selectedDateTime ?? minimumDateTime)
  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, index) => index), [])
  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, index) => index), [])
  const activeDate = selectedDateTime ?? minimumDateTime
  const isMinimumDate =
    activeDate.getFullYear() === minimumDateTime.getFullYear() &&
    activeDate.getMonth() === minimumDateTime.getMonth() &&
    activeDate.getDate() === minimumDateTime.getDate()

  useEffect(() => {
    if (!openPanel) {
      return
    }

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const clickedInsideTrigger = wrapperRef.current?.contains(target)
      const clickedInsideDatePopover = datePopoverRef.current?.contains(target)
      const clickedInsideTimePopover = timePopoverRef.current?.contains(target)

      if (!clickedInsideTrigger && !clickedInsideDatePopover && !clickedInsideTimePopover) {
        setOpenPanel(null)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenPanel(null)
      }
    }

    function updatePopoverPosition(panel: 'date' | 'time') {
      const trigger = panel === 'date' ? dateTriggerRef.current : timeTriggerRef.current
      if (!trigger) {
        return
      }

      const rect = trigger.getBoundingClientRect()
      const desiredWidth = Math.max(rect.width, panel === 'date' ? 332 : 364)
      const maxWidth = Math.min(desiredWidth, window.innerWidth - 24)
      const left = Math.min(Math.max(12, rect.left), window.innerWidth - maxWidth - 12)
      const top = rect.bottom + 8

      const nextStyle = {
        top,
        left,
        width: maxWidth,
      }

      if (panel === 'date') {
        setDatePopoverStyle(nextStyle)
      } else {
        setTimePopoverStyle(nextStyle)
      }
    }

    updatePopoverPosition(openPanel)
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    const handleViewportChange = () => updatePopoverPosition(openPanel)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [openPanel])

  useEffect(() => {
    const nextMonth = parseDateTimeLocalValue(value)

    if (!nextMonth) {
      return
    }

    setVisibleMonth((current) =>
      current.getMonth() === nextMonth.getMonth() && current.getFullYear() === nextMonth.getFullYear()
        ? current
        : nextMonth,
    )
  }, [value])

  function handleDateSelect(day?: Date) {
    if (!day) {
      return
    }

    const nextDate = mergeDateAndTime(day, selectedTime || formatTimeInputValue(minimumDateTime))
    onChange(nextDate)
    setVisibleMonth(day)
    setOpenPanel(null)
  }

  function updateTime(nextHour: number, nextMinute: number) {
    const safeHour = Math.max(0, Math.min(23, nextHour))
    const safeMinute = Math.max(0, Math.min(59, nextMinute))
    const nextTime = `${String(safeHour).padStart(2, '0')}:${String(safeMinute).padStart(2, '0')}`
    onChange(mergeDateAndTime(activeDate, nextTime))
  }

  function updateHour(nextHour: number) {
    const nextMinute =
      isMinimumDate && nextHour === minimumDateTime.getHours() && selectedMinute < minimumDateTime.getMinutes()
        ? minimumDateTime.getMinutes()
        : selectedMinute

    updateTime(nextHour, nextMinute)
  }

  function updateMinute(nextMinute: number) {
    updateTime(selectedHour, nextMinute)
  }

  function isTimeOptionDisabled(hour: number, minute: number) {
    if (!isMinimumDate) {
      return false
    }

    return hour < minimumDateTime.getHours() || (hour === minimumDateTime.getHours() && minute < minimumDateTime.getMinutes())
  }

  const selectedHourDisabled = isTimeOptionDisabled(selectedHour, selectedMinute)
  const disabledHours = useMemo(() => {
    if (!isMinimumDate) {
      return new Set<number>()
    }

    return new Set(hourOptions.filter((hour) => hour < minimumDateTime.getHours()))
  }, [hourOptions, isMinimumDate, minimumDateTime])

  const disabledMinutes = useMemo(() => {
    if (!isMinimumDate || selectedHour !== minimumDateTime.getHours()) {
      return new Set<number>()
    }

    return new Set(minuteOptions.filter((minute) => minute < minimumDateTime.getMinutes()))
  }, [isMinimumDate, minuteOptions, minimumDateTime, selectedHour])

  return (
    <div className="datetime-field" ref={wrapperRef}>
      <div className="datetime-picker-stack">
        <button
          aria-expanded={openPanel === 'date'}
          aria-haspopup="dialog"
          className="datetime-trigger"
          onClick={() => setOpenPanel((current) => (current === 'date' ? null : 'date'))}
          ref={dateTriggerRef}
          type="button"
        >
          <span className="datetime-trigger-icon" aria-hidden="true">
            <Icon name="calendar" />
          </span>
          <span className={`datetime-trigger-copy ${selectedDateTime ? '' : 'is-placeholder'}`}>
            {selectedDateTime ? formatDateForPicker(selectedDateTime) : 'Choose a date'}
          </span>
        </button>

        <button
          aria-expanded={openPanel === 'time'}
          aria-haspopup="dialog"
          className="datetime-trigger"
          onClick={() => setOpenPanel((current) => (current === 'time' ? null : 'time'))}
          ref={timeTriggerRef}
          type="button"
        >
          <span className="datetime-trigger-icon" aria-hidden="true">
            <Icon name="clock" />
          </span>
          <span className={`datetime-trigger-copy ${selectedTime ? '' : 'is-placeholder'}`}>
            {selectedTime ? formatTimeForPicker(selectedTime) : 'Choose a time'}
          </span>
          <span className="datetime-trigger-endcap" aria-hidden="true">
            <Icon name="chevron-right" />
          </span>
        </button>
      </div>

      {openPanel === 'date' && datePopoverStyle
        ? createPortal(
            <div className="picker-popover datepicker-popover" ref={datePopoverRef} role="dialog" style={datePopoverStyle}>
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
                month={visibleMonth}
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

      {openPanel === 'time' && timePopoverStyle
        ? createPortal(
            <div className="picker-popover timepicker-popover" ref={timePopoverRef} role="dialog" style={timePopoverStyle}>
              <div className="timepicker-header">
                <span className="timepicker-label">Select time</span>
                <strong className="timepicker-selected">{formatTimeForPicker(selectedTime)}</strong>
              </div>
              <div className="timepicker-grid">
                <div className="timepicker-column-shell">
                  <span className="timepicker-column-label">Hour</span>
                  <LoopingWheelPicker
                    disabledValues={disabledHours}
                    formatValue={(hour) => String(hour).padStart(2, '0')}
                    onSelect={updateHour}
                    selectedValue={selectedHour}
                    values={hourOptions}
                  />
                </div>
                <div className="timepicker-column-shell">
                  <span className="timepicker-column-label">Minute</span>
                  <LoopingWheelPicker
                    disabledValues={selectedHourDisabled ? new Set() : disabledMinutes}
                    formatValue={(minute) => String(minute).padStart(2, '0')}
                    onSelect={updateMinute}
                    selectedValue={selectedMinute}
                    values={minuteOptions}
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function autoResizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) {
    return
  }

  element.style.height = 'auto'
  const nextHeight = Math.min(Math.max(element.scrollHeight, 150), 360)
  element.style.height = `${nextHeight}px`
  element.style.overflowY = element.scrollHeight > 360 ? 'auto' : 'hidden'
}

function AutoResizeTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const { onChange, value, ...rest } = props

  useEffect(() => {
    autoResizeTextarea(textareaRef.current)
  }, [value])

  return (
    <textarea
      {...rest}
      onChange={(event) => {
        autoResizeTextarea(event.target)
        onChange?.(event)
      }}
      ref={textareaRef}
      value={value}
    />
  )
}

function FormField({
  children,
  className = '',
  label,
}: {
  children: ReactNode
  className?: string
  label: ReactNode
}) {
  return (
    <label className={`create-field ${className}`.trim()}>
      <span>{label}</span>
      {children}
    </label>
  )
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`create-control ${props.className ?? ''}`.trim()} />
}

function TextAreaField({
  limit = 200,
  value,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { limit?: number }) {
  const count = typeof value === 'string' ? value.length : 0
  const countState =
    count >= limit ? 'is-limit' : count >= Math.max(limit - 20, Math.floor(limit * 0.85)) ? 'is-near-limit' : ''

  return (
    <div className="create-textarea-shell">
      <AutoResizeTextarea
        {...rest}
        className={`create-control create-textarea ${rest.className ?? ''}`.trim()}
        maxLength={limit}
        value={value}
      />
      <span className={`create-textarea-count ${countState}`.trim()}>{count} / {limit}</span>
    </div>
  )
}

function AuthLayout({
  authError,
  authForm,
  authLoading,
  onAuthFormChange,
  onSubmit,
}: AuthPageProps) {
  const location = useLocation()
  const mode: AuthMode = location.pathname === '/register' ? 'register' : 'login'

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
              <h1>Return to your table.</h1>
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

          <div className={`auth-form-shell ${mode === 'register' ? 'is-register' : 'is-login'}`}>
            <div className="auth-card-stage">
              <Outlet
                context={{
                  authError,
                  authForm,
                  authLoading,
                  onAuthFormChange,
                  onSubmit,
                } satisfies AuthOutletContext}
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </main>
  )
}

function AuthModePanel({ mode }: { mode: AuthMode }) {
  const { authError, authForm, authLoading, onAuthFormChange, onSubmit } =
    useOutletContext<AuthOutletContext>()

  return (
    <div className="auth-mode-panel" key={mode}>
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
            placeholder="you@aucklanduni.ac.nz"
            required
            type="email"
            value={authForm.email}
          />
        </label>

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
  )
}

function DashboardPage({
  actionSessionId,
  allSessions,
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
  const navigate = useNavigate()
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [didRequestLocation, setDidRequestLocation] = useState(false)
  const activeSessionTitle = joinedSession ? getSessionCopy(joinedSession).title : null
  const activeSessionId = joinedSession ? getSessionId(joinedSession) : null
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300)

  useEffect(() => {
    if (didRequestLocation || !debouncedSearchQuery.trim() || !('geolocation' in navigator)) {
      return
    }

    setDidRequestLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        setUserCoordinates(null)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000,
      },
    )
  }, [debouncedSearchQuery, didRequestLocation])

  const searchSuggestions = useMemo(() => {
    const normalizedQuery = debouncedSearchQuery.trim().toLowerCase()
    if (!normalizedQuery) {
      return []
    }

    return allSessions
      .map((session) => {
        const copy = getSessionCopy(session)
        const fields = [copy.title, copy.location, copy.description]
        const score = fields.reduce((best, field) => Math.max(best, fuzzyMatchScore(field, normalizedQuery)), -1)

        if (score < 0) {
          return null
        }

        const coordinates = getFallbackCoordinates(copy.location)
        const distanceKm = userCoordinates
          ? haversineDistanceKm(userCoordinates, { lat: coordinates.lat, lng: coordinates.lng })
          : null

        return {
          session,
          copy,
          distanceKm,
          score,
        } satisfies SearchSuggestion
      })
      .filter((item): item is SearchSuggestion => Boolean(item))
      .sort((left, right) => {
        if (left.distanceKm !== null && right.distanceKm !== null && left.distanceKm !== right.distanceKm) {
          return left.distanceKm - right.distanceKm
        }

        if (left.score !== right.score) {
          return right.score - left.score
        }

        return Date.parse(left.session.time) - Date.parse(right.session.time)
      })
      .slice(0, 8)
  }, [allSessions, debouncedSearchQuery, userCoordinates])

  function handleSuggestionSelect(sessionId: string) {
    navigate(`/sessions/${sessionId}`)
  }

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
                className={`ghost-button toolbar-button toolbar-refresh-button ${sessionLoading ? 'is-loading' : ''}`}
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
            {searchSuggestions.length > 0 ? (
              <div className="search-suggestions-card" role="listbox" aria-label="Suggested sessions">
                {searchSuggestions.map((suggestion) => {
                  const sessionId = getSessionId(suggestion.session)
                  return (
                    <button
                      className="search-suggestion-item"
                      key={sessionId}
                      onClick={() => handleSuggestionSelect(sessionId)}
                      type="button"
                    >
                      <div className="search-suggestion-copy">
                        <strong>{renderHighlightedText(suggestion.copy.title, debouncedSearchQuery)}</strong>
                        <span>
                          {renderHighlightedText(suggestion.copy.location, debouncedSearchQuery)}
                        </span>
                      </div>
                      <div className="search-suggestion-meta">
                        <span>{formatDateTime(suggestion.session.time)}</span>
                        {suggestion.distanceKm !== null ? (
                          <span>{formatDistanceLabel(suggestion.distanceKm)}</span>
                        ) : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : null}
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
              className={`secondary-link quick-actions-secondary ${sessionLoading ? 'is-loading' : ''}`}
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
  closingSessionId,
  currentUserId,
  joinedSession,
  onCloseSession,
  onRefresh,
  onSessionAction,
  sessionError,
  sessionLoading,
  sessions,
}: SessionDetailsPageProps) {
  const { sessionId } = useParams()
  const [session, setSession] = useState<MealSession | null>(() =>
    sessions.find((item) => getSessionId(item) === sessionId) ?? null,
  )
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [detailNotice, setDetailNotice] = useState('')

  useEffect(() => {
    if (!sessionId) {
      return
    }

    setDetailLoading(true)
    setDetailError('')

    void fetchJson<{ session: MealSession }>(`${API_BASE_URL}/api/meal/${sessionId}`)
      .then((data) => {
        setSession(normalizeMealSession(data.session))
      })
      .catch((error) => {
        setDetailError(getErrorMessage(error))
      })
      .finally(() => {
        setDetailLoading(false)
      })
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) {
      return
    }

    const fromStore = sessions.find((item) => getSessionId(item) === sessionId) ?? null
    if (fromStore) {
      setSession(fromStore)
    }
  }, [sessionId, sessions])

  const coordinates = useSessionCoordinates(session?.location ?? '')

  async function handleDetailsAction(action: SessionAction) {
    if (!session) {
      return
    }

    setDetailError('')

    try {
      const updatedSession = await onSessionAction(getSessionId(session), action)
      if (updatedSession) {
        setSession(updatedSession)
      }
      setDetailNotice(action === 'join' ? 'Joined session successfully.' : 'Left session successfully.')
      await onRefresh()
    } catch (error) {
      setDetailError(getErrorMessage(error))
    }
  }

  async function handleClose() {
    if (!session) {
      return
    }

    setDetailError('')

    try {
      const updatedSession = await onCloseSession(getSessionId(session))
      if (updatedSession) {
        setSession(updatedSession)
      }
      setDetailNotice('Session closed successfully.')
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
    ? session.isActive
      ? {
          className: 'primary-button danger-button',
          disabled: closingSessionId === getSessionId(session),
          label: closingSessionId === getSessionId(session) ? 'Closing...' : 'Close session',
          onClick: () => void handleClose(),
        }
      : null
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
  allSessions,
  onCreateSession,
  onSessionFormChange,
  sessionError,
  sessionForm,
  submittingSession,
}: CreateSessionPageProps) {
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [didRequestLocation, setDidRequestLocation] = useState(false)
  const [titleFocused, setTitleFocused] = useState(false)
  const [locationFocused, setLocationFocused] = useState(false)
  const [activeTitleIndex, setActiveTitleIndex] = useState(-1)
  const [activeLocationIndex, setActiveLocationIndex] = useState(-1)
  const [selectedLocationCoordinates, setSelectedLocationCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const slotCount = Number(sessionForm.slots) || 2
  const debouncedTitleQuery = useDebouncedValue(sessionForm.title, 300)
  const debouncedLocationQuery = useDebouncedValue(sessionForm.location, 300)
  const [slotDirection, setSlotDirection] = useState<'increase' | 'decrease'>('increase')

  useEffect(() => {
    if (didRequestLocation || !('geolocation' in navigator)) {
      return
    }

    setDidRequestLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        setUserCoordinates(null)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000,
      },
    )
  }, [didRequestLocation])

  const titleSuggestions = useMemo(() => {
    const normalizedQuery = normalizeSearchText(debouncedTitleQuery)
    if (!normalizedQuery) {
      return buildTitleSuggestions(allSessions).slice(0, 6)
    }

    return buildTitleSuggestions(allSessions)
      .map((item) => ({
        ...item,
        score: fuzzyMatchScore(item.title, normalizedQuery),
      }))
      .filter((item) => item.score > -1)
      .sort((left, right) => right.score - left.score)
      .slice(0, 8)
  }, [allSessions, debouncedTitleQuery])

  const locationSuggestions = useMemo(() => {
    const normalizedQuery = normalizeSearchText(debouncedLocationQuery)
    const allPlaces = buildPlaceSuggestions(allSessions, userCoordinates)

    const matched = allPlaces
      .map((place) => {
        const score = Math.max(
          fuzzyMatchScore(place.name, normalizedQuery),
          fuzzyMatchScore(place.address, normalizedQuery),
        )

        return {
          ...place,
          score: normalizedQuery ? score : 0,
        }
      })
      .filter((place) => (normalizedQuery ? place.score > -1 : true))
      .sort((left, right) => {
        if (left.distanceKm !== null && right.distanceKm !== null && left.distanceKm !== right.distanceKm) {
          return left.distanceKm - right.distanceKm
        }
        return right.score - left.score
      })

    return matched.slice(0, 8)
  }, [allSessions, debouncedLocationQuery, userCoordinates])

  useEffect(() => {
    const fallback = sessionForm.location.trim()
      ? getFallbackCoordinates(sessionForm.location.trim())
      : null

    setSelectedLocationCoordinates(
      fallback
        ? {
            lat: fallback.lat,
            lng: fallback.lng,
          }
        : null,
    )
  }, [sessionForm.location])

  const decreaseSlots = () => {
    if (slotCount <= 2) {
      return
    }
    setSlotDirection('decrease')
    onSessionFormChange('slots', String(Math.max(2, slotCount - 1)))
  }
  const increaseSlots = () => {
    if (slotCount >= 12) {
      return
    }
    setSlotDirection('increase')
    onSessionFormChange('slots', String(Math.min(12, slotCount + 1)))
  }

  function handleTitleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!titleSuggestions.length) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveTitleIndex((current) => Math.min(current + 1, titleSuggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveTitleIndex((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && activeTitleIndex >= 0) {
      event.preventDefault()
      onSessionFormChange('title', titleSuggestions[activeTitleIndex].title)
      setTitleFocused(false)
      setActiveTitleIndex(-1)
    } else if (event.key === 'Escape') {
      setTitleFocused(false)
      setActiveTitleIndex(-1)
    }
  }

  function handleLocationKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!locationSuggestions.length) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveLocationIndex((current) => Math.min(current + 1, locationSuggestions.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveLocationIndex((current) => Math.max(current - 1, 0))
    } else if (event.key === 'Enter' && activeLocationIndex >= 0) {
      event.preventDefault()
      const selected = locationSuggestions[activeLocationIndex]
      onSessionFormChange('location', selected.address)
      setSelectedLocationCoordinates({ lat: selected.lat, lng: selected.lng })
      setLocationFocused(false)
      setActiveLocationIndex(-1)
    } else if (event.key === 'Escape') {
      setLocationFocused(false)
      setActiveLocationIndex(-1)
    }
  }

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
          <FormField className="create-primary-field" label="Title">
            <div className="create-autocomplete">
              <TextInput
                onBlur={() => {
                  window.setTimeout(() => {
                    setTitleFocused(false)
                  }, 120)
                }}
                onChange={(event) => {
                  onSessionFormChange('title', event.target.value)
                  setTitleFocused(true)
                  setActiveTitleIndex(-1)
                }}
                onFocus={() => setTitleFocused(true)}
                onKeyDown={handleTitleKeyDown}
                placeholder="Hotpot on Dominion Road"
                required
                value={sessionForm.title}
              />
              {titleFocused && titleSuggestions.length > 0 ? (
                <div className="create-autocomplete-panel" role="listbox" aria-label="Title suggestions">
                  {titleSuggestions.map((suggestion, index) => (
                    <button
                      className={`create-autocomplete-item ${activeTitleIndex === index ? 'is-active' : ''}`}
                      key={suggestion.id}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        onSessionFormChange('title', suggestion.title)
                        setTitleFocused(false)
                        setActiveTitleIndex(-1)
                      }}
                      type="button"
                    >
                      <strong>{renderHighlightedText(suggestion.title, debouncedTitleQuery)}</strong>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </FormField>

          <FormField label="Location">
            <div className="create-autocomplete">
              <TextInput
                onBlur={() => {
                  window.setTimeout(() => {
                    setLocationFocused(false)
                  }, 120)
                }}
                onChange={(event) => {
                  onSessionFormChange('location', event.target.value)
                  setLocationFocused(true)
                  setActiveLocationIndex(-1)
                }}
                onFocus={() => setLocationFocused(true)}
                onKeyDown={handleLocationKeyDown}
                placeholder="Dominion Road, Auckland"
                required
                value={sessionForm.location}
              />
              {locationFocused && locationSuggestions.length > 0 ? (
                <div className="create-autocomplete-panel" role="listbox" aria-label="Location suggestions">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      className={`create-autocomplete-item ${activeLocationIndex === index ? 'is-active' : ''}`}
                      key={suggestion.id}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        onSessionFormChange('location', suggestion.address)
                        setSelectedLocationCoordinates({ lat: suggestion.lat, lng: suggestion.lng })
                        setLocationFocused(false)
                        setActiveLocationIndex(-1)
                      }}
                      type="button"
                    >
                      <div className="create-autocomplete-copy">
                        <strong>{renderHighlightedText(suggestion.name, debouncedLocationQuery)}</strong>
                        <span>{renderHighlightedText(suggestion.address, debouncedLocationQuery)}</span>
                      </div>
                      <div className="create-autocomplete-meta">
                        {suggestion.distanceKm !== null ? <span>{formatDistanceLabel(suggestion.distanceKm)}</span> : null}
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </FormField>

          {selectedLocationCoordinates ? (
            <div className="create-location-preview">
              <div className="create-location-preview-header">
                <span>Location preview</span>
                <span>{sessionForm.location}</span>
              </div>
              <div className="create-location-preview-map">
                <MapContainer
                  attributionControl={false}
                  center={[selectedLocationCoordinates.lat, selectedLocationCoordinates.lng]}
                  className="leaflet-map leaflet-map-preview"
                  doubleClickZoom={false}
                  dragging={false}
                  fadeAnimation
                  inertia={false}
                  markerZoomAnimation
                  scrollWheelZoom={false}
                  touchZoom={false}
                  zoom={14}
                  zoomAnimation
                  zoomControl={false}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                    maxZoom={20}
                    subdomains="abcd"
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                  <Marker icon={brandMapMarker} position={[selectedLocationCoordinates.lat, selectedLocationCoordinates.lng]} />
                </MapContainer>
              </div>
            </div>
          ) : null}

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
                    className="slot-stepper-button icon-button"
                    disabled={slotCount <= 2}
                    onClick={decreaseSlots}
                    type="button"
                  >
                    <Icon name="minus" />
                  </button>
                  <div className="slot-stepper-value" aria-live="polite">
                    <strong
                      className={`slot-stepper-number slot-stepper-number-${slotDirection}`}
                      key={`${slotCount}-${slotDirection}`}
                    >
                      {slotCount}
                    </strong>
                    <span className="slot-stepper-unit">people</span>
                  </div>
                  <button
                    aria-label="Increase group size"
                    className="slot-stepper-button icon-button"
                    disabled={slotCount >= 12}
                    onClick={increaseSlots}
                    type="button"
                  >
                    <Icon name="plus" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <FormField label={<><span>Description</span> <em>(optional)</em></>}>
            <TextAreaField
              onChange={(event) => onSessionFormChange('description', event.target.value)}
              placeholder="Looking for 3 people to share dishes after class."
              rows={4}
              value={sessionForm.description}
            />
          </FormField>

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
  globalNotice,
  handleProfileSubmit,
  onProfileFieldChange,
  profile,
  profileError,
  profileForm,
  profileLoading,
  profileSaving,
  token,
}: ProfilePageProps) {
  const [hostingSessions, setHostingSessions] = useState<MealSession[]>([])
  const [joinedSessions, setJoinedSessions] = useState<MealSession[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityError, setActivityError] = useState('')

  useEffect(() => {
    if (!token) {
      return
    }

    setActivityLoading(true)
    setActivityError('')

    Promise.all([
      fetchJson<{ sessions: MealSession[] }>(`${API_BASE_URL}/api/meal/mine/hosting`, { token }),
      fetchJson<{ sessions: MealSession[] }>(`${API_BASE_URL}/api/meal/mine/joined`, { token }),
    ])
      .then(([hosting, joined]) => {
        setHostingSessions(hosting.sessions.map(normalizeMealSession))
        setJoinedSessions(joined.sessions.map(normalizeMealSession))
      })
      .catch((error) => {
        setActivityError(getErrorMessage(error))
      })
      .finally(() => {
        setActivityLoading(false)
      })
  }, [token, profile?.updatedAt])

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
              <AutoResizeTextarea
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

      <section className="activity-section">
        <div className="activity-heading">
          <p>My activity</p>
          <h2>Hosted and joined sessions</h2>
        </div>
        {activityError ? <p className="feedback error">{activityError}</p> : null}

        {activityLoading ? (
          <EmptyState description="Fetching your hosted and joined sessions." title="Loading activity..." />
        ) : (
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
        )}
      </section>
    </main>
  )
}

function useSessionCoordinates(location: string) {
  const [coordinates, setCoordinates] = useState<Coordinates>(() => getFallbackCoordinates(location))

  useEffect(() => {
    if (!location.trim()) {
      setCoordinates(AUCKLAND_CENTER)
      return
    }

    const controller = new AbortController()
    const fallback = getFallbackCoordinates(location)
    setCoordinates(fallback)

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

        setCoordinates({
          lat: Number(first.lat),
          lng: Number(first.lon),
          source: 'geocoded',
        })
      })
      .catch(() => {
        setCoordinates(fallback)
      })

    return () => {
      controller.abort()
    }
  }, [location])

  return coordinates
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
  const data = text ? (JSON.parse(text) as Record<string, any>) : {}

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data as T
}

function normalizeMealSession(session: MealSession) {
  return {
    ...session,
    id: session.id || session._id || '',
  }
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => window.clearTimeout(timeout)
  }, [delay, value])

  return debouncedValue
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/\s+/g, ' ').trim()
}

function fuzzyMatchScore(source: string, query: string) {
  const normalizedSource = normalizeSearchText(source)
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) {
    return 0
  }

  const directIndex = normalizedSource.indexOf(normalizedQuery)
  if (directIndex >= 0) {
    return 120 - directIndex
  }

  let queryIndex = 0
  let score = 0

  for (let index = 0; index < normalizedSource.length && queryIndex < normalizedQuery.length; index += 1) {
    if (normalizedSource[index] === normalizedQuery[queryIndex]) {
      score += 2
      queryIndex += 1
    }
  }

  return queryIndex === normalizedQuery.length ? score : -1
}

function renderHighlightedText(text: string, query: string) {
  const normalizedQuery = normalizeSearchText(query)

  if (!normalizedQuery) {
    return text
  }

  const lowerText = text.toLowerCase()
  const directIndex = lowerText.indexOf(normalizedQuery)
  if (directIndex >= 0) {
    const before = text.slice(0, directIndex)
    const match = text.slice(directIndex, directIndex + normalizedQuery.length)
    const after = text.slice(directIndex + normalizedQuery.length)

    return (
      <>
        {before}
        <mark className="search-highlight">{match}</mark>
        {after}
      </>
    )
  }

  const matchedIndices = new Set<number>()
  let queryIndex = 0
  for (let index = 0; index < lowerText.length && queryIndex < normalizedQuery.length; index += 1) {
    if (lowerText[index] === normalizedQuery[queryIndex]) {
      matchedIndices.add(index)
      queryIndex += 1
    }
  }

  return text.split('').map((character, index) =>
    matchedIndices.has(index) ? (
      <mark className="search-highlight" key={`${character}-${index}`}>
        {character}
      </mark>
    ) : (
      <span key={`${character}-${index}`}>{character}</span>
    ),
  )
}

function haversineDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
) {
  const earthRadiusKm = 6371
  const latDelta = degreesToRadians(to.lat - from.lat)
  const lngDelta = degreesToRadians(to.lng - from.lng)
  const startLat = degreesToRadians(from.lat)
  const endLat = degreesToRadians(to.lat)

  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDelta / 2) ** 2

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180
}

function formatDistanceLabel(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`
  }

  return `${distanceKm.toFixed(1)} km away`
}

function buildTitleSuggestions(sessions: MealSession[]) {
  const seeded = titleSuggestionSeeds.map((title) => ({
    id: `seed-title-${title}`,
    title,
  }))

  const fromSessions = sessions
    .map((session) => {
      const title = getSessionCopy(session).title
      return title ? { id: `session-title-${getSessionId(session)}`, title } : null
    })
    .filter((item): item is { id: string; title: string } => Boolean(item))

  return dedupeBy([...seeded, ...fromSessions], (item) => normalizeSearchText(item.title))
}

function buildPlaceSuggestions(sessions: MealSession[], userCoordinates: { lat: number; lng: number } | null) {
  const sessionPlaces = sessions
    .map((session) => {
      const copy = getSessionCopy(session)
      const fallback = getFallbackCoordinates(copy.location)
      return {
        id: `session-place-${getSessionId(session)}`,
        name: copy.location,
        address: copy.location,
        lat: fallback.lat,
        lng: fallback.lng,
      }
    })
    .filter((item) => item.name)

  const allPlaces = dedupeBy(
    [...placeSuggestionSeeds.map((place) => ({ id: `seed-place-${place.name}`, ...place })), ...sessionPlaces],
    (item) => normalizeSearchText(item.address),
  )

  return allPlaces.map((place) => ({
    ...place,
    distanceKm: userCoordinates ? haversineDistanceKm(userCoordinates, { lat: place.lat, lng: place.lng }) : null,
  }))
}

function dedupeBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = getKey(item)
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    return true
  })
}

function getSessionCopy(session: MealSession) {
  const title = session.title.trim()
  const description = session.description.trim()
  const location = session.location.trim()

  const titleLooksLikeTest =
    /^(debug dinner|verification dinner|integration test|test session)$/i.test(title)

  const descriptionLooksLikeTest =
    /integration test meal|re-test after proposal-aligned frontend changes/i.test(description) ||
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
    name: profile.name,
    bio: profile.bio,
    favoriteCuisine: profile.favoriteCuisine,
    yearOfStudy: profile.yearOfStudy,
    avatarColor: profile.avatarColor,
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

function getMapsHref(location: string, latitude: number, longitude: number) {
  return Number.isFinite(latitude) && Number.isFinite(longitude)
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
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

function formatTimeForPicker(value: string) {
  const [hours, minutes] = value.split(':').map(Number)

  if ([hours, minutes].some((part) => Number.isNaN(part))) {
    return value
  }

  return new Intl.DateTimeFormat('en-NZ', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(2026, 0, 1, hours, minutes))
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
