export interface User {
  id?: string
  email: string
  password: string
  isVerified: boolean;
  verificationToken?: string | null;
  createdAt?: Date
}

export interface UserDTO {
  email: string
  password: string
}
