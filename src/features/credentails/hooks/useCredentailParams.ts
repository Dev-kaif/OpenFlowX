import { useQueryStates } from 'nuqs';
import { credentialsParams } from '../params';

export const useCredentailParams = () => {
    return useQueryStates(credentialsParams)
}
