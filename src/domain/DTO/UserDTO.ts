export interface UserDTO {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
