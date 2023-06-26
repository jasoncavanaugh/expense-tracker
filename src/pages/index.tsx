import { type NextPage } from "next";
import * as RadixModal from "@radix-ui/react-dialog";
import { Expense } from "@prisma/client";
//import Head from "next/head";
//import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

import * as RadixPopover from "@radix-ui/react-popover";
import { useMemo, useState } from "react";
import { api } from "src/utils/api";
//import Spinner from "src/components/Spinner";
import Modal from "src/components/Modal";
import { BASE_COLORS, BaseColor, construct_color } from "src/utils/colors";
import { ExpenseCategoryWithExpenses } from "src/server/api/routers/router";
import Spinner from "src/components/Spinner";

const Home: NextPage = () => {
  const session = useSession();
  const expense_categories_query = api.router.get_categories.useQuery();
  const today_date = new Date();
  const day = today_date.getDate();
  const month = today_date.getMonth() + 1;
  const year = today_date.getFullYear();
  console.log("YEAR",year)
  const expenses_query = api.router.get_expenses.useQuery({
    from_date: {
      day: day - 14,
      month: month,
      year: year,
    },
    to_date: {
      day: day + 1,
      month: month,
      year: year
    }
  });

  console.log("expense_query.data", expenses_query.data);

  if (session.status === "loading") {
    return (
      <div className="flex h-[95vh] items-center justify-center p-1 md:p-4">
        <Spinner className="h-16 w-16 border-4 border-solid border-white lg:border-8" />
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    return (
      <div className="flex h-[95vh] items-center justify-center p-1 md:p-4">
        <button
          className="bg-togglPeach rounded-full px-6 py-2 text-3xl font-semibold text-white shadow-sm shadow-red-300 hover:brightness-110"
          onClick={() => void signIn()}
        >
          Sign In
        </button>
      </div>
    );
  }
  //console.log(expense_categories_query.status, expense_categories_query.data);
  
 return (
   <div className="p-1 md:p-4">
     <div className="flex flex-col-reverse items-end justify-end gap-2 px-1 pt-2 md:flex-row md:pt-0">
       <button
         className="rounded-full bg-togglPeach px-3 py-1 text-sm font-semibold text-white shadow-sm shadow-red-300 hover:brightness-110 md:px-5 md:text-lg"
         onClick={() => void signOut()}
       >
         Log Out
       </button>
     </div>
     <div className="h-2 md:h-4" />

     <ul className="flex flex-col gap-4">
       {expense_categories_query.status === "loading" && (
         <div className="flex h-[95vh] items-center justify-center">
           <Spinner className="h-16 w-16 border-4 border-solid border-white lg:border-8" />
         </div>
       )}
       {expense_categories_query.status === "error" && (
         <div className="flex h-[95vh] items-center justify-center">
           <h1 className="text-white">
             Uh oh, there was a problem loading your expenses.
           </h1>
         </div>
       )}
       {expense_categories_query.status === "success" &&
         expense_categories_query.data.length === 0 && (
           <div className="flex h-[95vh] items-center justify-center">
             <h1 className="text-white">
               Click the '+' button to add a new expense.
             </h1>
           </div>
         )}
       {expense_categories_query.status === "success" &&
         expense_categories_query.data.length > 0 && (
           <ChronologicalExpenseList expense_categories={expense_categories_query.data} />
         )}
     </ul>
     {expense_categories_query.status === "success" && (
       <AddNewExpenseButtonAndModal
         expense_categories={expense_categories_query.data}
       />
     )}
   </div>
 );
};

export default Home;

//Utils
function process_expense_data(
  expense_categories: ExpenseCategoryWithExpenses[]
) {
  const category_id_to_category_name = new Map<string, string>();
  for (const category of expense_categories) {
    category_id_to_category_name.set(category.id, category.name);
  }

  // for (let i = 0; i < expense_categories.length; i++) {
  //   const category = expense_categories[i]!;
  //   category_id_to_category_name.set(category.id, category.name);
  // }

  const date_to_expense = new Map<string, Expense[]>();
  const dates = [];
  for (let i = 0; i < expense_categories.length; i++) {
    const category = expense_categories[i]!;
    for (let j = 0; j < category.expenses.length; j++) {
      const exp = category.expenses[j]!;
      const exp_creation_date = `${exp.createdAt.getFullYear()}/${exp.createdAt.getMonth() + 1
        }/${exp.createdAt.getDate()}`;
      if (!date_to_expense.has(exp_creation_date)) {
        date_to_expense.set(exp_creation_date, []);
        dates.push(exp_creation_date);
      }
      date_to_expense.get(exp_creation_date)!.push(exp);
    }
  }
  dates.sort((a, b) => (new Date(a) < new Date(b) ? -1 : 1)).reverse();
  return { sorted_dates: dates, date_to_expense, category_id_to_category_name };
}

interface Props {
  expense_categories: ExpenseCategoryWithExpenses[];
}
function ChronologicalExpenseList({ expense_categories }: Props) {
  const { sorted_dates, date_to_expense, category_id_to_category_name } =
    useMemo(
      () => process_expense_data(expense_categories),
      [expense_categories]
    );
  const output = [];
  console.log("sorted_dates", sorted_dates, "date_to_expense", date_to_expense, "category_id_to_category_name", category_id_to_category_name);
  let c = 0;
  for (const d of sorted_dates) {
    c++;
    output.push(
      <li key={c} className="p-4">
        <h1 className="inline rounded-lg bg-togglPeach p-2 font-bold">
          {d.replaceAll("/", "-")}
        </h1>
        <div className="h-4" />
        <ul className="flex flex-col gap-6 rounded-lg border p-4">
          <ExpenseListForDay
            expenses={date_to_expense.get(d)!}
            category_id_to_category_name={category_id_to_category_name}
          />
        </ul>
      </li>
    );
  }
  return (
    <>
      {output}
    </>
  );
}

// {date_to_expense.get(d)!.map((exp) => {
//   return (
//     <li key={exp.id} className="border bg-purple-300 p-2 flex gap-4 items-center">
//       <p className="border bg-pink-500 p-2 rounded-lg font-semibold">{category_id_to_category_name.get(exp.category_id)}</p>
//       <p className="bg-purple-800 px-2 py-1 rounded-full">{`$${Math.floor(exp.amount / 100)}.${exp.amount % 100}`}</p>
//     </li>
//   );
// })}

/*
  id: string;
  createdAt: Date;
  updatedAt: Date;
  amount: number;
  category_id: string;
*/
function ExpenseListForDay({
  expenses,
  category_id_to_category_name,
}: {
  expenses: Expense[];
  category_id_to_category_name: Map<string, string>;
}) {
  const name_to_list_of_expenses = ((
    _expenses: Expense[],
    _category_id_to_category_name: Map<string, string>
  ) => {
    const out = new Map<string, number[]>();
    for (const e of _expenses) {
      const name = _category_id_to_category_name.get(e.category_id)!;
      if (!out.has(name)) {
        out.set(name, []);
      }
      out.get(name)!.push(e.amount);
    }
    return out;
  })(expenses, category_id_to_category_name);

  console.log("name_to_cost", name_to_list_of_expenses);
  const keys = name_to_list_of_expenses.keys();
  console.log("keys", keys);
  let output = [];
  // <h2 className="bg-lightTogglPeach text-togglPeach px-2 py-1 rounded-lg font-bold">
  for (const k of keys) {
    const expense_list = name_to_list_of_expenses.get(k)!;
    const sum_of_expenses = expense_list.reduce((acc, e) => e + acc, 0);
    output.push(
      <li key={k} className="">
        <div className="flex justify-between">
          <h2
            className={`rounded-lg bg-amber-200 px-2 py-1 font-bold text-amber-700`}
          >
            {k}
          </h2>
          <p className="font-semibold text-togglPeach">
            ${Math.floor(sum_of_expenses / 100)}.{sum_of_expenses % 100}
          </p>
        </div>
        <ul className="flex gap-1 py-2">
          {expense_list.map((expense, i) => {
            return (
              <li key={i} className="rounded-full bg-pink-700 px-2">
                ${Math.floor(expense / 100)}.{expense % 100}
              </li>
            );
          })}
        </ul>
      </li>
    );
  }
  console.log(output);
  return <>{output}</>;
}
// lightBeige: "#fef9f7",
// darkDarkPurple: "#220a2e",
// darkPurple: "#2c1338",
// lightViolet: "#e57cd8",
// togglPeach: "#e87161",
// lightTogglPeach: "#fbe9e6",
// togglBtnGray: "#95899a",

function is_valid_amount(amount: string) {
  const amount_regex = new RegExp(/^\d*(\.\d\d)?$/);
  const is_zero_amount =
    amount.split("").filter((c) => c !== "." && c !== "0").length === 0;
  return amount_regex.test(amount) && !is_zero_amount;
}

function AddNewExpenseButtonAndModal({ expense_categories }: Props) {
  const [amount, set_amount] = useState("");
  const [is_modal_open, set_is_modal_open] = useState(false);
  const [category_text, set_category_text] = useState("");
  const [is_dropdown_open, set_is_dropdown_open] = useState(false);
  const [color, set_color] = useState<BaseColor>("pink");
  const [
    is_category_color_selection_disabled,
    set_is_category_color_selection_disabled,
  ] = useState(false);

  const api_utils = api.useContext();

  const create_expense = api.router.create_expense.useMutation({
    onSuccess: () => {
      set_is_modal_open(false);
      return api_utils.router.get_categories.invalidate();
    },
    onError: (err, data, ctx) => {
      console.log(err, data);
      alert("error");
    },
  });
  const create_category_and_expense = api.router.create_category.useMutation({
    onSuccess: (data, variables, context) => {
      create_expense.mutate({ category_id: data.id, amount: amount });
    },
    onError: (err, data, ctx) => {
      alert("error in create_caegory_and_expense");
    },
  });

  function handle_create_expense() {
    const does_category_exist =
      expense_categories.filter((exp) => exp.name === category_text).length > 0;
    if (!does_category_exist) {
      create_category_and_expense.mutate({
        name: category_text,
        color: color,
      });
    } else {
      const id = expense_categories.find((c) => c.name === category_text)?.id;
      console.log("id", id, "amount", amount);
      if (!id) throw new Error("id undefined");
      create_expense.mutate({ category_id: id, amount: amount });
    }
  }

  const is_create_expense_button_disabled =
    category_text.length === 0 ||
    color.length === 0 ||
    amount.length === 0 ||
    !is_valid_amount(amount) ||
    is_dropdown_open; //This is because if the dropdown is still open, that indicates that the user hasn't selected something yet

  const does_category_exist =
    expense_categories.filter((cat) => cat.name === category_text).length === 0;

  return (
    <Modal
      open={is_modal_open}
      on_open_change={() => {
        set_amount("");
        set_category_text("");
        set_is_dropdown_open(false);
        set_is_category_color_selection_disabled(false);
        set_color("pink");
      }}
      className="left-1/2 top-1/3 flex w-[30rem] -translate-x-1/2 -translate-y-1/2 flex-col border-t-8 border-t-togglPeach px-5 py-3 lg:top-1/2 lg:top-1/2 lg:px-8 lg:py-6"
      trigger={
        <button
          type="button"
          className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-togglPeach text-3xl font-bold text-white md:bottom-16 md:right-16 lg:shadow-md lg:shadow-red-300 lg:transition-all lg:hover:-translate-y-1 lg:hover:shadow-lg lg:hover:shadow-red-300 lg:hover:brightness-110"
          onClick={() => set_is_modal_open(true)}
        >
          +
        </button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handle_create_expense();
        }}
      >
        <RadixModal.Title className="whitespace-nowrap text-3xl font-bold text-slate-700">
          Add Expense
        </RadixModal.Title>
        <div className="h-1 lg:h-4" />
        <div className="w-full">
          <label htmlFor="amount" className="block">
            Amount
          </label>
          <div className="h-2" />
          <input
            name="amount"
            inputMode="numeric"
            placeholder="0.01"
            onChange={(e) => {
              set_amount(e.target.value.trim());
              set_is_category_color_selection_disabled(false);
            }}
            className="w-full rounded border border-slate-600 px-2 py-1 focus:outline-slate-400"
            autoComplete="off"
            type="text"
          ></input>
          <div className="m-0 h-7">
            {amount.length > 0 && !is_valid_amount(amount) && (
              <p className="text-sm text-red-600">Invalid amount</p>
            )}
          </div>
          <label htmlFor="category">Category</label>
          <div className="h-2" />
          <div className="flex items-center gap-3">
            <CategoryColorSelection
              disabled={is_category_color_selection_disabled}
              on_select_color={(color) => set_color(color)}
              cur_color={color}
            />
            <div className="w-full">
              <input
                name="category"
                value={category_text}
                onChange={(e) => {
                  set_category_text(e.target.value);
                  set_is_dropdown_open(true);
                  set_is_category_color_selection_disabled(false);
                }}
                className="w-full grow rounded border border-slate-600 px-2 py-1 focus:outline-slate-400"
                autoComplete="off"
                type="text"
              ></input>
              <div className="relative m-0 h-0 p-0">
                {category_text.length > 0 && is_dropdown_open && (
                  <ul className="absolute z-20 flex max-h-[200px] w-full flex-col gap-2 overflow-y-scroll rounded border border bg-white p-3">
                    {expense_categories
                      .filter(
                        (cat) =>
                          cat.name.includes(category_text) ||
                          category_text.includes(cat.name)
                      )
                      .map((exp) => {
                        return (
                          <li
                            key={exp.id}
                            className="flex items-center gap-3 rounded border border-purple-300 px-3 py-2 hover:cursor-pointer hover:bg-purple-100"
                            onClick={() => {
                              set_category_text(exp.name);
                              set_color(exp.color);
                              set_is_dropdown_open(false);
                              set_is_category_color_selection_disabled(true);
                            }}
                          >
                            <div
                              className={`bg-${exp.color} h-4 w-4 rounded-full`}
                            />
                            <p className="">{exp.name}</p>
                          </li>
                        );
                      })}
                    {does_category_exist && (
                      <li
                        className="rounded p-2 hover:cursor-pointer hover:bg-purple-100"
                        onClick={() => set_is_dropdown_open(false)}
                      >
                        <span>+</span>
                        {` Create '${category_text.trim()}'`}
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="h-8" />
        <div className="flex justify-center gap-5">
          <button
            className="rounded-full bg-togglBtnGray px-3 py-2 text-xs font-semibold text-white hover:brightness-110 lg:px-5 lg:py-3 lg:text-base lg:font-bold"
            type="button"
            onClick={() => {
              set_is_modal_open(false);
            }}
          >
            Cancel
          </button>
          <button
            className={`rounded-full border bg-togglPeach px-3 py-2 text-xs font-semibold text-white lg:px-5 lg:py-3 lg:text-base lg:font-bold ${is_create_expense_button_disabled
              ? "opacity-50"
              : "hover:cursor-pointer hover:brightness-110"
              }`}
            type="submit"
            disabled={is_create_expense_button_disabled}
          >
            Create
            {/*
            {create_habit.status === "loading" && (
              <Spinner className="mx-[2.1rem] h-4 w-4 border-2 border-solid border-white lg:mx-[3.1rem] lg:my-1" />
            )}

            {create_habit.status !== "loading" && "Create Habit"}
            */}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function CategoryColorSelection({
  on_select_color,
  cur_color,
  disabled,
}: {
  on_select_color: (color: BaseColor) => void;
  cur_color: BaseColor | "";
  disabled: boolean;
}) {
  const [is_open, set_is_open] = useState(false);
  return (
    <RadixPopover.Root
      open={is_open}
      onOpenChange={(open) => {
        disabled ? set_is_open(false) : set_is_open(open);
      }}
    >
      <RadixPopover.Trigger asChild>
        <button
          className={`h-4 w-4 shrink-0 rounded-full md:h-6 md:w-6 ${cur_color !== ""
            ? construct_color("bg", cur_color, 500)
            : construct_color("bg", "pink", 500)
            } ${disabled
              ? "hover:cursor-not-allowed"
              : "hover:cursor-pointer hover:brightness-110"
            }`}
        ></button>
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side="left"
          className="z-30 flex flex-wrap rounded border border-slate-300 bg-white p-3 shadow-md md:h-[200px] md:w-[150px] md:flex-col md:gap-1"
          sideOffset={5}
        >
          {BASE_COLORS.map((option) => {
            return (
              <div
                key={option}
                onClick={() => on_select_color(option)}
                className={`${construct_color(
                  "bg",
                  option,
                  500
                )} h-4 w-4 rounded-full border-2 ${cur_color === option
                  ? "border-slate-900 brightness-110"
                  : "border-white hover:cursor-pointer hover:border-slate-900 hover:brightness-110"
                  } md:h-6 md:w-6`}
              />
            );
          })}
          <RadixPopover.Close
            className="PopoverClose"
            aria-label="Close"
          ></RadixPopover.Close>
          <RadixPopover.Arrow className="fill-slate-300" />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
