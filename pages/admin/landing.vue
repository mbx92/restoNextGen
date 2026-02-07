<script setup lang="ts">
const { confirm } = useConfirmDialog();
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

interface Hero {
  id: string;
  campaignId: string | null;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  promoText: string | null;
  imageUrl: string | null;
  isActive: boolean;
  campaign?: {
    id: string;
    name: string;
    type: string;
    discount: number | null;
  } | null;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  discount: number | null;
}

const { data: heroes, refresh: refreshHeroes } = await useFetch<Hero[]>(
  "/api/admin/landing/hero",
);

const { data: campaigns } = await useFetch<Campaign[]>(
  "/api/admin/crm/campaigns",
);

const campaignOptions = computed(() => {
  if (!campaigns.value || campaigns.value.length === 0) {
    return [{ label: "No Campaign", value: null }];
  }
  const noCampaign = { label: "No Campaign", value: null };
  const activeCampaigns = campaigns.value
    .filter((c) => c.status === "ACTIVE" || c.status === "SCHEDULED")
    .map((c) => ({
      label: `${c.name} (${c.type})`,
      value: c.id,
    }));
  return [noCampaign, ...activeCampaigns];
});

const isHeroModalOpen = ref(false);
const editingHero = ref<Hero | null>(null);
const heroForm = ref({
  campaignId: null as string | null,
  title: "",
  subtitle: "",
  description: "",
  ctaText: "Order Now",
  ctaLink: "#menu",
  promoText: "",
  imageUrl: "",
  isActive: true,
});

const openCreateHero = () => {
  editingHero.value = null;
  heroForm.value = {
    campaignId: null,
    title: "",
    subtitle: "",
    description: "",
    ctaText: "Order Now",
    ctaLink: "#menu",
    promoText: "",
    imageUrl: "",
    isActive: true,
  };
  isHeroModalOpen.value = true;
};

const openEditHero = (hero: Hero) => {
  editingHero.value = hero;
  heroForm.value = { ...hero };
  isHeroModalOpen.value = true;
};

const saveHero = async () => {
  try {
    if (editingHero.value) {
      await $fetch(`/api/admin/landing/hero/${editingHero.value.id}`, {
        method: "PATCH",
        body: heroForm.value,
      });
    } else {
      await $fetch("/api/admin/landing/hero", {
        method: "POST",
        body: heroForm.value,
      });
    }
    await refreshHeroes();
    isHeroModalOpen.value = false;
  } catch (error) {
    console.error("Failed to save hero:", error);
  }
};

const toggleHeroActive = async (hero: Hero) => {
  try {
    await $fetch(`/api/admin/landing/hero/${hero.id}`, {
      method: "PATCH",
      body: { isActive: !hero.isActive },
    });
    await refreshHeroes();
  } catch (error) {
    console.error("Failed to toggle hero:", error);
  }
};

const deleteHero = async (id: string) => {
  const confirmed = await confirm({
    title: "Delete Hero",
    message: "Are you sure you want to delete this hero?",
    confirmText: "Delete",
    confirmColor: "error",
  });
  if (!confirmed) return;

  try {
    await $fetch(`/api/admin/landing/hero/${id}`, {
      method: "DELETE",
    });
    await refreshHeroes();
  } catch (error) {
    console.error("Failed to delete hero:", error);
  }
};
</script>

