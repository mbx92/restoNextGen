<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-yellow-50">
    <div class="container mx-auto px-4 py-16">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900">
          Mulai Bisnis Digital Anda
        </h1>
        <p class="text-xl text-gray-600">
          Pilih jenis bisnis Anda dan kami akan menyiapkan sistem yang sesuai
        </p>
      </div>

      <!-- Business Type Cards -->
      <div v-if="businessTypes" class="mx-auto max-w-6xl">
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UCard
            v-for="type in businessTypes"
            :key="type.id"
            class="cursor-pointer transition-all hover:shadow-lg"
            :class="{
              'ring-2 ring-green-500': selectedType === type.id,
            }"
            @click="selectBusinessType(type.id)"
          >
            <div class="text-center">
              <div class="mb-4 flex justify-center">
                <UIcon
                  :name="type.icon"
                  class="h-16 w-16"
                  :class="`text-${type.color}-600`"
                />
              </div>
              <h3 class="mb-2 text-xl font-bold text-gray-900">
                {{ type.name }}
              </h3>
              <p class="mb-4 text-sm text-gray-600">
                {{ type.description }}
              </p>

              <!-- Features -->
              <div class="mb-4 space-y-1">
                <p class="text-xs font-semibold uppercase text-gray-500">
                  Fitur Utama:
                </p>
                <ul class="space-y-1 text-left text-sm">
                  <li
                    v-for="feature in type.features.slice(0, 4)"
                    :key="feature"
                    class="flex items-center text-gray-700"
                  >
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="mr-2 h-4 w-4 text-green-600"
                    />
                    {{ feature }}
                  </li>
                </ul>
              </div>

              <UButton
                :color="selectedType === type.id ? 'success' : 'neutral'"
                :variant="selectedType === type.id ? 'solid' : 'outline'"
                block
              >
                {{ selectedType === type.id ? "Dipilih" : "Pilih" }}
              </UButton>
            </div>
          </UCard>
        </div>

        <!-- Continue Button -->
        <div class="mt-12 text-center">
          <UButton
            size="xl"
            :disabled="!selectedType"
            color="primary"
            @click="continueToSetup"
          >
            Lanjutkan ke Setup
            <UIcon name="i-heroicons-arrow-right" class="ml-2" />
          </UButton>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="text-center">
        <UIcon
          name="i-heroicons-arrow-path"
          class="h-8 w-8 animate-spin text-gray-400"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "blank",
});

type BusinessType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
};

const selectedType = ref<string | null>(null);

const { data: response } = await useFetch<{
  businessTypes: BusinessType[];
}>("/api/onboarding/business-types");

const businessTypes = computed(() => response.value?.businessTypes || []);

const selectBusinessType = (typeId: string) => {
  selectedType.value = typeId;
};

const continueToSetup = () => {
  if (!selectedType.value) return;
  navigateTo(`/onboarding/setup?type=${selectedType.value}`);
};
</script>
