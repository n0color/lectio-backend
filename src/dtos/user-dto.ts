export default class UserDto {
  login: string;
  role: string;
  nickname: string;
  id: string;
  isActivated: boolean;

  constructor(model: any) {
    this.login = model.login;
    this.role = model.role;
    this.id = model.id;
    this.isActivated = model.isActivated;
    this.nickname = model.nickname;
  }
}