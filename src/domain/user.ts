export interface User {
  id?: string
  email: string
  password: string
  createdAt?: Date
}

export interface UserDTO {
  email: string
  password: string
}
