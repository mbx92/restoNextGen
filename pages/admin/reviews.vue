<script setup lang="ts">
const { confirm } = useConfirmDialog();

definePageMeta({
  layout: "admin",
  middleware: ["admin-auth"],
});

const { data: reviews, refresh } = await useFetch("/api/admin/reviews");

const isEditing = ref(false);
const editingId = ref<string | null>(null);
const reviewForm = ref({
  authorName: "",
  rating: 5,
  comment: "",
  isPublished: false,
  isFeatured: false,
});

const openNew = () => {
  reviewForm.value = {
    authorName: "",
    rating: 5,
    comment: "",
    isPublished: false,
    isFeatured: false,
  };
  editingId.value = null;
  isEditing.value = true;
};

interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  isPublished: boolean;
  isFeatured: boolean;
}

const openEdit = (review: Review) => {
  reviewForm.value = { ...review };
  editingId.value = review.id;
  isEditing.value = true;
};

const save = async () => {
  try {
    if (editingId.value) {
      // Update
      await $fetch(`/api/admin/reviews/${editingId.value}`, {
        method: "PUT",
        body: reviewForm.value,
      });
    } else {
      // Create
      await $fetch("/api/admin/reviews", {
        method: "POST",
        body: reviewForm.value,
      });
    }
    await refresh();
    isEditing.value = false;
  } catch (error) {
    console.error("Failed to save review:", error);
  }
};

const deleteReview = async (id: string) => {
  const confirmed = await confirm({
    title: "Delete Review",
    message: "Are you sure you want to delete this review?",
    confirmText: "Delete",
    confirmColor: "error",
  });
  if (!confirmed) return;

  try {
    await $fetch(`/api/admin/reviews/${id}`, {
      method: "DELETE",
    });
    await refresh();
  } catch (error) {
    console.error("Failed to delete review:", error);
  }
};

const togglePublish = async (review: Review) => {
  await $fetch(`/api/admin/reviews/${review.id}`, {
    method: "PUT",
    body: { isPublished: !review.isPublished },
  });
  await refresh();
};

const featuredCount = computed(() => {
  return reviews.value?.filter((r) => r.isFeatured).length || 0;
});

const toggleFeatured = async (review: Review) => {
  // If trying to feature a new review, check the limit
  if (!review.isFeatured && featuredCount.value >= 6) {
    const toast = useToast();
    toast.add({
      title: "Limit Reached",
      description:
        "Maximum 6 reviews can be featured. Please unfeature another review first.",
      color: "red",
    });
    return;
  }

  await $fetch(`/api/admin/reviews/${review.id}`, {
    method: "PUT",
    body: { isFeatured: !review.isFeatured },
  });
  await refresh();
};

// Computed for filtering reviews
const pendingReviews = computed(() => {
  return reviews.value?.filter((r) => !r.isPublished) || [];
});

const publishedReviews = computed(() => {
  return reviews.value?.filter((r) => r.isPublished) || [];
});

const activeTab = ref<"all" | "pending" | "published">("all");

