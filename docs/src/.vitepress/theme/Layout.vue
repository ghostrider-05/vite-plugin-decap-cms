<script setup lang="ts">
import { onMounted } from 'vue';

import { useRouter } from 'vitepress/client';
import DefaultTheme from 'vitepress/theme'

const router = useRouter()
const update = () => document.getElementsByClassName('edit-link-button')[0]?.setAttribute('target', '_self')

onMounted(update)
router.onAfterRouteChanged = update

const { Layout } = DefaultTheme
</script>

<template>
    <Layout></Layout>
</template>