import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'

import './style.css'

export default <typeof DefaultTheme>{
    ...DefaultTheme,
    Layout,
}