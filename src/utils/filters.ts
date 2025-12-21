import dayjs from "dayjs";
import { Turns } from "../constants/turns";
import { isTimeInsideShift } from "./mappers";
import { TimeRecord } from "../types/records";

type Filters<T> = Partial<T>;

export function searchInSheet<T>(params: {
    data: T[];
    filters?: Filters<T>;
}): T[] {

    const { data, filters } = params;

    if(!filters || Object.keys(filters).length === 0) {
        return data;
    }

    return data.filter(item =>

        Object.entries(filters).every(([key, value]) => {
            const itemValue = (item as any)[key];

            if (typeof itemValue === "string" && typeof value === "string") {
                return itemValue.trim().toLowerCase() === value.trim().toLowerCase();
            }

        return itemValue === value;
        })
    );
}

export function filterByMonthAndYear<T extends TimeRecord>(
    records: T[],
    month: number,
    year: number
): T[] {
    
    return records.filter(record => {

        const date = dayjs(record.day, 'DD/MM/YY');
        if(!date.isValid()) return false;

        return (
            date.month() + 1 === month &&
            date.year() === year
        );
    });
}

export function filterByTurn<T extends Record<string, any>>(
    records: T[],
    field: keyof T,
    turn: Turns
): T[] {

    return records.filter(rec => {
        const time = rec[field!];

        if (!time) return false;

        return isTimeInsideShift(String(time), turn);
    });
}