<template>
  <div>
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-serif font-bold text-stone-900">
          Landing Page
        </h1>
        <p class="mt-2 text-stone-600">Manage hero section content</p>
      </div>
    </div>

    <!-- Hero Section -->
    <div class="mb-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-semibold text-stone-900">Hero Sections</h2>
          <p class="text-sm text-stone-600 mt-1">
            Multiple active heroes will appear as a carousel
          </p>
        </div>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          @click="openCreateHero"
        >
          Add Hero
        </UButton>
      </div>

      <!-- Heroes List -->
      <div v-if="heroes && heroes.length > 0" class="space-y-4">
        <div
          v-for="hero in heroes"
          :key="hero.id"
          class="flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-4 hover:shadow-md transition-shadow"
        >
          <!-- Image -->
          <div
            class="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100"
          >
            <img
              v-if="hero.imageUrl"
              :src="hero.imageUrl"
              :alt="hero.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon
                name="i-heroicons-photo"
                class="w-12 h-12 text-stone-300"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-bold text-stone-900 mb-1">
              {{ hero.title }}
              <span class="text-amber-700 italic">{{ hero.subtitle }}</span>
            </h3>
            <p class="text-sm text-stone-600 mb-2 line-clamp-2">
              {{ hero.description }}
            </p>
            <div class="flex flex-wrap gap-2 mb-2">
              <div
                v-if="hero.campaign"
                class="inline-flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
              >
                <UIcon name="i-heroicons-megaphone" class="w-3 h-3" />
                {{ hero.campaign.name }}
                <span v-if="hero.campaign.discount" class="font-semibold">
                  {{ hero.campaign.discount }}% OFF
                </span>
              </div>
              <div
                v-if="hero.promoText"
                class="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full"
              >
                <UIcon name="i-heroicons-sparkles" class="w-3 h-3" />
                {{ hero.promoText }}
              </div>
            </div>

            <!-- Actions -->
            <div class="mt-3 flex gap-2">
              <UButton
                size="xs"
                color="neutral"
                variant="outline"
                icon="i-heroicons-pencil"
                @click="openEditHero(hero)"
              >
                Edit
              </UButton>
              <UButton
                size="xs"
                color="error"
                variant="outline"
                icon="i-heroicons-trash"
                @click="deleteHero(hero.id)"
              >
                Delete
              </UButton>
            </div>
          </div>

          <!-- Toggle Active -->
          <div class="flex flex-col items-end gap-2">
            <UBadge :color="hero.isActive ? 'success' : 'neutral'" size="xs">
              {{ hero.isActive ? "Active" : "Inactive" }}
            </UBadge>
            <USwitch
              :model-value="hero.isActive"
              @update:model-value="toggleHeroActive(hero)"
            />
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-12 bg-stone-50 rounded-xl border-2 border-dashed border-stone-300"
      >
        <UIcon
          name="i-heroicons-sparkles"
          class="w-16 h-16 text-stone-400 mx-auto mb-4"
        />
        <h3 class="text-xl font-semibold text-stone-900 mb-2">
          No Hero Sections Yet
        </h3>
        <p class="text-stone-600 mb-6">
          Add your first hero section to showcase on the landing page.
        </p>
        <UButton color="primary" @click="openCreateHero"> Add Hero </UButton>
      </div>
    </div>

    <!-- Hero Modal -->
    <UModal
      v-model:open="isHeroModalOpen"
      :title="editingHero ? 'Edit Hero' : 'New Hero'"
      description="Manage hero section details"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField
            label="Campaign (Optional)"
            hint="Link this hero to an active campaign"
          >
            <USelectMenu
              v-model="heroForm.campaignId"
              :options="campaignOptions"
              value-key="value"
              placeholder="Select a campaign"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Title" required>
            <UInput
              v-model="heroForm.title"
              placeholder="Authentic Indonesian"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Subtitle" required>
            <UInput
              v-model="heroForm.subtitle"
              placeholder="Salmon Fish Soup"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Description" required>
            <UTextarea
              v-model="heroForm.description"
              placeholder="Fresh salmon cooked to perfection..."
              :rows="4"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Promo Text (optional)">
            <UInput
              v-model="heroForm.promoText"
              placeholder="Grand Opening - 20% Off All Orders!"
              class="w-full"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="CTA Text">
              <UInput
                v-model="heroForm.ctaText"
                placeholder="Order Now"
                class="w-full"
              />
            </UFormField>

            <UFormField label="CTA Link">
              <UInput
                v-model="heroForm.ctaLink"
                placeholder="#menu"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Image URL" required>
            <UInput
              v-model="heroForm.imageUrl"
              placeholder="https://example.com/image.jpg"
              class="w-full"
            />
          </UFormField>

          <UFormField label="Status">
            <div class="flex items-center gap-3">
              <USwitch v-model="heroForm.isActive" />
              <span class="text-sm text-stone-600">
                {{ heroForm.isActive ? "Active" : "Inactive" }}
              </span>
            </div>
          </UFormField>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="outline"
            @click="isHeroModalOpen = false"
          >
            Cancel
          </UButton>
          <UButton color="primary" @click="saveHero"> Save Hero </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
