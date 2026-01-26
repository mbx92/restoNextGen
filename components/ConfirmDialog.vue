<script setup lang="ts">
const { state, handleConfirm, handleCancel } = useConfirmDialog();
</script>

<template>
  <UModal v-model:open="state.isOpen" :title="state.title">
    <template #body>
      <div class="flex items-start gap-4">
        <div
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
          :class="{
            'bg-red-100 text-red-600': state.confirmColor === 'error',
            'bg-yellow-100 text-yellow-600': state.confirmColor === 'warning',
            'bg-blue-100 text-blue-600':
              state.confirmColor === 'primary' || state.confirmColor === 'info',
            'bg-green-100 text-green-600': state.confirmColor === 'success',
            'bg-gray-100 text-gray-600': state.confirmColor === 'neutral',
          }"
        >
          <UIcon :name="state.icon" class="w-5 h-5" />
        </div>
        <p class="text-gray-700 dark:text-gray-300">{{ state.message }}</p>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" color="neutral" @click="handleCancel">
          {{ state.cancelText }}
        </UButton>
        <UButton :color="state.confirmColor as any" @click="handleConfirm">
          {{ state.confirmText }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
