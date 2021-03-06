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
import { IItemAddResult, IItemUpdateResult, Items, PagedItemCollection } from "@pnp/sp/items";

import TaskCard from './TaskCard'
import { PropertyPaneSlider } from '@microsoft/sp-property-pane';
import * as _ from 'lodash';
import { filter } from 'lodash';


const pageSize = 9;

export default function HelloWorld(props: IHelloWorldProps) {

  const [searchValue, setSearchValue] = useState<string>();

  const [filter, setFilter] = useState<string>(null);
  const [page, setPage] = useState<PagedItemCollection<IListData[]>>();
  const [modalAdd, setModalAdd] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [tasks, setTasks] = useState<IListData[]>(null);
  const [unfilteredTasks, setUnfilteredTasks] = useState<IListData[]>(null);
  const [task, setTask] = useState<IListData>({
    Title: "",
    Description: "",
    Done: false,
  });

  useEffect(() => {
    firstLoad();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [filter]);

  const firstLoad = async () => {
    const userId = props.context.pageContext.legacyPageContext["userId"]
    const page: PagedItemCollection<IListData[]> = await sp.web.lists.getByTitle("Tarefas").items.filter(`Author eq ${userId}`).top(9).getPaged();
    setPage(page);
    
    const items: IListData[] = await sp.web.lists.getByTitle("Tarefas").items.filter(`Author eq ${userId}`).get();
    await Promise.all(items.map(async (item) => {
      const user: IListData["User"] = await sp.web.getUserById(item.AuthorId).get();
      item.User = user;
      return item;
    }));
    
    setUnfilteredTasks(items);
    setTasks(items);
  }
  
  const filterStatusTask = async (e) => {
    const el: HTMLInputElement = e.target

    const userId = props.context.pageContext.legacyPageContext["userId"]
    const page: PagedItemCollection<IListData[]> = await sp.web.lists.getByTitle("Tarefas").items.filter(`Author eq ${userId}`).top(12).getPaged();
    
    if (el.value === "pending") {
      setPage(page);
      setFilter('pending')
      setTasks(unfilteredTasks.filter(t => !t.Done));
    } else if (el.value === "complete"){
      setPage(page);
      setFilter('complete')
      setTasks(unfilteredTasks.filter(t => t.Done));
    } else {
      setPage(page);
      setFilter('all')
      setTasks(unfilteredTasks);
    }
  }

  const taskMethod = (param: IListData[]) => (
    param == null ? [] : param.slice(0, currentPage * pageSize + pageSize).map((item, i) => {
      return <TaskCard key={i} item={item} deleteMethod={itemDelete} itemUpdate={itemUpdate} />
    })
  );

  const loadMore = async () => {
    setCurrentPage(currentPage + 1);

    const nextPage: PagedItemCollection<IListData[]> = await page.getNext();
    setPage(nextPage);
  }

  const loading = tasks == null;

  const dataForm = (e) => {
    const el = e.target;
    if (el.id == 'Title') setTask({ ...task, Title: el.value })
    if (el.id == 'Description') setTask({ ...task, Description: el.value });;
    if (el.id == 'Done') setTask({ ...task, Done: !task.Done });
  }
  
  const itemUpdate = async (item) => {
    await sp.web.lists.getByTitle("Tarefas").items.getById(item.Id).update({
      Done: !item.Done
    })
    firstLoad();
  }

  const itemAdd = async () => {
    setTask({ ...task, Title: '', Description: '', Done: false })
    if(task.Title === '' || task.Description === '') return alert('Preencha os campos')
    await sp.web.lists.getByTitle("Tarefas").items.add(task);
    firstLoad();
    handleModalAdd();
  }

  const itemDelete = async (item) => {
    await sp.web.lists.getByTitle("Tarefas").items.getById(item.Id).delete();
    firstLoad();
  }
  
  const handleSearch = (e) => {
    const searchValue = e.target.value;

    const filtered = unfilteredTasks.filter(t => t.Title.toLowerCase().includes(searchValue.toLowerCase()));
    setTasks(filtered);
    setSearchValue(searchValue);
  }

  const handleModalAdd = () => setModalAdd(!modalAdd);

  return (
    <div className={ styles.container}>
      <h1>Tarefas Di??rias</h1>
      { !modalAdd ? modalAdd : 
      <div className={styles.modalAddBackground}>
        <div className={styles.modalAdd}>
          <h2>Nova tarefa</h2>
          <label htmlFor="Title" className={styles.label}>T??tulo da tarefa:</label>
          <input className={styles.inputForm} type="text" id="Title" value={task.Title} onChange={dataForm}/>
          <label className={styles.label}>Descri????o: </label>
          <input className={styles.inputForm} type="text" id="Description" value={task.Description} onChange={dataForm} />
          <label className={styles.label}>
          Status: { !task.Done ? <span className={styles.pending}>Pendente</span> : <span className={styles.done}>Finalizado</span>}
            <input className={styles.checkbox} type="checkbox" id="Done" checked={task.Done} onChange={dataForm} />
          </label>
          <button className={styles.addBtn} onClick={itemAdd}>Adicionar tarefa</button>
          <button className={styles.modalBtn} onClick={handleModalAdd}>X</button>
        </div>
      </div> }
      
      <div className={styles.containerStatusTarefas}>
        <div>Pendentes<span>{tasks === null ? 0 : tasks.filter(t => !t.Done).length}</span></div>
        <div>Finalizadas <span >{tasks === null ? 0 : tasks.filter(t => t.Done).length}</span></div>
        <div className={styles.ctnStatus}>
          <label className={styles.label}>Status:</label>
          <select className={styles.select} id="filterSelect" onChange={filterStatusTask}>
            <option id="" value="">--------</option>
            <option id="pending" value="pending">Pendente</option>
            <option id="complete" value="complete">Finalizada</option>
            <option id="all" value="all">Todas</option>
          </select>
        </div>
        <div className={styles.ctnStatus}>
          <label className={styles.label}>Pesquisa: </label>
          <input className={styles.searchInput} type="text" value={searchValue} placeholder="Procure por uma tarefa" onChange={handleSearch}  />
        </div>
      </div>
      <button className={styles.modalAddBtn} onClick={handleModalAdd}>+</button>

      <div className={styles.taskContainer}>
        {loading ? <p>Buscando...</p> : taskMethod(tasks)}
      </div>
      <div className={styles.btnContainer}>
        { !searchValue && page && page.hasNext ? <button className={styles.moreBtn} onClick={loadMore}>Ver mais...</button> : <p>N??o h?? mais tarefas</p> }
      </div>
    </div>
  );
}

