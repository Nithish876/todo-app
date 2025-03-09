"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

type Todo = {
    id: number;
    text: string;
    completed: boolean;
    dueDate?: Date;  // Allow undefined
  };

type Filter = "all" | "active" | "completed";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [task, setTask] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos).map((todo: Todo) => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : null
      })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (task.trim() === "") return;
    setTodos([...todos, { id: Date.now(), text: task, completed: false, dueDate }]);
    setTask("");
    setDueDate(undefined);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos
    .filter(todo => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    })
    .sort((a, b) => (a.dueDate && b.dueDate ? a.dueDate.getTime() - b.dueDate.getTime() : 0));

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 space-y-4 bg-white dark:bg-gray-800 shadow-md">
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-gray-100">
          📝 Todo List
        </h1>

        {/* Theme Toggle */}
        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-full">
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          {theme === "dark" ? " Light Mode" : " Dark Mode"}
        </Button>

        {/* Input + Date Picker + Button */}
        <div className="flex space-x-2">
          <Input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Add a new task..."
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {dueDate ? format(dueDate, "MMM dd, yyyy") : "Due Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
            </PopoverContent>
          </Popover>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Button onClick={addTodo}>Add</Button>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex justify-between space-x-2">
          <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
          <Button variant={filter === "active" ? "default" : "outline"} onClick={() => setFilter("active")}>Active</Button>
          <Button variant={filter === "completed" ? "default" : "outline"} onClick={() => setFilter("completed")}>Completed</Button>
        </div>

        {/* Todo List with Drag and Drop */}
        <Reorder.Group axis="y" values={filteredTodos} onReorder={setTodos} className="space-y-2">
          <AnimatePresence>
            {filteredTodos.map(todo => (
              <Reorder.Item key={todo.id} value={todo} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 cursor-grab">
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
                    <span className={`dark:text-gray-200 ${todo.completed ? "line-through text-gray-500" : ""}`}>{todo.text}</span>
                  </div>
                  {todo.dueDate && (
                    <span className="text-sm text-gray-500">Due: {format(todo.dueDate, "MMM dd, yyyy")}</span>
                  )}
                </div>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Button variant="destructive" size="sm" onClick={() => deleteTodo(todo.id)}>Delete</Button>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {/* Clear Completed Button */}
        <Button variant="secondary" onClick={clearCompleted} className="w-full">Clear Completed</Button>
      </Card>
    </main>
  );
}
