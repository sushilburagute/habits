import clsx from "clsx";
import { links } from "../constants/links";
import { useAppContext, type Route } from "../contexts/AppContext";

export const Header = () => {
  const { state, dispatch } = useAppContext();

  console.log(state);

  function linkHandler(link: Route) {
    dispatch({ type: "SET_ROUTE", payload: { route: link } });
  }

  const selectedStyle = "bg-white/10 backdrop-blur-md text-white px-2 py-1 rounded-md";
  const unselectedStyle =
    "text-white bg-transparent font-thin hover:bg-white/10 hover:backdrop-blur-md hover:text-white px-2 py-1 rounded-md";
  return (
    <header className="flex justify-between mt-12">
      <div className="text-white font-bold font-mono">habits</div>
      <div>
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
      </div>
    </header>
  );
};
