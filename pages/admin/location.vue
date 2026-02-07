<script setup lang="ts">
const { requireFeature } = useFeatures();

definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

// Check if CMS feature is enabled
if (
  !requireFeature("CONTENT_MANAGEMENT_SERVICE", "Content Management Service")
) {
  // requireFeature will show toast and navigate to settings if feature is not available
}

const { data: info, refresh } = await useFetch("/api/admin/restaurant-info");

const isEditing = ref(false);
const infoForm = ref({
  name: "",
  description: "",
  address: "",
  phoneNumber: "",
  email: "",
  mapsUrl: "",
  mapsEmbedUrl: "",
  openingHours: "",
});

const edit = () => {
  if (info.value) {
    infoForm.value = {
      name: info.value.name,
      description: info.value.description,
      address: info.value.address,
      phoneNumber: info.value.phoneNumber,
      email: info.value.email,
      mapsUrl: info.value.mapsUrl || "",
      mapsEmbedUrl: info.value.mapsEmbedUrl || "",
      openingHours: info.value.openingHours,
    };
  }
  isEditing.value = true;
};

const save = async () => {
  try {
    await $fetch("/api/admin/restaurant-info", {
      method: "POST",
      body: infoForm.value,
    });
    await refresh();
    isEditing.value = false;
  } catch (error) {
    console.error("Failed to save restaurant info:", error);
  }
};
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">
        Restaurant Info
      </h1>
      <p class="mt-2 text-stone-600">Manage location and contact information</p>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-stone-900">
            Contact & Location
          </h2>
          <UButton
            v-if="!isEditing"
            variant="outline"
            color="neutral"
            @click="edit"
          >
            Edit Info
          </UButton>
        </div>
      </template>

      <div v-if="!isEditing && info">
        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-stone-600">Restaurant Name</p>
            <p class="mt-1 text-stone-900">{{ info.name }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-stone-600">Description</p>
            <p class="mt-1 text-stone-700">{{ info.description }}</p>
          </div>
          <div>
            <p class="text-sm font-medium text-stone-600">Address</p>
            <p class="mt-1 text-stone-700">{{ info.address }}</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm font-medium text-stone-600">Phone</p>
              <p class="mt-1 text-stone-700">{{ info.phoneNumber }}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-stone-600">Email</p>
              <p class="mt-1 text-stone-700">{{ info.email }}</p>
            </div>
          </div>
          <div>
            <p class="text-sm font-medium text-stone-600">Opening Hours</p>
            <p class="mt-1 text-stone-700 whitespace-pre-line">
              {{ info.openingHours }}
            </p>
          </div>
          <div v-if="info.mapsUrl">
            <p class="text-sm font-medium text-stone-600">Google Maps</p>
            <a
              :href="info.mapsUrl"
              target="_blank"
              class="mt-1 text-primary-600 hover:underline"
            >
              View on Google Maps
            </a>
          </div>
          <div v-if="info.mapsEmbedUrl">
            <p class="text-sm font-medium text-stone-600">Maps Embed URL</p>
            <p class="mt-1 text-xs text-stone-500 break-all">
              {{ info.mapsEmbedUrl }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="space-y-4">
        <UFormField label="Restaurant Name" required>
          <UInput
            v-model="infoForm.name"
            placeholder="SalmonSoup Restaurant"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Description" required>
          <UTextarea
            v-model="infoForm.description"
            placeholder="Authentic Indonesian salmon fish soup..."
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Address" required>
          <UTextarea
            v-model="infoForm.address"
            placeholder="Jl. Example No. 123, Jakarta"
            :rows="2"
            class="w-full"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Phone" required>
            <UInput
              v-model="infoForm.phoneNumber"
              placeholder="+62 812 3456 7890"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Email" required>
            <UInput
              v-model="infoForm.email"
              type="email"
              placeholder="info@salmonsoup.com"
              class="w-full"
            />
          </UFormField>
        </div>

        <UFormField label="Opening Hours" required>
          <UTextarea
            v-model="infoForm.openingHours"
            placeholder="Mon-Fri: 10:00 - 22:00&#10;Sat-Sun: 09:00 - 23:00"
            :rows="3"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Google Maps URL (Get Directions)"
          hint="Link for 'Get Directions' button"
        >
          <UInput
            v-model="infoForm.mapsUrl"
            placeholder="https://maps.google.com/?q=..."
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Maps Embed URL (For iframe display)"
          hint="Embed URL from Google Maps share > Embed a map"
        >
          <UInput
            v-model="infoForm.mapsEmbedUrl"
            placeholder="https://www.google.com/maps/embed?pb=..."
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2 pt-4">
          <UButton variant="outline" color="neutral" @click="isEditing = false">
            Cancel
          </UButton>
          <UButton color="primary" @click="save"> Save </UButton>
        </div>
      </div>

      <div v-if="!isEditing && !info" class="py-12 text-center text-stone-500">
        No restaurant information configured. Click Edit to add.
      </div>
    </UCard>
  </div>
</template>
