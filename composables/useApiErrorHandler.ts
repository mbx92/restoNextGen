/**
 * Composable for handling API errors with special handling for plan limits
 */

export const useApiErrorHandler = () => {
  const toast = useToast();
  const router = useRouter();

  /**
   * Handle API errors with smart routing for limit exceeded
   */
  const handleError = (error: any, options?: { showToast?: boolean }) => {
    const showToast = options?.showToast ?? true;

    // Plan limit exceeded (403)
    if (error.statusCode === 403 && error.statusMessage?.includes("limit")) {
      if (showToast) {
        toast.add({
          title: "Plan Limit Exceeded",
          description: error.statusMessage,
          color: "error",
          timeout: 8000,
          actions: [
            {
              label: "View Usage",
              click: () => {
                router.push("/admin#usage");
              },
            },
            {
              label: "Upgrade Plan",
              click: () => {
                router.push("/admin/settings#subscription");
              },
            },
          ],
        });
      }
      return { type: "LIMIT_EXCEEDED", message: error.statusMessage };
    }

    // Unauthorized (401)
    if (error.statusCode === 401) {
      if (showToast) {
        toast.add({
          title: "Authentication Required",
          description: "Please log in to continue",
          color: "error",
        });
      }
      router.push("/login");
      return { type: "UNAUTHORIZED", message: "Not authenticated" };
    }

    // Forbidden (403 - general)
    if (error.statusCode === 403) {
      if (showToast) {
        toast.add({
          title: "Access Denied",
          description:
            error.statusMessage || "You don't have permission for this action",
          color: "error",
        });
      }
      return { type: "FORBIDDEN", message: error.statusMessage };
    }

    // Validation error (400)
    if (error.statusCode === 400) {
      if (showToast) {
        toast.add({
          title: "Validation Error",
          description: error.statusMessage || "Please check your input",
          color: "error",
        });
      }
      return { type: "VALIDATION", message: error.statusMessage };
    }

    // Not found (404)
    if (error.statusCode === 404) {
      if (showToast) {
        toast.add({
          title: "Not Found",
          description: error.statusMessage || "Resource not found",
          color: "error",
        });
      }
      return { type: "NOT_FOUND", message: error.statusMessage };
    }

    // Server error (500)
    if (error.statusCode >= 500) {
      if (showToast) {
        toast.add({
          title: "Server Error",
          description: "Something went wrong. Please try again later.",
          color: "error",
        });
      }
      return { type: "SERVER_ERROR", message: "Internal server error" };
    }

    // Generic error
    if (showToast) {
      toast.add({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        color: "error",
      });
    }
    return { type: "GENERIC", message: error.message };
  };

  /**
   * Wrapper for $fetch with automatic error handling
   */
  const safeFetch = async <T>(
    url: string,
    options?: any,
  ): Promise<{ data: T | null; error: any | null }> => {
    try {
      const data = await $fetch<T>(url, options);
      return { data, error: null };
    } catch (error) {
      const handledError = handleError(error);
      return { data: null, error: handledError };
    }
  };

  /**
   * Check if error is a limit exceeded error
   */
  const isLimitExceeded = (error: any): boolean => {
    return (
      error?.statusCode === 403 &&
      error?.statusMessage?.toLowerCase().includes("limit")
    );
  };

  return {
    handleError,
    safeFetch,
    isLimitExceeded,
  };
};
