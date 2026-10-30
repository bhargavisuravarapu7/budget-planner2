import Payments from "./Payments";
import Signup from "./Signup";
import Signin from "./Signin";
import { useState, useEffect } from "react";
import {
  getTransactions,
  addTransaction,
  deleteTransaction as deleteTransactionAPI,
  updateTransaction,
} from "./services/transactionService";
import {
  getBudget,
  saveBudget,
} from "./services/budgetService";
import {
  getSavingsGoals,
  addSavingsGoal,
  deleteSavingsGoal,
} from "./services/savingsGoalService";
import {
  LayoutDashboard,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Target,
  Settings,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  TrendingUp,
  CreditCard,
  PiggyBank,
  Smartphone,
  Monitor,
  LogOut,

} from "lucide-react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import "./App.css";



const COLORS = ["#6558f5", "#16a085", "#f39c12", "#e76f51"];

function App() {
const [transactions, setTransactions] = useState([]);
const [savingsGoals, setSavingsGoals] = useState([]);
const [showGoalForm, setShowGoalForm] = useState(false);
const [currentUser, setCurrentUser] = useState(() => {
  const savedUser = localStorage.getItem("budgetPlannerUser");
  return savedUser ? JSON.parse(savedUser) : null;
});
const [isLoggedIn, setIsLoggedIn] = useState(() => {
  return localStorage.getItem("budgetPlannerUser") !== null;
});
const [showSignup, setShowSignup] = useState(false);
const handleLogout = () => {
  setCurrentUser(null);
  setIsLoggedIn(false);
  setShowSignup(false);
  setTransactions([]);
  setSavingsGoals([]);
  setMonthlyBudget(10000);
};

const [goalForm, setGoalForm] = useState({
  name: "",
  targetAmount: "",
  savedAmount: "",
  targetDate: "",
});
const [loading, setLoading] = useState(true);
const [showForm, setShowForm] = useState(false);
const [sidebarOpen, setSidebarOpen] = useState(false);
const [mobilePreview, setMobilePreview] = useState(false);
const [showSettings, setShowSettings] = useState(false);
const [showPayments, setShowPayments] = useState(false);
const [showNotifications, setShowNotifications] = useState(false);
const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
  return localStorage.getItem("budgetPlannerNotifications") !== "false";
});
const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem("budgetPlannerTheme") === "dark";
});
const [searchTerm, setSearchTerm] = useState("");
const [filterType, setFilterType] = useState("All");
const [filterCategory, setFilterCategory] = useState("All");
const [monthlyBudget, setMonthlyBudget] = useState(10000);
const [editingTransaction, setEditingTransaction] = useState(null);
useEffect(() => {
  document.body.classList.toggle("dark-mode", darkMode);
  localStorage.setItem("budgetPlannerTheme", darkMode ? "dark" : "light");
}, [darkMode]);
const [editForm, setEditForm] = useState({
  title: "",
  amount: "",
  category: "",
  type: "Expense",
  date: "",
  description: "",
});
    // Load transactions from the backend when the page opens
   useEffect(() => {
  if (!currentUser?.id) {
    setLoading(false);
    return;
  }

  const loadTransactions = async () => {
    try {
      const data = await getTransactions(currentUser.id);
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
      alert("Unable to load transactions. Check your backend.");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedBudget = async () => {
    try {
      const data = await getBudget(currentUser.id);
      setMonthlyBudget(Number(data.monthlyLimit));
    } catch (error) {
      console.error("Failed to load budget:", error);
      alert("Unable to load saved budget.");
    }
  };

  const loadSavingsGoals = async () => {
    try {
      const data = await getSavingsGoals(currentUser.id);
      setSavingsGoals(data);
    } catch (error) {
      console.error("Failed to load savings goals:", error);
      alert("Unable to load savings goals.");
    }
  };

  loadTransactions();
  loadSavedBudget();
  loadSavingsGoals();
}, [currentUser]);
  const [form, setForm] = useState({
    title: "",
    category: "Food",
    date: new Date().toISOString().slice(0, 10),
    type: "Expense",
    amount: "",
  });

  const income = transactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const expenses = transactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthlyExpenses = transactions
  .filter(
    (item) =>
      item.type === "Expense" &&
      item.date?.slice(0, 7) === currentMonth
  )
  .reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );


  const balance = income - expenses;
  const filteredTransactions = transactions.filter((item) => {
  const matchesSearch = item.title
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesType =
    filterType === "All" || item.type === filterType;

  const matchesCategory =
    filterCategory === "All" ||
    item.category === filterCategory;

  return matchesSearch && matchesType && matchesCategory;
});
  const totalExpenses = transactions
  .filter((item) => item.type === "Expense")
  .reduce((sum, item) => sum + Number(item.amount), 0);

const remainingBudget = monthlyBudget - monthlyExpenses;

const monthlySpendingData = Object.values(
  transactions
    .filter((item) => item.type === "Expense")
    .reduce((acc, item) => {
      const month = item.date?.slice(0, 7);

      if (!month) return acc;

      if (!acc[month]) {
        acc[month] = {
          month,
          expenses: 0,
        };
      }

      acc[month].expenses += Number(item.amount);

      return acc;
    }, {})
).sort((a, b) => a.month.localeCompare(b.month));
const spendingData = Object.values(
  transactions
    .filter((item) => item.type === "Expense")
    .reduce((acc, item) => {
      const category = item.category || "Other";

      if (!acc[category]) {
        acc[category] = {
          name: category,
          value: 0,
        };
      }

      acc[category].value += Number(item.amount);

      return acc;
    }, {})
);
  const formatMoney = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

    const budgetNotification = (() => {
  if (!notificationsEnabled || monthlyBudget <= 0) {
    return null;
  }

  if (monthlyExpenses > monthlyBudget) {
    return {
      type: "danger",
      title: "Budget Exceeded",
      message: `You have exceeded your budget by ${formatMoney(
        monthlyExpenses - monthlyBudget
      )}.`,
    };
  }

  if (monthlyExpenses >= monthlyBudget * 0.8) {
    return {
      type: "warning",
      title: "Budget Warning",
      message: `You have used ${Math.round(
        (monthlyExpenses / monthlyBudget) * 100
      )}% of your monthly budget.`,
    };
  }

  return null;
})();

    const exportTransactions = () => {
  if (transactions.length === 0) {
    alert("No transactions to export.");
    return;
  }

  const headers = [
    "Title",
    "Amount",
    "Category",
    "Type",
    "Date",
    "Description",
  ];

  const rows = transactions.map((item) => [
    item.title,
    item.amount,
    item.category,
    item.type,
    item.date,
    item.description || "",
  ]);

  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row
        .map((value) =>
          `"${String(value ?? "").replace(/"/g, '""')}"`
        )
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "budget-transactions.csv";
  link.click();
setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const handleGoalSubmit = async (e) => {
  e.preventDefault();

  if (
    !goalForm.name.trim() ||
    Number(goalForm.targetAmount) <= 0 ||
    Number(goalForm.savedAmount) < 0
  ) {
    alert("Please enter valid savings goal details.");
    return;
  }

  if (Number(goalForm.savedAmount) > Number(goalForm.targetAmount)) {
    alert("Saved amount cannot exceed the target amount.");
    return;
  }

  try {
    const newGoal = {
      ...goalForm,
      name: goalForm.name.trim(),
      targetAmount: Number(goalForm.targetAmount),
      savedAmount: Number(goalForm.savedAmount),
      targetDate: goalForm.targetDate || null,
      userId: currentUser.id,
    };

    const savedGoal = await addSavingsGoal(newGoal,
  currentUser.id);

    setSavingsGoals((prev) => [...prev, savedGoal]);

    setGoalForm({
      name: "",
      targetAmount: "",
      savedAmount: "",
      targetDate: "",
    });

    setShowGoalForm(false);
    alert("Savings goal added successfully!");
  } catch (error) {
    console.error("Failed to add savings goal:", error);
    alert("Unable to save savings goal.");
  }
};
    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || Number(form.amount) <= 0) {
      alert("Please enter a valid title and amount.");
      return;
    }

    const newTransaction = {
      title: form.title.trim(),
      category: form.category,
      date: form.date,
      type: form.type,
      amount: Number(form.amount),
    };

    try {
      const savedTransaction = await addTransaction( newTransaction,
  currentUser.id);

      setTransactions((prev) => [
        savedTransaction,
        ...prev,
      ]);

      setForm({
        title: "",
        category: "Food",
        date: new Date().toISOString().slice(0, 10),
        type: "Expense",
        amount: "",
      });

      setShowForm(false);
    } catch (error) {
      console.error("Failed to save transaction:", error);
      alert("Unable to save transaction. Please check your backend.");
    }
  };
