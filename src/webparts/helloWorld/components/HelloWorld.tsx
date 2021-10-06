import * as React from 'react';
import styles from './HelloWorld.module.scss';
import { IHelloWorldProps } from './IHelloWorldProps';
import { escape } from '@microsoft/sp-lodash-subset';
import data, { ListData } from "./Mockup";
import { useEffect, useState } from "react";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import { IItemAddResult } from "@pnp/sp/items";

import TaskCard from './TaskCard'

export default function HelloWorld() {

  const [tasks, setTasks] = useState<ListData[]>(null);
  const [task, setTask] = useState<ListData>({
    Title: "",
    Description: "",
    Done: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const list = sp.web.lists.getByTitle("Tarefas");
    const items = await list.items.get();

    if (tasks !== null) setTasks(null)

    const listDataArr: ListData[] = items.map(item => (
      {
        Id: item.ID,
        Title: item.Title,
        Description: item.Description,
        Done: item.Done
      }
    ))
    setTimeout(() => setTasks(listDataArr), 500)
  }

  const loading = tasks == null;

  const taskList = () => { return tasks == null ? [] : tasks.map(item => (< TaskCard item={item} deleteMethod={itemDelete} itemUpdate={itemUpdate} />)); }

  const dataForm = (e) => {
    const el = e.target
    if (el.id == 'Title') setTask({ ...task, Title: el.value })
    if (el.id == 'Description') setTask({ ...task, Description: el.value })
    if (el.id == 'Done') {
      setTask({ ...task, Done: !task.Done })
      // itemUpdate(task)
    }
  }
  
  const itemUpdate = async (item) => {
    setTask({ ...task, Done: !task.Done })
    console.log(!task.Done)
    const iid: any = await sp.web.lists.getByTitle("Tarefas").items.getById(item.Id).update({
      Done: !task.Done
    })
    loadData()
  }

  const inserirTarefa = async () => {
    const iar: IItemAddResult = await sp.web.lists.getByTitle("Tarefas").items.add(task);
    loadData()
  }

  const itemDelete = async (item) => {
    const itemId: any = await sp.web.lists.getByTitle("Tarefas").items.getById(item.Id).delete();
    loadData()
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <label htmlFor="Title" className={styles.label}>Título da tarefa:</label>
        <input type="text" id="Title" value={task.Title} onChange={dataForm} />
        <label className={styles.label}>Descricao: </label>
        <input type="text" id="Description" value={task.Description} onChange={dataForm} />
        <label className={styles.label}>
          Status: { !task.Done ? <span className={styles.pending}>Pendente</span> : <span className={styles.ok}>Finalizado</span>}
        </label>
        <input className={styles.checkbox} type="checkbox" id="Done" checked={task.Done} onChange={dataForm} />
        <button className={styles.addBtn} onClick={inserirTarefa}>Adicionar tarefa</button>
      </div>
      <div className={styles.taskContainer}>
        {loading ? <p>Buscando...</p> : 
           taskList()
          }
      </div>
    </div>
  );
}

