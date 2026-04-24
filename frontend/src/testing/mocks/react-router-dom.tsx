import React from "react";

type WithChildren = { children?: React.ReactNode };
type RouteProps = { element?: React.ReactNode; children?: React.ReactNode };
type LinkProps = { to: string; className?: string; children?: React.ReactNode };
type NavLinkProps = {
  to: string;
  end?: boolean;
  className?: string | ((state: { isActive: boolean }) => string);
  children?: React.ReactNode;
};

let navigateMock = jest.fn();

export function __resetRouterMocks() {
  navigateMock = jest.fn();
}

export function __getNavigateMock() {
  return navigateMock;
}

export function BrowserRouter({ children }: WithChildren) {
  return <>{children}</>;
}

export function Routes({ children }: WithChildren) {
  return <>{children}</>;
}

export function Route({ element, children }: RouteProps) {
  return (
    <>
      {element}
      {children}
    </>
  );
}

export function Navigate({ to }: { to: string }) {
  return <div data-testid="navigate" data-to={to} />;
}

export function Outlet() {
  return <div data-testid="outlet" />;
}

export function Link({ to, className, children }: LinkProps) {
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}

export function NavLink({ to, className, children }: NavLinkProps) {
  const computedClassName =
    typeof className === "function" ? className({ isActive: false }) : className;
  return (
    <a href={to} className={computedClassName}>
      {children}
    </a>
  );
}

export function useNavigate() {
  return navigateMock;
}
