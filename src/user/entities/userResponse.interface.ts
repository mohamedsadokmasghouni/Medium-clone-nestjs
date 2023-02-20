import { UserType } from "../types/user.type";

export interface UserResponseInterface{
    user: UserType & { token: Promise<string>};
}