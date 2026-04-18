import { NavLink } from "react-router-dom";

export default function NavItem({
  to,
  icon: Icon,
  label,
  end,
}: {
  to: string;
  icon: React.ComponentType<any>;
  label: string;
  end?: boolean;
}) {
  return (
    <li>
      <NavLink to={to} end={end}>
        {({ isActive }) => (
          <div
            className={`
              flex items-center gap-1.5
              px-4 py-2 rounded-md
              transition-all duration-200
              ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }
            `}
          >
            <Icon
              strokeWidth={isActive ? 2.5 : 1.5}
              size={36}
              className="h-4 w-4"
            />
            <span className="whitespace-nowrap">
              {label}
            </span>
          </div>
        )}
      </NavLink>
    </li>
  );
}
