import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { hasCapability } from "@/lib/capabilities";

interface SubmitterLinkProps {
  username: string;
  nickname?: string;
  userId?: number;
}

export default function SubmitterLink({ username, nickname, userId }: SubmitterLinkProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const canViewOthers = hasCapability(user, "TEACHER") || hasCapability(user, "USER_MANAGE");
  const path = user?.username === username
    ? "/personal"
    : canViewOthers && userId ? `/user/${userId}` : null;
  const name = nickname || username;

  return path ? (
    <Link to={path} onClick={(event) => event.stopPropagation()} className="text-primary hover:underline">
      {name}
    </Link>
  ) : <>{name}</>;
}