const displayedReviews = computed(() => {
  if (activeTab.value === "pending") return pendingReviews.value;
  if (activeTab.value === "published") return publishedReviews.value;
  return reviews.value || [];
});
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-serif font-bold text-stone-900">Reviews</h1>
      <p class="mt-2 text-stone-600">
        Manage customer reviews and testimonials
      </p>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h2 class="text-xl font-semibold text-stone-900">Reviews</h2>

            <!-- Tab Pills -->
            <div class="flex gap-2">
              <button
                :class="[
                  'px-3 py-1 text-sm rounded-full transition-colors',
                  activeTab === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
                ]"
                @click="activeTab = 'all'"
              >
                All ({{ reviews?.length || 0 }})
              </button>
              <button
                :class="[
                  'px-3 py-1 text-sm rounded-full transition-colors flex items-center gap-1',
                  activeTab === 'pending'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                ]"
                @click="activeTab = 'pending'"
              >
                Pending
                <UBadge
                  v-if="pendingReviews.length > 0"
                  color="white"
                  size="xs"
                >
                  {{ pendingReviews.length }}
                </UBadge>
              </button>
              <button
                :class="[
                  'px-3 py-1 text-sm rounded-full transition-colors',
                  activeTab === 'published'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100',
                ]"
                @click="activeTab = 'published'"
              >
                Published ({{ publishedReviews.length }})
              </button>
            </div>
          </div>
          <UButton color="primary" @click="openNew">Add Review</UButton>
        </div>
      </template>

      <div
        v-if="displayedReviews && displayedReviews.length > 0"
        class="space-y-4"
      >
        <div
          v-for="review in displayedReviews"
          :key="review.id"
          class="rounded-lg border border-stone-200 p-4 hover:bg-stone-50"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-stone-900">
                  {{ review.authorName }}
                </h3>
                <div class="flex gap-1">
                  <UIcon
                    v-for="i in 5"
                    :key="i"
                    name="i-heroicons-star-solid"
                    :class="
                      i <= review.rating ? 'text-amber-500' : 'text-stone-300'
                    "
                    class="h-4 w-4"
                  />
                </div>
              </div>
              <p class="mt-2 text-sm text-stone-600">{{ review.comment }}</p>
              <div class="mt-3 flex gap-2">
                <UBadge
                  :color="review.isPublished ? 'green' : 'neutral'"
                  variant="subtle"
                >
                  {{ review.isPublished ? "Published" : "Draft" }}
                </UBadge>
                <UBadge
                  v-if="review.isFeatured"
                  color="primary"
                  variant="subtle"
                >
                  Featured
                </UBadge>
              </div>
            </div>
            <div class="flex gap-2">
              <UButton
                variant="ghost"
                size="sm"
                :icon="
                  review.isPublished
                    ? 'i-heroicons-eye-slash'
                    : 'i-heroicons-eye'
                "
                @click="togglePublish(review)"
              />
              <UButton
                variant="ghost"
                size="sm"
                :icon="
                  review.isFeatured
                    ? 'i-heroicons-star-solid'
                    : 'i-heroicons-star'
                "
                @click="toggleFeatured(review)"
              />
              <UButton
                variant="ghost"
                size="sm"
                icon="i-heroicons-pencil"
                @click="openEdit(review)"
              />
              <UButton
                variant="ghost"
                color="red"
                size="sm"
                icon="i-heroicons-trash"
                @click="deleteReview(review.id)"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="py-12 text-center text-stone-500">No reviews yet</div>
    </UCard>

    <!-- Edit Modal -->
    <UModal
      v-model:open="isEditing"
      title="Review Form"
      :description="
        editingId ? 'Update customer review' : 'Add new customer review'
      "
    >
      <template #body>
        <div class="space-y-5">
          <div>
            <label class="mb-2 block text-sm font-medium text-stone-700">
              Author Name <span class="text-red-500">*</span>
            </label>
            <UInput
              v-model="reviewForm.authorName"
              placeholder="John Doe"
              size="lg"
              class="w-full"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-stone-700">
              Rating <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <button
                v-for="i in 5"
                :key="i"
                type="button"
                class="rounded-lg p-2 transition hover:bg-stone-100"
                @click="reviewForm.rating = i"
              >
                <UIcon
                  name="i-heroicons-star-solid"
                  :class="
                    i <= reviewForm.rating
                      ? 'text-primary-500'
                      : 'text-stone-300'
                  "
                  class="h-7 w-7"
                />
              </button>
            </div>
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-stone-700">
              Comment
            </label>
            <UTextarea
              v-model="reviewForm.comment"
              placeholder="Great food and service!"
              :rows="4"
              size="lg"
              class="w-full"
            />
          </div>

          <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <UCheckbox v-model="reviewForm.isPublished" />
              <span class="text-sm font-medium text-stone-700">Published</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <UCheckbox v-model="reviewForm.isFeatured" />
              <span class="text-sm font-medium text-stone-700">Featured</span>
            </label>
          </div>
        </div>
      </template>

      <template #footer="{ close }">
        <div class="flex justify-end gap-3">
          <UButton variant="outline" color="neutral" size="lg" @click="close">
            Cancel
          </UButton>
          <UButton color="primary" size="lg" @click="save">
            {{ editingId ? "Update Review" : "Create Review" }}
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
