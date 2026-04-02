declare module '*.jsx' {
  import type { ComponentType } from 'react'
  const component: ComponentType<any>
  export default component
  export const ToastProvider: ComponentType<{ children: React.ReactNode }>
  export function useToast(): { toast: (message: string, type?: string) => void }
  export function useAuth(): {
    user: any
    role: string | null
    accessToken: string | null
    loading: boolean
    login: (tokens: { access: string; refresh: string }, userData: any) => void
    logout: () => void
  }
  export function AuthProvider(props: { children: React.ReactNode }): JSX.Element
  export function HomePage(): JSX.Element
  export function UnauthorizedPage(): JSX.Element
  export function CoordinatorDashboardPage(): JSX.Element
  export function AdminDashboardPage(): JSX.Element
  export function AdminUsersPage(): JSX.Element
  export function AdminStudentsPage(): JSX.Element
  export function AdminCompaniesPage(): JSX.Element
  export function AdminInternshipsPage(): JSX.Element
  export function AdminReportsPage(): JSX.Element
  export function AdminSettingsPage(): JSX.Element
}

declare module '@/api/axios' {
  import type { AxiosInstance } from 'axios'
  const api: AxiosInstance
  export default api
}
