import * as React from 'react'

import styles from "./HelloWorld.module.scss"
import { ListData } from './Mockup'

interface ITaskProps {
    item: ListData;
    deleteMethod: (item: ListData) => void;
    itemUpdate: (item: ListData) => void
}

const TaskCard = ({ item, deleteMethod, itemUpdate }: ITaskProps) => {
    return (
        <div className={styles.taskCard}>
            <h1>{item.Title}</h1>
            <p>{item.Description}</p>
            <p>Status: {item.Done ? <span className={styles.ok}>Finalizado</span> : <span className={styles.pending}>Pendente</span>}</p>
            <input type="checkbox" checked={item.Done} onChange={() => itemUpdate(item)}/>
            <button onClick={() => {deleteMethod(item)}}>Apagar</button>
        </div>
    )
}

export default TaskCard