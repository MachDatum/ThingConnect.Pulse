import axios from 'axios'

const API_BASE_URL = '/api';

export interface AuthResponse {
  token: string
  username: string
  email: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface UserProfile {
  id: number
  username: string
  email: string
  createdAt: string
}

class AuthService {
  private token: string | null = null

  constructor() {
    this.token = localStorage.getItem('token')
    this.setupAxiosInterceptors()
  }

  private setupAxiosInterceptors() {
    axios.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`
      }
      return config
    })

    axios.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        if ((error as { response?: { status?: number } })?.response?.status === 401) {
          this.logout()
        }
        return Promise.reject(
          new Error((error as { message?: string })?.message || 'An error occurred')
        )
      }
    )
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/login`, {
      username,
      password,
    })

    const { token } = response.data
    this.token = token
    localStorage.setItem('token', token)

    return response.data
  }

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(`${API_BASE_URL}/auth/register`, {
      username,
      email,
      password,
    })

    const { token } = response.data
    this.token = token
    localStorage.setItem('token', token)

    return response.data
  }

  async getUserProfile(): Promise<UserProfile> {
    const response = await axios.get<UserProfile>(`${API_BASE_URL}/user/profile`)
    return response.data
  }

  logout(): void {
    this.token = null
    localStorage.removeItem('token')
  }

  isAuthenticated(): boolean {
    return this.token !== null
  }

  getToken(): string | null {
    return this.token
  }
}

export const authService = new AuthService()
