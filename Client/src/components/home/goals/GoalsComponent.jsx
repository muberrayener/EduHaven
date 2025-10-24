import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axios";
import {
  Pencil,
  Trash,
  Check,
  X,
  ChevronRight,
  Calendar,
  Repeat,
  Clock,
} from "lucide-react";
import Setgoals from "./SetGoals.jsx";
import DeadlinePickerModal from "./DeadlinePickerModal.jsx";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";

const GoalsComponent = () => {
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [collapsedSections, setCollapsedSections] = useState({
    dailyHabits: false,
    otherGoals: false,
    closedGoals: true,
  });
  const [deadlineModal, setDeadlineModal] = useState({
    isOpen: false,
    todoId: null,
    todoTitle: "",
    currentDeadline: null,
  });
  const [undoStack, setUndoStack] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const { data } = await axiosInstance.get(`/todo`);
      setTodos(data.data);
    } catch (error) {
      console.error("Error fetching todos:", error.message);
    }
  };

  // Organize todos into sections
  const organizeTodos = () => {
    const dailyHabits = todos.filter(
      (todo) => todo.repeatEnabled && todo.status === "open"
    );
    const otherGoals = todos.filter(
      (todo) => !todo.repeatEnabled && todo.status === "open"
    );
    const closedGoals = todos.filter((todo) => todo.status === "closed");

    return { dailyHabits, otherGoals, closedGoals };
  };

  const { dailyHabits, otherGoals, closedGoals } = organizeTodos();

  // Callback to handle a newly created goal from Setgoals.
  const handleNewGoalCreated = (newGoal) => {
    setTodos([newGoal, ...todos]);
  };

  const handleDelete = async (id) => {
    const todoToDelete = todos.find((todo) => todo._id === id);
    if (!todoToDelete) {
      console.error("Todo not found for deletion");
      return;
    }

    const previousTodos = [...todos];

    setTodos((prev) => prev.filter((todo) => todo._id !== id));

    try {
      await axiosInstance.delete(`/todo/${id}`);

      // Store undo information
      const undoAction = {
        todo: todoToDelete,
        previousTodos,
        timestamp: Date.now(),
        originalId: id,
      };

      setUndoStack((prev) => [...prev, undoAction]);

      // Show undo notification
      const toastId = toast.success(
        <div className="flex items-center justify-between">
          <span>
            Goal "
            {todoToDelete.title.length > 20
              ? `${todoToDelete.title.substring(0, 20)}...`
              : todoToDelete.title}
            " deleted.
          </span>
          <div className="flex items-center ml-4">
            <Button
              onClick={() => handleUndoDelete(undoAction, toastId)}
              variant="transparent"
              className="text-blue-400 hover:text-blue-300 mr-2 text-sm font-medium"
            >
              Undo
            </Button>
            <Button
              onClick={() => toast.dismiss(toastId)}
              variant="transparent"
              size="icon"
              className="text-gray-400 hover:text-gray-300 p-1"
            >
              <X size={16} />
            </Button>
          </div>
        </div>,
        {
          autoClose: 4000,
          closeOnClick: false,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          toastId: `delete-${id}-${Date.now()}`,
        }
      );
    } catch (error) {
      console.error("Error deleting todo:", error);
      setTodos(previousTodos);

      // Handle specific error cases
      if (error.response?.status === 404) {
        toast.error("Goal already deleted");
      } else if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.error || "Failed to delete goal");
      }
    }
  };

  const handleUndoDelete = async (undoAction, toastId) => {
    try {
      const fixedTodo = {
        ...undoAction.todo,
        reminderTime: undoAction.todo.reminderTime ? new Date(undoAction.todo.reminderTime).toISOString() : null,
      };

      const { data } = await axiosInstance.post(`/todo`, fixedTodo);

      setTodos((prev) => [
        data.data,
        ...prev.filter((todo) => todo._id !== undoAction.originalId),
      ]);

      toast.dismiss(toastId);
      toast.success("Goal restored successfully!");
    } catch (error) {
      console.error("Error undoing delete:", error);
      // If undo fails, revert to previous state
      setTodos(undoAction.previousTodos);

      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.error || "Failed to restore goal");
      }
    }
  };

  const handleToggle = async (id) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) {
      console.error("Todo not found for toggle");
      return;
    }

    const previousTodos = [...todos];

    setTodos((prev) =>
      prev.map((todo) =>
        todo._id === id
          ? {
            ...todo,
            completed: !todo.completed,
            status: todo.completed ? "open" : "closed",
          }
          : todo
      )
    );

    try {
      const updatedTodo = {
        ...todo,
        completed: !todo.completed,
        status: !todo.completed ? "closed" : "open",
        reminderTime: todo.reminderTime ? new Date(todo.reminderTime).toISOString() : null,
      };
      await axiosInstance.put(`/todo/${id}`, updatedTodo);
    } catch (error) {
      console.error("Error toggling todo:", error);
      setTodos(previousTodos);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.error || "Failed to update goal");
      }
    }
  };

  const handleToggleRepeat = async (id) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) {
      console.error("Todo not found for repeat toggle");
      return;
    }

    const previousTodos = [...todos];

    setTodos((prev) =>
      prev.map((todo) =>
        todo._id === id ? { ...todo, repeatEnabled: !todo.repeatEnabled } : todo
      )
    );

    try {
      const updatedTodo = {
        ...todo,
        repeatEnabled: !todo.repeatEnabled,
        reminderTime: todo.reminderTime ? new Date(todo.reminderTime).toISOString() : null,
      };
      await axiosInstance.put(`/todo/${id}`, updatedTodo);
    } catch (error) {
      console.error("Error toggling repeat:", error);
      setTodos(previousTodos);
    }
  };

  const handleSave = async () => {
    if (!editedTitle.trim()) {
      toast.warning("Title cannot be empty!");
      return;
    }

    if (editedTitle.length > 100) {
      toast.warning("Title must be less than 100 characters");
      return;
    }

    const todo = todos.find((t) => t._id === editingId);
    if (!todo) {
      console.error("Todo not found for edit");
      return;
    }

    const previousTodos = [...todos];
    setTodos((prev) =>
      prev.map((todo) =>
        todo._id === editingId ? { ...todo, title: editedTitle.trim() } : todo
      )
    );
    setEditingId(null);
    setEditedTitle("");

    try {
      await axiosInstance.put(`/todo/${editingId}`, {
        ...todo,
        title: editedTitle.trim(),
        reminderTime: todo.reminderTime ? new Date(todo.reminderTime).toISOString() : null,
      });
    } catch (error) {
      console.error("Error updating todo:", error);
      setTodos(previousTodos);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.error || "Failed to update goal");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedTitle("");
  };

  const openDeadlineModal = (todo) => {
    setDeadlineModal({
      isOpen: true,
      todoId: todo._id,
      todoTitle: todo.title,
      currentDeadline: todo.deadline,
    });
  };

  const closeDeadlineModal = () => {
    setDeadlineModal({
      isOpen: false,
      todoId: null,
      todoTitle: "",
      currentDeadline: null,
    });
  };

  const handleDeadlineSave = async (deadline) => {
    try {
      const todo = todos.find((t) => t._id === deadlineModal.todoId);
      if (!todo) {
        console.error("Todo not found for deadline update");
        return;
      }

      const updatedTodo = {
        deadline: deadline ? deadline.toISOString() : null,
        reminderTime: todo.reminderTime ? new Date(todo.reminderTime).toISOString() : null,
      };
      await axiosInstance.put(`/todo/${deadlineModal.todoId}`, updatedTodo);

      setTodos(
        todos.map((todo) =>
          todo._id === deadlineModal.todoId
            ? { ...todo, deadline: deadline ? deadline.toISOString() : null }
            : todo
        )
      );
    } catch (error) {
      console.error("Error updating deadline:", error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err.msg));
      } else {
        toast.error(error.response?.data?.error || "Failed to update deadline");
      }
    }
  };

  const toggleSection = (section) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatDeadlineInfo = (deadline) => {
    if (!deadline) return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffMs = deadlineDate - now;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs > 0) {
      if (diffMinutes < 60) {
        return {
          text: `${diffMinutes} minute${diffMinutes !== 1 ? "s" : ""} left`,
          color: diffMinutes <= 30 ? "text-yellow-500" : "text-green-500",
        };
      } else if (diffHours < 24) {
        return {
          text: `${diffHours} hour${diffHours !== 1 ? "s" : ""} left`,
          color: diffHours <= 2 ? "text-yellow-500" : "text-green-500",
        };
      } else {
        return {
          text: `${diffDays} day${diffDays !== 1 ? "s" : ""} left`,
          color: "text-green-500",
        };
      }
    } else {
      //past deadline - overdue
      const overdueMins = Math.abs(diffMinutes);
      const overdueHours = Math.abs(diffHours);
      const overdueDays = Math.abs(diffDays);

      if (overdueMins < 60) {
        return {
          text: `${overdueMins} minute${overdueMins !== 1 ? "s" : ""} overdue`,
          color: "text-red-500",
        };
      } else if (overdueHours < 24) {
        return {
          text: `${overdueHours} hour${overdueHours !== 1 ? "s" : ""} overdue`,
          color: "text-red-500",
        };
      } else {
        return {
          text: `${overdueDays} day${overdueDays !== 1 ? "s" : ""} overdue`,
          color: "text-red-500",
        };
      }
    }
  };

  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  const renderTodoItem = (todo) => (
    <motion.div
      key={todo._id}
      variants={itemVariants}
      className="group flex items-center space-x-2 p-2 px-4 rounded-lg hover:bg-ter cursor-pointer"
    >
      <label className="relative flex items-center">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => handleToggle(todo._id)}
          className="w-5 h-5 rounded-full border border-txt-dim appearance-none checked:bg-purple-500 checked:border-purple-500 focus:outline-none"
        />
        {todo.completed && (
          <Check className="absolute w-full txt pointer-events-none" />
        )}
      </label>

      {editingId === todo._id ? (
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          className="flex-grow bg-transparent border-b border-txt-dim txt-dim py-1 px-2 focus:outline-none"
          autoFocus
        />
      ) : (
        <div className="flex-grow">
          <span
            className={`text-lg ${todo.completed ? "line-through txt-dim" : "txt-dim"
              }`}
          >
            {todo.title}
          </span>
          {todo.deadline && (
            <div
              className={`text-xs ${formatDeadlineInfo(todo.deadline)?.color}`}
            >
              <Clock className="inline w-3 h-3 mr-1" />
              {formatDeadlineInfo(todo.deadline)?.text}
            </div>
          )}
        </div>
      )}

      {editingId === todo._id ? (
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            variant="transparent"
            size="icon"
            className="text-green-500 hover:text-green-400 transition-colors"
          >
            <Check />
          </Button>
          <Button
            onClick={handleCancel}
            variant="transparent"
            size="icon"
            className="txt-dim hover:txt transition-colors"
          >
            <X />
          </Button>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <span className="txt-dim group-hover:hidden">
            {new Date(todo.dueDate).toLocaleDateString()}
          </span>
          <div className="hidden group-hover:flex gap-2">
            {/* Repeat Toggle */}
            <Button
              onClick={() => handleToggleRepeat(todo._id)}
              variant="transparent"
              size="icon"
              className={`p-1 rounded transition-colors ${todo.repeatEnabled
                  ? "text-blue-500 bg-blue-100/10"
                  : "txt-dim hover:text-blue-500"
                }`}
              title={todo.repeatEnabled ? "Disable repeat" : "Enable repeat"}
            >
              <Repeat className="h-4 w-4" />
            </Button>

            {/* Calendar Icon - deadline setting */}
            <Button
              onClick={() => openDeadlineModal(todo)}
              variant="transparent"
              size="icon"
              className="txt-dim hover:text-purple-500 transition-colors p-1"
              title="Set deadline"
            >
              <Calendar className="h-4 w-4" />
            </Button>

            {/* Edit */}
            <Button
              onClick={() => {
                setEditingId(todo._id);
                setEditedTitle(todo.title);
              }}
              variant="transparent"
              size="icon"
              className="txt-dim hover:text-blue-500 transition-colors p-1"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Delete */}
            <Button
              onClick={() => handleDelete(todo._id)}
              variant="transparent"
              size="icon"
              className="txt-dim hover:text-red-500 transition-colors p-1"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderSection = (title, items, sectionKey) => (
    <div className="mb-2.5">
      <Button
        onClick={() => toggleSection(sectionKey)}
        variant="transparent"
        size="default"
        className="flex items-center justify-between w-full px-2"
      >
        <div className="flex items-center gap-1">
          <ChevronRight
            size={20}
            className={`${collapsedSections[sectionKey] ? "" : "rotate-90"} transition duration-300`}
          />
          <h3 className="font-medium text-sm">{title}</h3>
          <span className="txt-dim text-sm">({items.length})</span>
        </div>
      </Button>

      {!collapsedSections[sectionKey] && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="mt-2"
        >
          {items.length !== 0 && items.map(renderTodoItem)}
        </motion.div>
      )}
    </div>
  );

  const openCount = dailyHabits.length + otherGoals.length;
  const closedCount = closedGoals.length;

  return (
    <div className="bg-sec txt rounded-3xl py-6 pb-2 w-full mx-auto relative shadow">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-4 px-6">
        <h1 className="text-2xl font-semibold">Goals</h1>
        <div className="flex space-x-4">
          <div className="flex items-center space-x-1">
            <span className="text-green-500">●</span>
            <span>{openCount} Open</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="txt-dim">●</span>
            <span>{closedCount} Closed</span>
          </div>
        </div>
      </div>

      {/* Set goals */}
      <div className="h-11"></div>
      <div className="absolute left-0 right-0 z-10 top-16">
        <Setgoals onGoalCreated={handleNewGoalCreated} />
      </div>

      {/* Tasks List Section */}
      <div className="w-full max-h-[17.5rem] overflow-y-auto pt-2 px-2">
        {renderSection(
          "Daily Habit",
          dailyHabits,
          "dailyHabits",
          <Repeat className="h-4 w-4 text-blue-500" />
        )}

        {renderSection(
          "Tasks",
          otherGoals,
          "otherGoals",
          <Clock className="h-4 w-4 text-purple-500" />
        )}

        {renderSection(
          "Completed",
          closedGoals,
          "closedGoals",
          <Check className="h-4 w-4 text-green-500" />
        )}
      </div>

      <DeadlinePickerModal
        isOpen={deadlineModal.isOpen}
        onClose={closeDeadlineModal}
        onSave={handleDeadlineSave}
        currentDeadline={deadlineModal.currentDeadline}
        todoTitle={deadlineModal.todoTitle}
      />
    </div>
  );
};

export default GoalsComponent;