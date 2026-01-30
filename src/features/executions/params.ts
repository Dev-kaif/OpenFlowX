import { PAGINATION } from '@/config/constant';
import { parseAsInteger } from 'nuqs/server';

export const executionsParams = {
    page: parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE)
        .withOptions({ clearOnDefault: true }),
    pageSize: parseAsInteger
        .withDefault(PAGINATION.DEFAULT_PAGE_SIZE)
        .withOptions({ clearOnDefault: true }),
};
