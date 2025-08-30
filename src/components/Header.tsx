import clsx from "clsx";
import { links } from "../constants/links";
import { useAppContext, type Route } from "../contexts/AppContext";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const Header = () => {
  const { state, dispatch } = useAppContext();

  console.log(state);

  function linkHandler(link: Route) {
    dispatch({ type: "SET_ROUTE", payload: { route: link } });
  }

  const selectedStyle =
    "px-2 py-1 rounded-md backdrop-blur-md " +
    "bg-black/10 text-black dark:bg-white/10 dark:text-white " +
    "hover:bg-black/20 dark:hover:bg-white/20";

  const unselectedStyle =
    "px-2 py-1 rounded-md font-thin cursor-pointer transition-colors duration-300 " +
    "text-black dark:text-white " +
    "hover:bg-black/10 dark:hover:bg-white/10 " +
    "hover:backdrop-blur-md";
  return (
    <header className="flex justify-between mt-12 items-center">
      <div className="dark:text-white font-bold font-mono">habits</div>
      <div className="flex items-center gap-2">
        <ul className="flex justify-between gap-2">
          {links.map((route, index) => {
            return (
              <li
                className={clsx(
                  "cursor-pointer transition-colors duration-300",
                  state.route === route ? selectedStyle : unselectedStyle
                )}
                key={index}
                onClick={() => linkHandler(route)}
              >
                {route}
              </li>
            );
          })}
        </ul>
        <Button>
          <PlusIcon className="h-4 w-4" />
          create habit
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
};
