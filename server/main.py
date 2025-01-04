
from fastapi import FastAPI
from typing import List, Optional
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Task(BaseModel):
    id: int
    content: str
    completed: Optional[bool] = False

# Sample data
tasks = [
    Task(id=1, content="Learn FastAPI", completed=False),
    Task(id=2, content="Build an API", completed=True)
]

@app.get("/api/tasks", response_model=List[Task])
def get_tasks():
    return tasks
