type Filters<T> = Partial<Record<keyof T, unknown>>;

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