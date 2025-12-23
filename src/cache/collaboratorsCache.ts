import { Collaborator } from "../types/collaborator"

type CacheEntry = {
    data: Collaborator[];
    expiresAt: number;
}

class CollaboratorCache {

    private store = new Map<string, CacheEntry>();
    private TTL = 60; // 60 milissegundos

    get(range: string): Collaborator[] | null {

        const entry = this.store.get(range);
        if(!entry) return null;

        if(Date.now() > entry.expiresAt){
            this.store.delete(range);
            return null;
        }

        return entry.data;
    }

    set(range: string, data: Collaborator[]){

        this.store.set(range, {
            data,
            expiresAt: Date.now() + this.TTL * 10000 // 10 minutos
        });
    }

    clear(){
        this.store.clear();
    }
}

export const collaboratorCache = new CollaboratorCache();