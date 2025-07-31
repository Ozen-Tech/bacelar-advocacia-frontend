// src/schemas/user.ts

export interface UserPublic {
    id: string;
    name: string;
    email: string;
    profile: 'admin' | 'advogado' | 'estagiario';
    phone: string | null;
  }