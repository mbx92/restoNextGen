<script setup lang="ts">
const route = useRoute();
const router = useRouter();

// QR code params (optional)
const tableCode = route.query.table as string | undefined;
const orderId = route.query.order as string | undefined;

const form = ref({
  authorName: "",
  rating: 5,
  comment: "",
});

const isSubmitting = ref(false);
const currentRating = ref(5);

const setRating = (rating: number) => {
  currentRating.value = rating;
  form.value.rating = rating;
};

const submit = async () => {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;

    await $fetch("/api/public/reviews/submit", {
      method: "POST",
      body: {
        ...form.value,
        tableCode,
        orderId,
      },
    });

    // Redirect to thank you page
    router.push("/write-review/thank-you");
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } };
    const toast = useToast();
    toast.add({
      title: "Error",
      description: err.data?.message || "Failed to submit review",
      color: "red",
    });
  } finally {
    isSubmitting.value = false;
  }
};

useSeoMeta({
  title: "Write a Review",
  description: "Share your experience with us",
});
</script>

<template>
  <div class="min-h-screen bg-stone-50 py-12">
    <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-serif font-bold text-stone-900">
          Write a Review
        </h1>
        <p class="mt-2 text-stone-600">
          We'd love to hear about your experience
        </p>
        <p v-if="tableCode" class="mt-1 text-sm text-stone-400">
          Table: {{ tableCode }}
        </p>
      </div>

      <UCard>
        <form class="space-y-6" @submit.prevent="submit">
          <!-- Rating -->
          <div>
            <label class="block text-sm font-medium text-stone-700 mb-3">
              Rating *
            </label>
            <div class="flex gap-2 justify-center">
              <button
                v-for="i in 5"
                :key="i"
                type="button"
                class="transition-transform hover:scale-110"
                @click="setRating(i)"
              >
                <UIcon
                  name="i-heroicons-star-solid"
                  class="w-10 h-10 transition-colors"
                  :class="
                    i <= currentRating ? 'text-amber-400' : 'text-stone-300'
                  "
                />
              </button>
            </div>
            <p class="text-center text-sm text-stone-500 mt-2">
              {{ currentRating }} out of 5 stars
            </p>
          </div>

          <!-- Name -->
          <UFormGroup label="Your Name" required>
            <UInput
              v-model="form.authorName"
              placeholder="e.g., John Doe"
              class="w-full mb-4"
              required
            />
          </UFormGroup>

          <!-- Comment -->
          <UFormGroup label="Your Review" required>
            <UTextarea
              v-model="form.comment"
              placeholder="Tell us about your experience..."
              :rows="6"
              class="w-full mb-4"
              required
            />
            <template #help>
              <span class="text-xs text-stone-400">
                Minimum 10 characters
              </span>
            </template>
          </UFormGroup>

          <!-- Submit -->
          <div class="flex gap-3">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              block
              :loading="isSubmitting"
            >
              Submit Review
            </UButton>
          </div>

          <p class="text-xs text-stone-500 text-center">
            Your review will be reviewed by our team before being published.
          </p>
        </form>
      </UCard>

      <!-- Back to Home -->
      <div class="text-center mt-8">
        <NuxtLink
          to="/"
          class="text-sm text-stone-600 hover:text-stone-900 underline"
        >
          Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
