import * as React from 'react'
import { useEffect } from 'react';
import styles from "./HelloWorld.module.scss"
import { IListData } from './Mockup'

interface ITaskProps {
    item: IListData;
    deleteMethod: (item: IListData) => void;
    itemUpdate: (item: IListData) => void;
}

const TaskCard = ({ item, deleteMethod, itemUpdate}: ITaskProps) => {

    useEffect(() => {
    }, []);

    return (
        <div className={styles.taskCard}>
            <h2>{item.Title}</h2>
            <p>{item.Description}</p>
            <div className={styles.teste}>
                <div>
                    { item.Done ? <span className={styles.statusDone}>{item.Created.toString().substring(0, 10)}</span> : <span className={styles.statusPending}>{item.Created.toString().substring(0, 10)}</span> } 
                    <input type="checkbox" checked={item.Done} onClick={() => itemUpdate(item)}/>
                </div>
                <span>{item.User.Title}</span>
                <img className={styles.icon} src={`/_vti_bin/DelveApi.ashx/people/profileimage?size=S&userId=${item.User.Email}`} alt={`${item.User.Title}`} />
            </div>

            <button className={styles.delBtn} onClick={() => deleteMethod(item)}>X</button>
        </div>
    )
}

export default TaskCard

