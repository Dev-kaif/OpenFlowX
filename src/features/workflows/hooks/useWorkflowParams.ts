import { useQueryStates } from 'nuqs';
import { workflowsParams } from '@/features/workflows/params';

export const useWorkflowParams = () => {
    return useQueryStates(workflowsParams)
}
