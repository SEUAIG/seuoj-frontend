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
              hover:bg-muted
              ${
                isActive
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
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
            {(
              <span
                className={`
            absolute left-2 right-2 -bottom-1
            h-0.5
            rounded-full
            bg-primary transform transition-transform delay-0 ease-in-out duration-500 origin-center
            ${isActive?"scale-x-100":"scale-x-0"}
          `}
              />
            )}
          </div>
        )}
      </NavLink>
    </li>
  );
}
