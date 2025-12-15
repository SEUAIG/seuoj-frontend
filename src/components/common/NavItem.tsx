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
              flex items-center gap-1
              px-4 py-2 rounded-full
              transition-all duration-400 relative
              hover:bg-slate-300
              ${
                isActive
                  ? "bg-accent ring-1 ring-border text-foreground font-medium shadow"
                  : "text-muted-foreground hover:bg-muted/100 hover:text-foreground"
              }
            `}
          >
            <Icon
              strokeWidth={isActive ? 2.5 : 1.5}
              size={36}
              className="h-4 w-4"
            />
            <span
              className={`whitespace-nowrap ${
                isActive ? "font-bold" : "font-normal"
              }`}
            >
              {label}
            </span>
            {isActive && (
              <span
                className="
            absolute left-2 right-2 -bottom-1
            h-0.5
            rounded-full
            bg-primary
          "
              />
            )}
          </div>
        )}
      </NavLink>
    </li>
  );
}
