export type UserRole = "guest" | "user" | "admin" | "superadmin";

export type User = {
    id:string;
    username:string;
    avatarUrl:string;
    role?:UserRole;

}
export type AuthState = {
    user:User|null;
    isAuthenticated:boolean;
    status:"idle"|"loading"|"succeed"|"failed";
    error?:string;
    jwt?:string;
}