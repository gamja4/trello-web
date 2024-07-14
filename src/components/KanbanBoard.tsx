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
import { useParams } from "../../node_modules/react-router-dom/dist/index";

const defaultCols: Column[] = [
  {
    id: 1,
    title: "hello",
    sort: 0
  },
  {
    id: 2,
    title: "Work in progress",
    sort: 1
  },
  {
    id: 3,
    title: "Done",
    sort: 2
  },
];

const defaultTasks: Task[] = [
  {
    id: "1",
    sectionId: 1,
    content: "List admin APIs for dashboard",
    sort: 0,
  },
  {
    id: "2",
    sectionId: 1,
    content: "Develop user registration functionality with OTP delivered on SMS after email confirmation and phone number confirmation",
    sort: 1,
  },
  {
    id: "3",
    sectionId: 2,
    content: "Conduct security testing",
    sort: 1,
  },
  {
    id: "4",
    sectionId: 2,
    content: "Analyze competitors",
    sort: 2,
  },
  {
    id: "5",
    sectionId: 2,
    content: "Create UI kit documentation",
    sort: 3,
  },
  {
    id: "6",
    sectionId: 3,
    content: "Dev meeting",
    sort: 1,
  },
  {
    id: "7",
    sectionId: 3,
    content: "Deliver dashboard prototype",
    sort: 2,
  },
];

function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(defaultCols);
  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const [tasks, setTasks] = useState<Task[]>(defaultTasks);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const [update, setUpdate] = useState(false);

  const [columnUpdate, setColumnUpdate] = useState<Boolean>(false);

  const { boardId } = useParams();

  console.log(boardId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  
  let dragTaskOverId = 0;

  
  const callApi = async (uri: string, method: 'get' | 'post' | 'put' | 'delete', body?: any, func?: any) => {
    const url = `http://localhost:8080/api/boards/${boardId}${uri}`;
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
    if (columnUpdate) {
      console.log(columns);

      const reqColumns = columns.map((column, i) => ({
        id: column.id,
        sort: i
      }));

      const req = {
        sections: reqColumns
      };

      callApi('/sections', 'put', req)
      .then(res => {
        if (res.status !== 500){
          setColumnUpdate(false);
          setUpdate(!update);
        }
      })

      return;
    }
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
  }, [update, columnUpdate])


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
    // 현재 section Id가 필요함
    // dragEnd로 이미 정렬된 배열의 데이터가 tasks에 저장되어있음
    // 그냥 백엔드에서 card update할 때 section이 변경이 되었다면 section도 변경을 해주자..

    // 현재 section id는 active id또는 overId로 가져올 수 있는데 해당 id가 뭔지 이제부터 알아야지
    console.log(tasks);

    setActiveColumn(null);
    setActiveTask(null);
    
    const { active, over } = event;
    if (!over) return;
    
    // 해당 id는, column을 위한 id이다.
    const activeId = active.id;
    const overId = over.id;

    
    const isActiveATask = active.data.current?.type === "Task";
    if (isActiveATask) {
      const moveSectionId = tasks.find(el => el.id === overId).sectionId;
      const moveTasks = tasks.filter(task => task.sectionId === moveSectionId);
  
      // sort 값 추가 및 id 추가해준다.
      const orderTasks = moveTasks.map((task, i) => ({
        id: +task.id,
        sort: i
      }));

      // 요청 데이터 생성
      const card = {
        sectionId: moveSectionId,
        cards: orderTasks
      }

      // api 호출
      callApi(`/sections/${moveSectionId}/cards`, "put", card)
      .then(res => {
        if (res.status !== 500) {
          setUpdate(!update);
        } else {
          alert(res.msg);
        }
      });

    }

    if (activeId === overId) return;

    // 컬럼 이동 관련 시작
    const isActiveAColumn = active.data.current?.type === "Column";
    if (!isActiveAColumn) return;

    console.log(columns);

    console.log("Column DRAG END");

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });

    setColumnUpdate(true);
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    console.log(`task activeId: ${activeId}, overId: ${overId}`);

    if (activeId === overId) return;
    
    // 이 overId를 저장해야한다.
    dragTaskOverId = overId;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // 이게 task 관련 id!!
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