const handleDeleteTransaction = async (id) => {
  try {
    await deleteTransactionAPI(id, currentUser.id);

    setTransactions((prev) =>
      prev.filter((item) => item.id !== id)
    );
  } catch (error) {
    console.error("Delete error:", error);
    alert("Unable to delete transaction.");
  }
};
const handleEditClick = (transaction) => {
  setEditingTransaction(transaction);

  setEditForm({
    title: transaction.title || "",
    amount: transaction.amount || "",
    category: transaction.category || "",
    type: transaction.type || "Expense",
    date: transaction.date || "",
    description: transaction.description || "",
  });
};
const handleUpdateSubmit = async (e) => {
  e.preventDefault();

  if (!editForm.title.trim() || Number(editForm.amount) <= 0) {
    alert("Please enter a valid title and amount.");
    return;
  }

  try {
    const updated = await updateTransaction(
      editingTransaction.id,
      {
        ...editForm,
        title: editForm.title.trim(),
        amount: Number(editForm.amount),
      },
      currentUser.id
    );

    setTransactions((prev) =>
      prev.map((item) =>
        item.id === updated.id ? updated : item
      )
    );

    setEditingTransaction(null);
    alert("Transaction updated successfully!");
  } catch (error) {
    console.error("Update error:", error);
    alert("Unable to update transaction.");
  }
};

  if (!isLoggedIn) {
    if (showSignup) {
      return (
        <Signup
          onSignupSuccess={() => setShowSignup(false)}
          onShowSignin={() => setShowSignup(false)}
        />
      );
    }

    return (
  <Signin
  onSigninSuccess={(user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem("budgetPlannerUser", JSON.stringify(user));
  }}
  onShowSignup={() => setShowSignup(true)}
/>
    );
  }

  return (
    <div className={`app-container ${mobilePreview ? "mobile-preview" : ""}`}>
      
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Wallet size={25} />
          </div>
          <h2>Budget Planner</h2>
          <button
            className="close-sidebar"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <p className="menu-label">MAIN MENU</p>

        <nav className="sidebar-nav">
          <a className="nav-item active" href="#dashboard">
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a className="nav-item" href="#transactions">
            <ArrowUpCircle size={19} />
            Transactions
          </a>

          <a className="nav-item" href="#budgets">
            <Target size={19} />
            Budgets
          </a>

          <a className="nav-item" href="#savings">
            <PiggyBank size={19} />
            Savings Goals
          </a>
          <button
  className="nav-item"
  onClick={() => {
    setShowPayments(true);
    setShowSettings(false);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }}
>
  <CreditCard size={19} />
  Payments
</button>
          <button
  className="nav-item settings-nav-button"
  onClick={() => {
  setShowSettings(true);
  setShowPayments(false);
  setSidebarOpen(false);
  window.scrollTo({ top: 0, behavior: "smooth" });
}}
>
  <Settings size={19} />
  Settings
</button>
        </nav>
<button className="logout-button" onClick={handleLogout}>
  <LogOut size={18} />
  <span>Logout</span>
</button>
        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">
              <TrendingUp size={22} />
            </div>
            <h3>Save more every month</h3>
            <p>Track your spending and build better financial habits.</p>
          </div>

          <div className="profile">
  <div className="avatar">
    {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
  </div>

  <div>
    <strong>{currentUser?.name || "User"}</strong>
    <span>Personal Account</span>
  </div>
</div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={23} />
            </button>

            <div>
              <h1>Dashboard</h1>
              <p>Welcome back! Here's your financial overview.</p>
            </div>
          </div>

          <div className="topbar-actions">
            <button
  className="icon-button preview-toggle"
  type="button"
  onClick={() => setMobilePreview((prev) => !prev)}
  title={mobilePreview ? "Switch to desktop preview" : "Switch to mobile preview"}
  aria-label={mobilePreview ? "Switch to desktop preview" : "Switch to mobile preview"}
>
  {mobilePreview ? <Monitor size={20} /> : <Smartphone size={20} />}
</button>
            <button
  className="icon-button"
  aria-label="Search"
  title="Search transactions"
  onClick={() => {
    setShowSettings(false);
    document.getElementById("transactions")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setTimeout(() => {
      document.querySelector(
        '.transaction-filters input[placeholder="Search transactions..."]'
      )?.focus();
    }, 400);
  }}
>
  <Search size={20} />
</button>
           <div className="notification-wrapper">
  <button
    className="icon-button"
    aria-label="Notifications"
    onClick={() => setShowNotifications(!showNotifications)}
  >
    <Bell size={20} />

    {budgetNotification && (
      <span className="notification-dot" />
    )}
  </button>

  {showNotifications && (
    <div className="notification-dropdown">
      <div className="notification-header">
        <strong>Notifications</strong>
        <Bell size={18} />
      </div>

      {!budgetNotification ? (
        <div className="notification-empty">
          <Bell size={24} />
          <p>No new notifications</p>
          <span>Your budget is currently under control.</span>
        </div>
      ) : (
        <div className={`notification-item ${budgetNotification.type}`}>
          <div className="notification-item-icon">
            <Bell size={18} />
          </div>

          <div>
            <strong>{budgetNotification.title}</strong>
            <p>{budgetNotification.message}</p>
          </div>
        </div>
      )}
    </div>
  )}
</div>
            <div className="avatar top-avatar">
              {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>
{!showSettings && !showPayments && (
  <>
    <section className="welcome-row">
      <div>
        <h2>Your finances at a glance</h2>
        <p>Keep track of your money and make smarter decisions.</p>
      </div>

      <button
        className="primary-button"
        onClick={() => setShowForm(true)}
      >
        <Plus size={19} />
        Add Transaction
      </button>
    </section>

    <section className="summary-grid">
      <div className="summary-card balance-card">
        <div className="summary-top">
          <span>Total Balance</span>
          <div className="summary-icon purple">
            <Wallet size={21} />
          </div>
        </div>
        <h2>{formatMoney(balance)}</h2>
        <p className="summary-note">
          <TrendingUp size={15} /> Income minus expenses
        </p>
      </div>

      <div className="summary-card">
        <div className="summary-top">
          <span>Total Income</span>
          <div className="summary-icon green">
            <ArrowDownCircle size={21} />
          </div>
        </div>
        <h2>{formatMoney(income)}</h2>
        <p className="summary-note green-text">Money received</p>
      </div>

      <div className="summary-card">
        <div className="summary-top">
          <span>Total Expenses</span>
          <div className="summary-icon orange">
            <ArrowUpCircle size={21} />
          </div>
        </div>
        <h2>{formatMoney(monthlyExpenses)}</h2>
        <p className="summary-note orange-text">Money spent</p>
      </div>

      <div className="summary-card">
        <div className="summary-top">
          <span>Savings Rate</span>
          <div className="summary-icon blue">
            <PiggyBank size={21} />
          </div>
        </div>
        <h2>
          {income > 0
            ? `${Math.round((balance / income) * 100)}%`
            : "0%"}
        </h2>
        <p className="summary-note">Of your total income</p>
      </div>
    </section>

    <section className="dashboard-grid">
      <div className="panel spending-panel">
        <div className="panel-header">
          <div>
            <h3>Spending Breakdown</h3>
            <p>Expenses by category</p>
          </div>
          <span className="period-badge">This Month</span>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={spendingData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
              >
                {spendingData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMoney(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="category-list">
          {spendingData.map((item, index) => (
            <div className="category-item" key={item.name}>
              <div className="category-name">
                <span
                  className="category-dot"
                  style={{
                    backgroundColor: COLORS[index % COLORS.length],
                  }}
                />
                {item.name}
              </div>

              <strong>{formatMoney(item.value)}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Expense Report */}
      <div className="panel monthly-report">
        <div className="panel-header">
          <div>
            <h3>Monthly Expense Report</h3>
            <p>Track your expenses month by month</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlySpendingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatMoney(value)} />
            <Bar dataKey="expenses" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="panel budget-panel" id="budgets">
        <div className="panel-header">
          <div>
            <h3>Monthly Budget</h3>
            <p>Your spending limit</p>
          </div>
          <Target size={22} className="panel-icon" />
        </div>

        <div className="budget-total">
          <span>Monthly Budget Limit</span>

          <input
            type="number"
            min="1"
            value={monthlyBudget}
            onChange={async (e) => {
              const value = Number(e.target.value);

              setMonthlyBudget(value);

              if (value > 0) {
                try {
                  await saveBudget(value, currentUser.id);
                } catch (error) {
                  console.error("Failed to save budget:", error);
                  alert("Unable to save budget. Check your backend.");
                }
              }
            }}
          />

          <h2>{formatMoney(monthlyExpenses)}</h2>
          <p>Spent of {formatMoney(monthlyBudget)}</p>

          <p>Remaining: {formatMoney(remainingBudget)}</p>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${
                monthlyBudget > 0
                  ? Math.min((monthlyExpenses / monthlyBudget) * 100, 100)
                  : 0
              }%`,
            }}
          />
        </div>

        <div className="budget-progress-labels">
          <span>
            {monthlyBudget > 0
              ? Math.round((monthlyExpenses / monthlyBudget) * 100)
              : 0}% used
          </span>

          <span>{formatMoney(remainingBudget)} left</span>
        </div>

        <div className="budget-tip">
          <div className="tip-icon">
            <TrendingUp size={19} />
          </div>
          <div>
            <strong>Spending insight</strong>
            <p>
              {monthlyBudget > 0 && monthlyExpenses >= monthlyBudget
                ? "Budget exceeded! Review your expenses."
                : monthlyBudget > 0 &&
                  monthlyExpenses >= monthlyBudget * 0.8
                ? "Warning: You have used 80% or more of your budget."
                : "You are within your budget. Keep tracking your expenses!"}
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="panel transactions-panel" id="transactions">
      <div className="panel-header transaction-header">
        <div>
          <h3>Recent Transactions</h3>
          <p>Track your latest income and expenses</p>
        </div>
        <div className="transaction-filters">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Utilities">Utilities</option>
            <option value="Shopping">Shopping</option>
            <option value="Education">Education</option>
            <option value="Salary">Salary</option>
            <option value="Other Income">Other Income</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="transaction-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={exportTransactions}
          >
            Export CSV
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={17} /> Add New
          </button>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5">Loading transactions...</td>
              </tr>
            ) : (
              filteredTransactions.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="transaction-title">
                      <div
                        className={`transaction-icon ${
                          item.type === "Income" ? "income-icon" : "expense-icon"
                        }`}
                      >
                        {item.type === "Income" ? (
                          <ArrowDownCircle size={19} />
                        ) : (
                          <CreditCard size={19} />
                        )}
                      </div>
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.type}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="category-badge">{item.category}</span>
                  </td>

                  <td>{item.date}</td>

                  <td
                    className={
                      item.type === "Income"
                        ? "amount-income"
                        : "amount-expense"
                    }
                  >
                    {item.type === "Income" ? "+" : "-"}
                    {formatMoney(item.amount)}
                  </td>

                  <td>
                    <button
                      className="edit-button"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDeleteTransaction(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <p className="empty-state">No transactions yet. Add one to begin.</p>
      )}
    </section>

    {/* Savings Goals Section */}
    <section className="panel savings-goals-panel" id="savings">
      <div className="panel-header">
        <div>
          <h3>Savings Goals</h3>
          <p>Track your progress toward financial goals</p>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowGoalForm(true)}
        >
          <Plus size={18} />
          Add Goal
        </button>
      </div>

      {savingsGoals.length === 0 ? (
        <p className="empty-state">
          No savings goals yet. Add one to start saving!
        </p>
      ) : (
        <div className="savings-goals-grid">
          {savingsGoals.map((goal) => {
            const progress =
              goal.targetAmount > 0
                ? Math.min(
                    (goal.savedAmount / goal.targetAmount) * 100,
                    100
                  )
                : 0;

            return (
              <div className="savings-goal-card" key={goal.id}>
                <div className="goal-card-top">
                  <h4>{goal.name}</h4>

                  <div>
                    <button
                      className="edit-button"
                      onClick={() =>
                        setEditingGoal({
                          id: goal.id,
                          name: goal.name,
                          targetAmount: goal.targetAmount,
                          savedAmount: goal.savedAmount,
                          targetDate: goal.targetDate || "",
                        })
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={async () => {
                        const confirmed = window.confirm(
                          `Delete savings goal "${goal.name}"?`
                        );

                        if (!confirmed) return;

                        try {
                          await deleteSavingsGoal(goal.id, currentUser.id);

                          setSavingsGoals((prev) =>
                            prev.filter((g) => g.id !== goal.id)
                          );
                        } catch (error) {
                          console.error(error);
                          alert("Unable to delete savings goal.");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p>
                  Saved {formatMoney(goal.savedAmount)} of {formatMoney(goal.targetAmount)}
                </p>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="budget-progress-labels">
                  <span>{Math.round(progress)}% saved</span>
                  <span>{goal.targetDate || "No target date"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  </>
)}
{showSettings && (
  <section className="settings-page" id="settings">
    <div className="settings-header">
      <div>
        <h2>Settings</h2>
        <p>Manage your account and application preferences.</p>
      </div>

      <button
        className="secondary-button"
        onClick={() => setShowSettings(false)}
      >
        Back to Dashboard
      </button>
    </div>

    <div className="settings-grid">

      {/* Account Information */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon">
            <Settings size={20} />
          </div>

          <div>
            <h3>Account Information</h3>
            <p>Your current account details</p>
          </div>
        </div>

        <div className="settings-info">
          <div>
            <span>Name</span>
            <strong>{currentUser?.name || "User"}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{currentUser?.email || "Not available"}</strong>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon">
            <Wallet size={20} />
          </div>

          <div>
            <h3>Currency</h3>
            <p>Currency used throughout Budget Planner</p>
          </div>
        </div>

        <select className="settings-select" defaultValue="INR">
          <option value="INR">₹ Indian Rupee (INR)</option>
          <option value="USD">$ US Dollar (USD)</option>
          <option value="EUR">€ Euro (EUR)</option>
          <option value="GBP">£ British Pound (GBP)</option>
        </select>
      </div>

      {/* Notifications */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon">
            <Bell size={20} />
          </div>

          <div>
            <h3>Notifications</h3>
            <p>Receive important budget reminders</p>
          </div>
        </div>

        <label className="settings-toggle">
          <span>
            <strong>Budget notifications</strong>
            <small>Show reminders when your budget is nearly exceeded.</small>
          </span>

          <input
  type="checkbox"
  checked={notificationsEnabled}
  onChange={(e) => {
    const enabled = e.target.checked;

    setNotificationsEnabled(enabled);

    localStorage.setItem(
      "budgetPlannerNotifications",
      String(enabled)
    );

    setShowNotifications(false);
  }}
/>
        </label>
      </div>

      {/* Appearance */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon">
            <Monitor size={20} />
          </div>

          <div>
            <h3>Appearance</h3>
            <p>Choose how Budget Planner looks</p>
          </div>
        </div>

       <select
  className="settings-select"
  value={darkMode ? "dark" : "light"}
  onChange={(e) => setDarkMode(e.target.value === "dark")}
>
  <option value="light">Light Mode</option>
  <option value="dark">Dark Mode</option>
</select>
      </div>

      {/* Security */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon">
            <Settings size={20} />
          </div>

          <div>
            <h3>Account</h3>
            <p>Manage your current session</p>
          </div>
        </div>

        <button
          className="logout-button settings-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

    </div>
  </section>
  
)}
{showPayments && (
  <Payments
    currentUser={currentUser}
    formatMoney={formatMoney}
    onBack={() => setShowPayments(false)}
    onPaymentSuccess={async () => {
      const data = await getTransactions(currentUser.id);
      setTransactions(data);
    }}
  />
)}
        <footer className="footer">
          
          <p>© 2026 Budget Planner | Personal Finance Management</p>
          <p>Manage money. Build better habits.</p>
        </footer>
      </main>

      {showForm && (
        <div className="modal-overlay">
          <div className="transaction-modal">
            <div className="modal-header">
              <div>
                <h2>Add Transaction</h2>
                <p>Enter your income or expense details.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Transaction Name</label>
              <input
                type="text"
                placeholder="e.g. Grocery Shopping"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
                required
              />

              <label>Transaction Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
              >
                <option>Expense</option>
                <option>Income</option>
              </select>

              <label>Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                <option>Food</option>
                <option>Travel</option>
                <option>Utilities</option>
                <option>Shopping</option>
                <option>Education</option>
                <option>Salary</option>
                <option>Other Income</option>
                <option>Other</option>
              </select>

              <label>Amount (₹)</label>
              <input
                type="number"
                min="1"
                placeholder="Enter amount"
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: e.target.value })
                }
                required
              />

              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm({ ...form, date: e.target.value })
                }
                required
              />

              <button type="submit" className="primary-button submit-button">
                Save Transaction
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Savings Goal Modal */}
{showGoalForm && (
  <div className="modal-overlay">
    <div className="transaction-modal">
      <div className="modal-header">
        <div>
          <h2>Add Savings Goal</h2>
          <p>Set a target and track your savings.</p>
        </div>

        <button
          type="button"
          className="icon-button"
          onClick={() => setShowGoalForm(false)}
        >
          <X size={21} />
        </button>
      </div>

      <form onSubmit={handleGoalSubmit}>
        <label>Goal Name</label>
        <input
          type="text"
          placeholder="e.g. Buy a Laptop"
          value={goalForm.name}
          onChange={(e) =>
            setGoalForm({
              ...goalForm,
              name: e.target.value,
            })
          }
          required
        />

        <label>Target Amount (₹)</label>
        <input
          type="number"
          min="1"
          placeholder="Enter target amount"
          value={goalForm.targetAmount}
          onChange={(e) =>
            setGoalForm({
              ...goalForm,
              targetAmount: e.target.value,
            })
          }
          required
        />

        <label>Already Saved (₹)</label>
        <input
          type="number"
          min="0"
          placeholder="Enter amount saved"
          value={goalForm.savedAmount}
          onChange={(e) =>
            setGoalForm({
              ...goalForm,
              savedAmount: e.target.value,
            })
          }
          required
        />

        <label>Target Date</label>
        <input
          type="date"
          value={goalForm.targetDate}
          onChange={(e) =>
            setGoalForm({
              ...goalForm,
              targetDate: e.target.value,
            })
          }
        />

        <button
          type="submit"
          className="primary-button submit-button"
        >
          Save Goal
        </button>
      </form>
    </div>
  </div>
)}



  
            {editingTransaction && (
        <div className="modal-overlay">
          <div className="transaction-modal">
            <div className="modal-header">
              <div>
                <h2>Edit Transaction</h2>
                <p>Update your transaction details.</p>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setEditingTransaction(null)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit}>
              <label>Transaction Name</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    title: e.target.value,
                  })
                }
                required
              />

              <label>Transaction Type</label>
              <select
                value={editForm.type}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    type: e.target.value,
                  })
                }
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>

              <label>Category</label>
              <select
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    category: e.target.value,
                  })
                }
              >
                <option value="Food">Food</option>
                <option value="Travel">Travel</option>
                <option value="Utilities">Utilities</option>
                <option value="Shopping">Shopping</option>
                <option value="Education">Education</option>
                <option value="Salary">Salary</option>
                <option value="Other Income">Other Income</option>
                <option value="Other">Other</option>
              </select>

              <label>Amount (₹)</label>
              <input
                type="number"
                min="1"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    amount: e.target.value,
                  })
                }
                required
              />

              <label>Date</label>
              <input
                type="date"
                value={editForm.date}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    date: e.target.value,
                  })
                }
                required
              />

              <label>Description</label>
              <input
                type="text"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    description: e.target.value,
                  })
                }
              />

              <button
                type="submit"
                className="primary-button submit-button"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => setEditingTransaction(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
