import { App } from 'vue';
import { default as MovableBox } from './components/MovableBox/MovableBox';
import { MovableBoxProps, ExtendsMovableBox, MovableBoxExpose, HandlesSet } from './types/MovableBox';

export { MovableBox };
export type { MovableBoxProps, ExtendsMovableBox, MovableBoxExpose, HandlesSet };
export declare const name = "VueMovableBox";
declare const _default: {
    name: string;
    version: string;
    install: (app: App<any>) => void;
};
export default _default;
declare global {
    interface Window {
        Vue: {
            use: (plugin: {
                install: (app: App) => void;
            }) => void;
        };
    }
}
