import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { SelectTask } from "@db/schema";

interface TodoItemProps {
  task: SelectTask;
  onToggle: (completed: boolean) => void;
  onDelete: () => void;
}

export function TodoItem({ task, onToggle, onDelete }: TodoItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border group">
      <div className="flex items-center gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <motion.span
          animate={{ opacity: task.completed ? 0.5 : 1 }}
          className={`text-sm ${
            task.completed ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.content}
        </motion.span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
