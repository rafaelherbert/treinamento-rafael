import { ISiteUser } from "@pnp/sp/site-users";

export interface IListData {
    Id?: number;
    Title: string;
    Description: string;
    Done: boolean;
    Created?: string;
    Modified?: string;
    AuthorId?: number;
    User?: {
        Email: string;
        Title: string;
    };
}

export default [
    {
        Title: "Tarefa 1",
        Description: "Lavar a louça",
        Done: false 
    },
    {
        Title: "Tarefa 2",
        Description: "Varrer a cozinha",
        Done: false
    },
    {
        Title: "Tarefa 3",
        Description: "Limpar o banheiro",
        Done: false
    },
    {
        Title: "Tarefa 4",
        Description: "Levar água pra galera",
        Done: false
    },
    {
        Title: "Tarefa 5",
        Description: "Descascar o aipim",
        Done: false
    }
] as IListData[];