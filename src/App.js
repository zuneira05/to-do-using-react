import './App.css';
import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

function App() {

  const [todolist, setTodolist] = useState([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const SaveToDoList = (e) => {
    e.preventDefault();

    let toname = e.target.toname.value;
    let totime = e.target.totime.value;

    if (!toname || !totime) return;

    setTodolist([
      ...todolist,
      {
        text: toname,
        time: totime,
        status: false,
        notified: false
      }
    ]);


    if (!audioUnlocked) {
      let audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        setAudioUnlocked(true);
      }).catch(() => {});
    }

    e.target.reset();
  };


  useEffect(() => {

    let interval = setInterval(() => {

      let now = new Date();
      let currentTime = now.toTimeString().slice(0, 5);

      setTodolist(prev =>
        prev.map(task => {

          if (currentTime === task.time && !task.notified) {
            console.log("MATCHED TIME 🔔", task.time);

         
            if (audioUnlocked) {
              let audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
              audio.loop = true;
              audio.play();

              setTimeout(() => {
                audio.pause();
                audio.currentTime = 0;
              }, 10000);
            }

            return { ...task, notified: true };
          }

          return task;
        })
      );

    }, 1000);

    return () => clearInterval(interval);

  }, [audioUnlocked]);

  const deleteRow = (index) => {
    setTodolist(todolist.filter((_, i) => i !== index));
  };

  const toggleStatus = (index) => {
    let updated = [...todolist];
    updated[index].status = !updated[index].status;
    setTodolist(updated);
  };

  return (
    <div className="App">

      <div className="overlay"></div>

      <h1 className="title"><span>TO-DO LIST</span></h1>

      <form onSubmit={SaveToDoList}>
        <input type="text" name="toname" placeholder="Enter task" />
        <input type="time" name="totime" />
        <button>Add</button>
      </form>

      <div className="todo-container">
        {todolist.map((task, index) => (
          <div
            key={index}
            className={`todo-item ${task.status ? "done" : ""}`}
            onClick={() => toggleStatus(index)}
          >
            <div className="circle">
              {task.status && "✓"}
            </div>

            <div className="task-text">
              {task.text}
            </div>
            
            <span className="delete" onClick={(e) => {
              e.stopPropagation();
              deleteRow(index);
            }}>
              <FaTrash />
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

export default App;