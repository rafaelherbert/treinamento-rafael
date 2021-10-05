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

/**
 * - Converter o array de items de lista para um array de "ListData" (Nossa interface que declaramos no Mockup.ts)
 * - Colocar esse array no state.
 * - Fazer o map desse state para exibir as informações da lista na tela.
 * - Criar um estado de carregamento.
 */

export default function HelloWorld() {

  const [tasks, setTasks] = useState<ListData[]>(null);
  const [task, setTask] = useState<ListData>({
    Title: "",
    Description: "",
    Done: false
  });
  
    useEffect(() => {
      loadData();
      converterMethod()
    }, []);

    const loadData = async () => {
      const list = sp.web.lists.getByTitle("Tarefas");
      const items = await list.items.get();
      return items;
    }

    const converterMethod = async () => {
      if (tasks !== null) setTasks(null);

      const itemsResponse = await loadData()
      const listDataArray: ListData[] = itemsResponse.map(item => (
        {
          Id: item.ID,
          Title: item.Title,
          Description: item.Description,
          Done: item.Done
        }
      ));

      setTimeout(() => setTasks(listDataArray), 2500)
    }

    const loading = tasks == null;
    
    const taskList = tasks == null ? [] : tasks.map(item => (
      <div className={styles.taskCard}>
          <h1>{item.Title}</h1>
          <p>{item.Description}</p>
          <p>{item.Done}</p>
          <input type="checkbox" />
          <button onClick={() => {
            console.log("APAGANDO ITEM DE LISTA");
          }}>Apagar</button>
      </div>
    ));

    const dataForm = (e) => {
      const el = e.target
      if(el.id == 'Title') setTask({...task, Title: el.value})
      if(el.id == 'Description') setTask({...task, Description: el.value})
    }

    const inserirTarefa = async () => {
      const iar:IItemAddResult = await sp.web.lists.getByTitle("Tarefas").items.add({
        Title: task.Title,
        Description: task.Description
      });
      converterMethod();
    }

    return (
      <div className={styles.container}>
        <div className={styles.form}>
          <label htmlFor="Title">Título da tarefa</label>
          <input type="text" id="Title" value={task.Title} onChange={dataForm}/>
          <label>Descricao</label>
          <input type="text" id="Description" value={task.Description} onChange={dataForm} />
          <input type="checkbox" id="Done" />
          <button onClick={inserirTarefa}>add</button>
        </div>
        <div className={styles.taskContainer}>
          { loading ? <p>Buscando...</p> : taskList }
        </div>
      </div>
    );
  }

