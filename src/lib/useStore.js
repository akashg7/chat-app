import create from 'zustand';

const useStore = create((set) => ({
  activeComponent: 'List', // This can be 'ChatList', 'ChatDetail', etc.
  setActiveComponent: (component) => set({ activeComponent: component }),
}));

export default useStore;
