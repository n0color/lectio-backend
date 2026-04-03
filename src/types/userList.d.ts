import type { Role } from "../../generated/prisma/enums";

type UserList = {
  id: string;
  login: string;
  email: string;
  role: Role;
  isActivated: boolean;
};