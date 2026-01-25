<template>
  <div class="p-8 space-y-4">
    <h1 class="text-2xl font-bold">UButton Test</h1>

    <div class="space-y-2">
      <p>Test 1: Basic UButton</p>
      <UButton>Basic Button</UButton>
    </div>

    <div class="space-y-2">
      <p>Test 2: UButton with label prop</p>
      <UButton label="Label Button" />
    </div>

    <div class="space-y-2">
      <p>Test 3: UButton with color</p>
      <UButton color="amber">Amber Button</UButton>
    </div>

    <div class="space-y-2">
      <p>Test 4: UButton block</p>
      <UButton block>Block Button</UButton>
    </div>

    <div class="space-y-2">
      <p>Test 5: UButton in form</p>
      <form @submit.prevent="() => {}">
        <UButton type="submit">Submit Button</UButton>
      </form>
    </div>
  </div>
</template>
