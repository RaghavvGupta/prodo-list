"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, Trash2, Flag, Tag, Filter } from "lucide-react"
import { format } from "date-fns"
import ThemeToggle from "./theme-toggle"

type Priority = "low" | "medium" | "high"
type Category = "work" | "personal" | "shopping" | "other"

interface Todo {
  id: number
  text: string
  completed: boolean
  dueDate?: Date
  priority: Priority
  category: Category
}

const PRIORITY_CONFIG = {
  low: { color: "bg-blue-500", label: "Low" },
  medium: { color: "bg-yellow-500", label: "Medium" },
  high: { color: "bg-red-500", label: "High" },
}

const CATEGORY_CONFIG = {
  work: { color: "bg-purple-500", label: "Work" },
  personal: { color: "bg-green-500", label: "Personal" },
  shopping: { color: "bg-amber-500", label: "Shopping" },
  other: { color: "bg-gray-500", label: "Other" },
}

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedPriority, setSelectedPriority] = useState<Priority>("medium")
  const [selectedCategory, setSelectedCategory] = useState<Category>("personal")
  const [activeFilter, setActiveFilter] = useState("all")
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all")
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all")

  // Load todos from localStorage on initial render
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos")
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos, (key, value) => {
          // Convert ISO date strings back to Date objects
          if (key === "dueDate" && value) {
            return new Date(value)
          }
          return value
        })
        setTodos(parsedTodos)
      } catch (error) {
        console.error("Failed to parse todos from localStorage", error)
      }
    }
  }, [])

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (newTodo.trim() === "") return

    const todo: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      dueDate: selectedDate,
      priority: selectedPriority,
      category: selectedCategory,
    }

    setTodos([...todos, todo])
    setNewTodo("")
    setSelectedDate(undefined)
  }

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id))
  }

  const toggleComplete = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const filteredTodos = todos.filter((todo) => {
    // Filter by completion status
    if (activeFilter === "active" && todo.completed) return false
    if (activeFilter === "completed" && !todo.completed) return false

    // Filter by priority
    if (filterPriority !== "all" && todo.priority !== filterPriority) return false

    // Filter by category
    if (filterCategory !== "all" && todo.category !== filterCategory) return false

    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">My Tasks</h2>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a new task..."
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  addTodo()
                }
              }}
              className="flex-1"
            />
            <Button onClick={addTodo}>Add</Button>
          </div>
        </CardHeader>
        <CardContent className="pb-2 space-y-3">
          <div className="flex flex-wrap gap-2">
            {/* Due Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Set due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
              </PopoverContent>
            </Popover>

            {/* Priority Selector */}
            <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as Priority)}>
              <SelectTrigger className="w-[140px] h-9">
                <Flag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Selector */}
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category)}>
              <SelectTrigger className="w-[140px] h-9">
                <Tag className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 items-center">
        <Tabs defaultValue="all" value={activeFilter} onValueChange={setActiveFilter} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Priority</h4>
                <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as Priority | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Category</h4>
                <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as Category | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="ml-auto text-sm text-muted-foreground">
          {filteredTodos.length} {filteredTodos.length === 1 ? "task" : "tasks"}
        </div>
      </div>

      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <Card className="p-4 text-center text-muted-foreground">No tasks found. Add one or adjust your filters!</Card>
        ) : (
          filteredTodos.map((todo) => (
            <Card key={todo.id} className="overflow-hidden">
              <div className={`h-1 ${PRIORITY_CONFIG[todo.priority].color}`} />
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleComplete(todo.id)}
                      id={`todo-${todo.id}`}
                    />
                    <div>
                      <label
                        htmlFor={`todo-${todo.id}`}
                        className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                      >
                        {todo.text}
                      </label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {PRIORITY_CONFIG[todo.priority].label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {CATEGORY_CONFIG[todo.category].label}
                        </Badge>
                        {todo.dueDate && (
                          <Badge variant="outline" className="text-xs">
                            Due: {format(todo.dueDate, "MMM d")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteTodo(todo.id)} aria-label="Delete task">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

