import { useQueryStates } from 'nuqs';
import { credentialsParams } from '../server/paramsLoader';

export const useCredentialParams = () => {
    return useQueryStates(credentialsParams)
}
