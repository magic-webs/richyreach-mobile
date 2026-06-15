import { create } from 'zustand';

export interface ActionModalAction {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export interface ActionModalState {
  visible: boolean;
  title?: string;
  message?: string;
  actions?: ActionModalAction[];
}

interface UIStore extends ActionModalState {
  showModal: (params: Omit<ActionModalState, 'visible'>) => void;
  hideModal: () => void;
  tabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  visible: false,
  showModal: (params) => set({ ...params, visible: true }),
  hideModal: () => set({ visible: false, title: undefined, message: undefined, actions: undefined }),
  tabBarVisible: true,
  setTabBarVisible: (visible) => set({ tabBarVisible: visible }),
}));
