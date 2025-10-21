import clsx from "clsx";
import { Menu, PlusIcon } from "lucide-react";

import { links } from "../constants/links";
import { useAppContext, type Route } from "../contexts/AppContext";
import { BackupMenu } from "./BackupMenu";
import { WorkspaceMenu } from "./WorkspaceMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type HeaderProps = {
  onCreateRequest: () => void;
};

export const Header = ({ onCreateRequest }: HeaderProps) => {
  const { state, dispatch } = useAppContext();

  function linkHandler(link: Route) {
    dispatch({ type: "SET_ROUTE", payload: { route: link } });
  }

  return (
    <header className="mt-6 flex flex-wrap items-center justify-between gap-3 md:mt-12 md:gap-6">
      <div className="flex items-center gap-2 text-lg font-semibold tracking-tight md:text-xl">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="border border-border/50 bg-background/60 md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            {links.map((route) => (
              <DropdownMenuItem
                key={route}
                onSelect={() => linkHandler(route)}
                className={clsx(
                  "capitalize",
                  state.route === route && "bg-muted font-semibold text-foreground"
                )}
              >
                {route}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="font-mono lowercase text-foreground">habits</span>
      </div>

      <nav className="order-3 hidden w-full items-center justify-center gap-2 md:order-none md:flex md:w-auto">
        {links.map((route) => (
          <button
            key={route}
            type="button"
            onClick={() => linkHandler(route)}
            className={clsx(
              "rounded-md px-3 py-1.5 text-sm capitalize transition",
              "hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              state.route === route
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            {route}
          </button>
        ))}
      </nav>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-2 md:flex-none md:flex-nowrap">
        <WorkspaceMenu />
        <BackupMenu />
        <ThemeToggle />
        <Button
          onClick={onCreateRequest}
          className="w-full capitalize sm:w-auto md:min-w-[150px]"
        >
          <PlusIcon className="h-4 w-4" />
          create habit
        </Button>
      </div>
    </header>
  );
};
