import { MutationTree, GetterTree, ActionTree } from 'vuex';
import type {EnsurePrefix} from '@/configurator/store/ui-state';
import type { StoreState } from '@/common/store';


type PlannerUiStateIdentifier = EnsurePrefix<'PLANNER_UI_STATE_'>;
export interface PlannerUiState {
}

export const PLANNER_UI_STATE_MUTATIONS: PlannerUiStateIdentifier = {
};
export const PLANNER_UI_STATE_ACTIONS: PlannerUiStateIdentifier = {
  ACTION: "PLANNER_UI_STATE_ACTION",
};
  export const PLANNER_UI_STATE_GETTERS: PlannerUiStateIdentifier = {
};
  
export const initialState: PlannerUiState = {
};

const mutations: MutationTree<PlannerUiState> = {
  [PLANNER_UI_STATE_ACTIONS.ACTION]({commit, dispatch}): void {
      return true;
    },
};
const getters: GetterTree<PlannerUiState, StoreState> = {
    
};
const actions: ActionTree<PlannerUiState, StoreState> = {

}

export default {mutations, getters};
