import { TimeRecord } from "../types/records"

type CacheEntry = {
    data: TimeRecord[];
    expiresAt: number;
}

class RecordsCache {

    private store = new Map<string, CacheEntry>();
    private readonly TTL: number = 60;

    get(range: string): TimeRecord[] | null {

        const entry = this.store.get(range);
        if(!entry) return null;

        if(Date.now() > entry.expiresAt){
            this.store.delete(range);
            return null;
        }

        return entry.data;
    }

    set(range: string, data: TimeRecord[]){

        this.store.set(range, {
            data,
            expiresAt: Date.now() + this.TTL * 1000
        });
    }

    clear(){
        this.store.clear();
    }
}

export const recordsCache = new RecordsCache();