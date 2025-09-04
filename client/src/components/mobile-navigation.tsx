import { useLocation } from "wouter";

export function MobileNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: "fas fa-home", label: "Dashboard" },
    { path: "/analytics", icon: "fas fa-chart-bar", label: "Analytics" },
    { path: "/transactions", icon: "fas fa-list", label: "Transactions" },
    { path: "/bank-statement", icon: "fas fa-file-csv", label: "Statement" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" data-testid="mobile-navigation">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center justify-center transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <i className={`${item.icon} text-lg mb-1`}></i>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
