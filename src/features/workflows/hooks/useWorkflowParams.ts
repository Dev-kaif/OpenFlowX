import { useQueryStates } from 'nuqs';
import { workflowsParams } from '@/features/workflows/server/paramsLoader';

export const useWorkflowParams = () => {
    return useQueryStates(workflowsParams)
}
