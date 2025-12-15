export type User = {
    id:string;
    username:string;
    avatarUrl:string;
    role?:"student"|"admin"|"teacher";

}
export type AuthState = {
    user:User|null;
    isAuthenticated:boolean;
    status:"idle"|"loading"|"succeed"|"failed";
    error?:string;
}