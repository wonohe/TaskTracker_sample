
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TodoItem } from "../components/TodoItem";
import type { SelectTask } from "@db/schema";

type FilterStatus = "all" | "active" | "completed";

export function TodoList() {
  // State
  const [newTask, setNewTask] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const { toast } = useToast();

  // Queries
  const { data: tasks = [], refetch } = useQuery<SelectTask[]>({
    queryKey: ["/api/tasks"],
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: (content: string) => 
      fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }).then(res => {
        if (!res.ok) throw new Error("Failed to add task");
        return res.json();
      }),
    onSuccess: () => {
      setNewTask("");
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      }).then(res => {
        if (!res.ok) throw new Error("Failed to update task");
        return res.json();
      }),
    onSuccess: () => refetch(),
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/tasks/${id}`, { method: "DELETE" }).then(res => {
        if (!res.ok) throw new Error("Failed to delete task");
      }),
    onSuccess: () => refetch(),
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  // Event Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    addMutation.mutate(newTask);
  };

  // Filtered Tasks
  const filteredTasks = tasks
    .filter(task => {
      if (filterStatus === "active") return !task.completed;
      if (filterStatus === "completed") return task.completed;
      return true;
    })
    .filter(task => 
      task.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-center">Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="mb-6">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="w-full"
          />
        </form>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            {["all", "active", "completed"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(status as FilterStatus)}
                className="flex-1"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {filteredTasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -300 }}
              transition={{ duration: 0.2 }}
            >
              <TodoItem
                task={task}
                onToggle={(completed) => toggleMutation.mutate({ id: task.id, completed })}
                onDelete={() => deleteMutation.mutate(task.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <p className="text-center text-muted-foreground text-sm">
            {searchQuery
              ? "No tasks match your search"
              : filterStatus === "all"
              ? "No tasks yet"
              : `No ${filterStatus} tasks`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
