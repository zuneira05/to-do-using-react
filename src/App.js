import "./App.css";
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

function App() {
  const [todolist, setTodolist] = useState([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // Get tasks from database
  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then((response) => response.json())
      .then((data) => {
        setTodolist(
          data.map((task) => ({
            id: task.id,
            text: task.task,
            time: task.time.slice(0, 5),
            status: task.completed,
            notified: false,
          })),
        );
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }, []);

  // Add task
  const SaveToDoList = async (e) => {
    e.preventDefault();

    let toname = e.target.toname.value;
    let totime = e.target.totime.value;

    if (!toname || !totime) return;

    try {
      const response = await fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: toname,
          time: totime,
        }),
      });

      const newTask = await response.json();

      setTodolist((prev) => [
        ...prev,
        {
          id: newTask.id,
          text: newTask.task,
          time: newTask.time.slice(0, 5),
          status: newTask.completed,
          notified: false,
        },
      ]);
    } catch (error) {
      console.error("Error adding task:", error);
    }

    // Unlock alarm sound
    if (!audioUnlocked) {
      let audio = new Audio(
        "/alarm.mp3",
      );

      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          setAudioUnlocked(true);
        })
        .catch(() => {});
    }

    e.target.reset();
  };

  // Check alarm time
  useEffect(() => {
    let interval = setInterval(() => {
      let now = new Date();
      let currentTime = now.toTimeString().slice(0, 5);

      setTodolist((prev) =>
        prev.map((task) => {
          if (currentTime === task.time && !task.notified) {
            console.log("MATCHED TIME 🔔", task.time);

            if (audioUnlocked) {
              let audio = new Audio(
                "/alarm.mp3",
              );

              audio.loop = true;
              audio.play();

              setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
              }, 10000);
            }

            return {
              ...task,
              notified: true,
            };
          }

          return task;
        }),
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [audioUnlocked]);

  // Delete task from database
  const deleteRow = async (id) => {
    try {
      await fetch(`http://localhost:5000/tasks/${id}`, {
        method: "DELETE",
      });

      // Remove the exact task using its database ID
      setTodolist((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Change completed status
  const toggleStatus = async (index) => {
    const task = todolist[index];

    const newStatus = !task.status;

    try {
      await fetch(`http://localhost:5000/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: newStatus,
        }),
      });

      setTodolist((prev) =>
        prev.map((item) =>
          item.id === task.id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  return (
    <div className="App">
      <div className="overlay"></div>

      <h1 className="title">
        <span>TO-DO LIST</span>
      </h1>

      <form onSubmit={SaveToDoList}>
        <input type="text" name="toname" placeholder="Enter task" />

        <input type="time" name="totime" />

        <button>Add</button>
      </form>

      <div className="todo-container">
        {todolist.map((task, index) => (
          <div
            key={task.id}
            className={`todo-item ${task.status ? "done" : ""}`}
            onClick={() => toggleStatus(index)}
          >
            <div className="circle">{task.status && "✓"}</div>

            <div className="task-text">{task.text}</div>

            <span
              className="delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteRow(task.id);
              }}
            >
              <FaTrash />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
