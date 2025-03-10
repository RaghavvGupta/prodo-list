import TodoList from "@/components/todo-list"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold text-center">Todo List</h1>
        <TodoList />
      </div>
    </main>
  )
}

