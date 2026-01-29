import { createLoader, parseAsInteger, parseAsString } from 'nuqs/server';
import { PAGINATION } from '@/config/constant';

export const credentialsParams = {
    page: parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
    pageSize: parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE_SIZE).withOptions({ clearOnDefault: true }),
    search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
}

export const credentialsParamLoader = createLoader(credentialsParams);