import PlusIcon from "../icons/PlusIcon";
import { useEffect, useMemo, useState } from "react";
import { Column, Id, Task } from "../types";
import ColumnContainer from "./ColumnContainer";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import TaskCard from "./TaskCard";
import axios from "../../node_modules/axios/index";

const defaultCols: Column[] = [
  {
    id: 1,
    title: "hello",
  },
  {
    id: 2,
    title: "Work in progress",
  },
  {
    id: 3,
    title: "Done",
  },
];

const defaultTasks: Task[] = [
  {
    id: "1",
    sectionId: 1,
    content: "List admin APIs for dashboard",
  },
  {
    id: "2",
    sectionId: 1,
    content:
      "Develop user registration functionality with OTP delivered on SMS after email confirmation and phone number confirmation",
  },
  {
    id: "3",
    sectionId: 2,
    content: "Conduct security testing",
  },
  {
    id: "4",
    sectionId: 2,
    content: "Analyze competitors",
  },
  {
    id: "5",
    sectionId: 2,
    content: "Create UI kit documentation",
  },
  {
    id: "6",
    sectionId: 3,
    content: "Dev meeting",
  },
  {
    id: "7",
    sectionId: 3,
    content: "Deliver dashboard prototype",
  },
  // {
  //   id: "8",
  //   sectionId: 1,
  //   content: "Optimize application performance",
  // },
  // {
  //   id: "9",
  //   sectionId: 1,
  //   content: "Implement data validation",
  // },
  // {
  //   id: "10",
  //   sectionId: 1,
  //   content: "Design database schema",
  // },
  // {
  //   id: "11",
  //   sectionId: 1,
  //   content: "Integrate SSL web certificates into workflow",
  // },
  // {
  //   id: "12",
  //   sectionId: 2,
  //   content: "Implement error logging and monitoring",
  // },
  // {
  //   id: "13",
  //   sectionId: 2,
  //   content: "Design and implement responsive UI",
  // },
];

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [update, setUpdate] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  
  const callApi = async (uri: string, method: 'get' | 'post' | 'put' | 'delete', body?: any, func?: any) => {
    const url = `http://localhost:8080/api/boards/1${uri}`;
    console.log(url);

    const res = await axios({
      url: url,
      method: method,
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0MkB0ZXN0LmNvbSIsImF1dGgiOiJVU0VSIiwiZXhwIjoxODAxNzIwODU3NDIwLCJpYXQiOjE3MjA4NTc0MjB9.OCSft86wVv6li6ig80_lLxtq0iUHRandxWmugnxWo4vGQ_ez8rqfy0LzSwL7Wh1b2r61Ks9gxY2vGUJsjQ-64Q"
      },
      data: body,
    })
    if (func) func(res.data);
    return res.data;
  }

  useEffect(() => {
    // api 호출
    callApi('', 'get').then(res=> {
      const datas = res.data;
      console.log(datas);
      setColumns(datas.sections);
      // cards의 id는 string이어야 함
      const cards = datas.sections.map(section => {
        return section.cards.map(card => {
          card.id = String(card.id);
          return card;
        });
      }).flat();
      setTasks(cards);
    })   
  }, [update])


  return (
    <div
      className="
        m-auto
        flex
        min-h-screen
        w-full
        items-center
        overflow-x-auto
        overflow-y-hidden
        px-[40px]
    "
    >
      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="m-auto flex gap-4">
          <div className="flex gap-4">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  deleteColumn={deleteColumn}
                  updateColumn={updateColumn}
                  createTask={createTask}
                  deleteTask={deleteTask}
                  updateTask={updateTask}
                  tasks={tasks.filter((task) => task.sectionId === col.id)}
                />
              ))}
            </SortableContext>
          </div>
          <button
            onClick={() => {
              createNewColumn();
            }}
            className="
      h-[60px]
      w-[350px]
      min-w-[350px]
      cursor-pointer
      rounded-lg
      bg-mainBackgroundColor
      border-2
      border-columnBackgroundColor
      p-4
      ring-rose-500
      hover:ring-2
      flex
      gap-2
      "
          >
            <PlusIcon />
            Add Column
          </button>
        </div>

        {createPortal(
          <DragOverlay>
            {activeColumn && (
              <ColumnContainer
                column={activeColumn}
                deleteColumn={deleteColumn}
                updateColumn={updateColumn}
                createTask={createTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
                tasks={tasks.filter(
                  (task) => task.sectionId === activeColumn.id
                )}
              />
            )}
            {activeTask && (
              <TaskCard
                task={activeTask}
                deleteTask={deleteTask}
                updateTask={updateTask}
              />
            )}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );

  function createTask(sectionId: Id) {
    const content = prompt("content", "");

    console.log(content);

    callApi(`/sections/${sectionId}/cards`, 'post', {
      title: `cards ${tasks.length + 1}`,
      content: content,
      status: sectionId
    }).then(res => {
      const datas = res.data;
      const newTask: Task = {
        id: datas.id,
        sectionId,
        content: datas.content,
      };
      setTasks([...tasks, newTask]);
      setUpdate(!update);
    });
  }

  function deleteTask(id: Id) {
    const sectionId = tasks.find(el => el.id ===id).sectionId;

    callApi(`/sections/${sectionId}/cards/${id}`, "delete")
    .then(res => {
      if (res.status !== 500) {
        const newTasks = tasks.filter((task) => task.id !== id);
        setTasks(newTasks);
        setUpdate(!update);
      } else {
        alert(res.msg);
      }
    });
  }

  function updateTask(id: Id, content: string, isApistart?: boolean) {
    
    const newTasks = tasks.map((task) => {
      if (task.id !== id) return task;
      return { ...task, content };
    });
    
    setTasks(newTasks);
    
    if (isApistart) {
      const task = tasks.find(el => el.id ===id);
      console.log(content);
      console.log("update api start!");
      callApi(`/sections/${task?.sectionId}/cards/${id}`, "put", {
        title: task?.content,
        content: content,
        status: task?.sectionId
      }).then(res => {
        if (res.status === 200) {
          setUpdate(!update);
        }else {
          alert(res.msg);
        }
      });
    }    
  }

  function createNewColumn() {    
    const sectionName = prompt("title", "");

    console.log(sectionName);

    // api 호출
    callApi("/sections", "post", {
      title: sectionName
    }).then(res => {
      const datas = res.data;
      const columnToAdd: Column = {
        id: datas.id,
        title: datas.title,
      };
      setColumns([...columns, columnToAdd]);
      setUpdate(!update);
    });
  }    

  function deleteColumn(id: Id) {
    const filteredColumns = columns.filter((col) => col.id !== id);
    setColumns(filteredColumns);

    // api 호출
    callApi("/sections/" + id, "delete")
    .then(res => {
      if (res.status !== 500) {
        const newTasks = tasks.filter((t) => t.sectionId !== id);
        setTasks(newTasks);
        setUpdate(!update);
      } else {
        alert(res.msg);
      }
    });    
  }

  // 사용하지 않음
  function updateColumn(id: Id, title: string) {
    const newColumns = columns.map((col) => {
      if (col.id !== id) return col;
      return { ...col, title };
    });

    setColumns(newColumns);
  }

  function onDragStart(event: DragStartEvent) {
    console.log(event.active.data.current);
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    console.log("DRAG END");

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);
        const overIndex = tasks.findIndex((t) => t.id === overId);

        if (tasks[activeIndex].sectionId != tasks[overIndex].sectionId) {
          // Fix introduced after video recording
          tasks[activeIndex].sectionId = tasks[overIndex].sectionId;
          return arrayMove(tasks, activeIndex, overIndex - 1);
        }

        return arrayMove(tasks, activeIndex, overIndex);
      });
    }

    const isOverAColumn = over.data.current?.type === "Column";

    // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setTasks((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].sectionId = overId;
        console.log("DROPPING TASK OVER COLUMN", { activeIndex });
        return arrayMove(tasks, activeIndex, activeIndex);
      });
    }
  }
}

function generateId() {
  /* Generate a random number between 0 and 10000 */
  return Math.floor(Math.random() * 10001);
}

export default KanbanBoard;
