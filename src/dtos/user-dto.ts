export default class UserDto {
  login: string;
  role: string
  id: string;
  isActivated: boolean;

  constructor(model: any) {
    this.login = model.login;
    this.role = model.role;
    this.id = model.id;
    this.isActivated = model.isActivated;
  }
}