import { MutationTree, GetterTree, ActionTree } from 'vuex';
import type {EnsurePrefix} from '@/configurator/store/ui-state';
import type { StoreState } from '@/common/store';


type <moduleName>Identifier = EnsurePrefix<'<moduleNameUppercase>'>;
export interface <moduleName> {
}

export const <moduleNameUppercase>MUTATIONS: <moduleName>Identifier = {
};
export const <moduleNameUppercase>ACTIONS: <moduleName>Identifier = {
};
  export const <moduleNameUppercase>GETTERS: <moduleName>Identifier = {
};
  
export const initialState: <moduleName> = {
};

const mutations: MutationTree<<moduleName>> = {
};
const getters: GetterTree<<moduleName>, StoreState> = {
    
};
const actions: ActionTree<<moduleName>, StoreState> = {

}

export default {mutations, getters};
