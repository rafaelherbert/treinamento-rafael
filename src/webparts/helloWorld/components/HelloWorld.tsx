import * as React from 'react';
import styles from './HelloWorld.module.scss';
import { IHelloWorldProps } from './IHelloWorldProps';
import { escape } from '@microsoft/sp-lodash-subset';
import data, { IListData } from "./Mockup";
import { useEffect, useState } from "react";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users";
import { IItemAddResult, Items, PagedItemCollection } from "@pnp/sp/items";

import TaskCard from './TaskCard'
import { PropertyPaneSlider } from '@microsoft/sp-property-pane';
import * as _ from 'lodash';

export default function HelloWorld(props: IHelloWorldProps) {
  
  
  const [modalAlert, setModalAlert] = useState <boolean>(false)
  
  const [countTasksComplete, setCountTasksComplete] = useState<number>()
  const [countTasksPending, setCountTasksPending] = useState<number>()
  const [currentPage, setCurrentPage] = useState<PagedItemCollection<IListData[]>>(null);
  const [tasks, setTasks] = useState<IListData[]>(null);
  const [task, setTask] = useState<IListData>({
    Title: "",
    Description: "",
    Done: false,
  });

  useEffect(() => {
    firstLoad()
  }, []);

  const firstLoad = async () => {
    const userId = props.context.pageContext.legacyPageContext["userId"]
    const page: PagedItemCollection<IListData[]> = await sp.web.lists.getByTitle("Tarefas").items.filter(`Author eq ${userId}`).top(12).getPaged();

    await Promise.all(page.results.map(async (item) => {
      const user: IListData["User"] = await sp.web.getUserById(item.AuthorId).get();
      item.User = user;
      return item;
    }));
    
    const tasksComplete = [];
    const tasksPending = [];

    page.results.forEach(status => {
      if(!status.Done) tasksPending.push(status);
      tasksComplete.push(status);
    })
    setCountTasksComplete(tasksComplete.length);
    setCountTasksPending(tasksPending.length);
    setCurrentPage(page);
    setTasks(page.results);
  }

  const taskMethod = () => (
    tasks == null ? [] : tasks.map((item, i) => {
      return <TaskCard key={i} item={item} deleteMethod={itemDelete} itemUpdate={itemUpdate}/>;
    })
  )

  const loadMore = async () => {
    const nextPage: PagedItemCollection<IListData[]> = await currentPage.getNext();

    await Promise.all(nextPage.results.map(async (item: IListData) => {
      const user: IListData["User"] = await sp.web.getUserById(item.AuthorId).get();
      item.User = user;
      return item;
    }));

    const tasksComplete = []
    const tasksPending = []

    nextPage.results.forEach(status => {
      if(!status.Done) return tasksPending.push(status.Done)
      tasksComplete.push(status.Done)
    })
    setCountTasksPending(countTasksPending + tasksPending.length)
    setCountTasksComplete(countTasksComplete + tasksComplete.length)

    setTasks([...tasks, ...nextPage.results]);
    setCurrentPage(nextPage);
  }

  const loading = tasks == null;

  const dataForm = (e) => {
    const el = e.target
    if (el.id == 'Title') return setTask({ ...task, Title: el.value })
    if (el.id == 'Description') return setTask({ ...task, Description: el.value })
    if (el.id == 'Done') return setTask({ ...task, Done: !task.Done })
  }
  
  const itemUpdate = async (item) => {
    const iid: any = await sp.web.lists.getByTitle("Tarefas").items.getById(item.Id).update({
      Done: !item.Done
    })
    firstLoad();
  }

  const itemAdd = async () => {
    if(task.Title !== '' && task.Description !== '') {
      setTask({ ...task, Title: '', Description: '', Done: false })
      const iar: IItemAddResult = await sp.web.lists.getByTitle("Tarefas").items.add(task);
      firstLoad();
    }else {
      handleModal();
    }
  }

  const itemDelete = async (item) => {
    const itemId: any = await sp.web.lists.getByTitle("Tarefas").items.getById(item.Id).delete();
    firstLoad();
  }

  const handleModal = () => setModalAlert(!modalAlert);

  return (
    <div className={ styles.container}>
      <h1>Tarefas Diárias</h1>
      <div className={styles.form}>
        <label htmlFor="Title" className={styles.label}>Título da tarefa:</label>
        <input type="text" id="Title" value={task.Title} onChange={dataForm} />
        <label className={styles.label}>Descricao: </label>
        <input type="text" id="Description" value={task.Description} onChange={dataForm} />
        <label className={styles.label}>
          Status: { !task.Done ? <span className={styles.pending}>Pendente</span> : <span className={styles.done}>Finalizado</span>}
          <input className={styles.checkbox} type="checkbox" id="Done" checked={task.Done} onChange={dataForm} />
        </label>
        <button className={styles.addBtn} onClick={itemAdd}>Adicionar tarefa</button>
      </div>
      <div className={styles.containerStatusTarefas}>
        <p className={styles.statusTarefa}>Pendentes <span className={styles.taskCount}>{countTasksPending}</span></p>
        <p className={styles.statusTarefa} >Finalizadas <span className={styles.taskCount}>{countTasksComplete}</span></p>
      </div>
      <div className={styles.taskContainer}>
        {loading ? <p>Buscando...</p> : taskMethod()}
      </div>
      <div className={styles.btnContainer}>
        { currentPage !== null && currentPage.hasNext ? <button className={styles.moreBtn} onClick={loadMore}>Ver mais...</button> : <span>Não há mais tarefas</span> }
      </div>
      { !!modalAlert ?
       <div className={styles.modalAlert}>
         <div className={styles.modal}>
           <h3>Preencha todos os campos</h3>
           <button className={styles.modalBtn} onClick={handleModal}>X</button>
         </div>
        </div> : modalAlert}
    </div>
  );
}

