import type { Role } from "../../generated/prisma/enums";

type UserList = {
  id: string;
  login: string;
  email: string;
  role: Role; // или Role, если используете enum
  isActivated: boolean;
};