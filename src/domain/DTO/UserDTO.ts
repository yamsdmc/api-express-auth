export interface UserDTO {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
