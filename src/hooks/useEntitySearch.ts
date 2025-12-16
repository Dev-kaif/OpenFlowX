import { PAGINATION } from "@/config/constant";
import { useEffect, useState } from "react"

interface UseEntitySearchProps<T extends {
    search: string;
    page: number; 
}>{
    params: T;
    setParams: (params: T) => void;
    debounceMs?: number;
}


export function useEntitySearch<T extends {
    search: string;
    page: number;
}>({
    params,
    setParams,
    debounceMs = 500
}: UseEntitySearchProps<T>) {

    const [localSearch, setLocalSearch] = useState<string>(params.search);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== params.search) {
                setParams({
                    ...params,
                    search: localSearch,
                    page: PAGINATION.DEFAULT_PAGE
                });
            }
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localSearch, debounceMs, params, setParams]);

    return {
        searchValue: localSearch,
        onSearchChange: setLocalSearch
    };
}
