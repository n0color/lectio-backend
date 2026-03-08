export default class UserDto {
  login: string;
  id: number;
  isActivated: boolean;

  constructor(model: any) {
    this.login = model.login;
    this.id = model.id;
    this.isActivated = model.isActivated;
  }
}