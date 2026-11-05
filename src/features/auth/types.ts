import type { Capability } from "@/lib/capabilities";
export type UserRole = "guest" | "student" | "teacher" | "admin" | "superadmin";

export type User = {
    capabilities?: Capability[];
    id:string;
    username:string;
    nickname?:string;
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