import { cn } from "src/utils/cn";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ThemeButton } from "./ThemeButton";
import { ReactNode } from "react";
import {
  BUTTON_HOVER_CLASSES,
  EXPENSES_ROUTE,
  VISUALIZE_ROUTE,
} from "src/utils/constants";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const cur_route = router.route;

  return (
    <div className="bg-charmander dark:bg-khazix">
      <div className="h-full bg-charmander dark:bg-khazix md:p-4">
        <div className="flex items-center justify-between px-2 pt-2 md:pt-0">
          <button
            className={cn(
              "rounded-full",
              "w-[6rem] border border-squirtle py-1 text-sm font-semibold text-squirtle dark:border-transparent",
              "hover:brightness-110 dark:text-rengar md:w-[8rem] md:text-lg",
              BUTTON_HOVER_CLASSES
            )}
            onClick={
              () => {
                cur_route === EXPENSES_ROUTE
                  ? router.push(VISUALIZE_ROUTE)
                  : router.push(EXPENSES_ROUTE);
              }
              // set_page(page == "visualize" ? "expenses" : "visualize")
            }
          >
            {/* {page === "visualize" ? "Expenses" : "Visualize"} */}
            {cur_route === VISUALIZE_ROUTE ? "Expenses" : "Visualize"}
          </button>
          <div className="flex items-center justify-end gap-2 lg:gap-4">
            <ThemeButton />
            <button
              className={cn(
                "rounded-full bg-squirtle px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-blue-300",
                "hover:brightness-110 dark:bg-rengar md:px-5 md:text-lg"
              )}
              onClick={() => void signOut()}
            >
              Log Out
            </button>
          </div>
        </div>
        <div className="h-2 md:h-4" />
        {cur_route === EXPENSES_ROUTE ? ( <ul className="flex flex-col gap-4"> {children} </ul>) :  ( <div className="flex flex-col gap-4"> {children} </div>)}
    </div>
    </div>
  );
}
