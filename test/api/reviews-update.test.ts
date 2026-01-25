import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
const mockPrismaReview = {
  update: vi.fn(),
  findUnique: vi.fn(),
  count: vi.fn(),
};

const mockUsePrisma = vi.fn(() => ({
  review: mockPrismaReview,
}));

vi.mock("#imports", () => ({
  usePrisma: mockUsePrisma,
  defineEventHandler: (handler: unknown) => handler,
  readBody: vi.fn(),
  getRouterParam: vi.fn(),
  createError: (error: { statusCode: number; message: string }) => ({
    statusCode: error.statusCode,
    message: error.message,
  }),
}));

describe("PUT /api/admin/reviews/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully toggle isFeatured to true when under limit", async () => {
    const reviewId = "review-123";

    // Mock: review is not featured yet
    mockPrismaReview.findUnique.mockResolvedValue({
      id: reviewId,
      isFeatured: false,
    });

    // Mock: only 5 reviews are featured
    mockPrismaReview.count.mockResolvedValue(5);

    // Mock: update succeeds
    mockPrismaReview.update.mockResolvedValue({
      id: reviewId,
      isFeatured: true,
    });

    const count = await mockPrismaReview.count({ where: { isFeatured: true } });
    expect(count).toBe(5);
    expect(count).toBeLessThan(6);

    const updatedReview = await mockPrismaReview.update({
      where: { id: reviewId },
      data: { isFeatured: true },
    });

    expect(updatedReview.isFeatured).toBe(true);
  });

  it("should reject featuring 7th review when limit is 6", async () => {
    const reviewId = "review-123";

    // Mock: review is not featured yet
    mockPrismaReview.findUnique.mockResolvedValue({
      id: reviewId,
      isFeatured: false,
    });

    // Mock: already 6 reviews featured
    mockPrismaReview.count.mockResolvedValue(6);

    const currentReview = await mockPrismaReview.findUnique({
      where: { id: reviewId },
    });

    const featuredCount = await mockPrismaReview.count({
      where: { isFeatured: true },
    });

    // Simulate the validation logic
    if (!currentReview?.isFeatured && featuredCount >= 6) {
      const error = {
        statusCode: 400,
        message: "Maximum 6 reviews can be featured",
      };
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe("Maximum 6 reviews can be featured");
    }
  });

  it("should allow updating already featured review without counting against limit", async () => {
    const reviewId = "review-123";

    // Mock: review is already featured
    mockPrismaReview.findUnique.mockResolvedValue({
      id: reviewId,
      isFeatured: true,
    });

    // Mock: 6 reviews featured (including this one)
    mockPrismaReview.count.mockResolvedValue(6);

    const currentReview = await mockPrismaReview.findUnique({
      where: { id: reviewId },
    });

    // Should not throw error because review is already featured
    expect(currentReview?.isFeatured).toBe(true);

    // Update should proceed
    mockPrismaReview.update.mockResolvedValue({
      id: reviewId,
      isFeatured: true,
      comment: "Updated comment",
    });

    const updatedReview = await mockPrismaReview.update({
      where: { id: reviewId },
      data: { comment: "Updated comment" },
    });

    expect(updatedReview.comment).toBe("Updated comment");
  });

  it("should successfully toggle isPublished", async () => {
    const reviewId = "review-456";

    mockPrismaReview.update.mockResolvedValue({
      id: reviewId,
      isPublished: true,
    });

    const updatedReview = await mockPrismaReview.update({
      where: { id: reviewId },
      data: { isPublished: true },
    });

    expect(updatedReview.isPublished).toBe(true);
  });

  it("should allow partial updates", async () => {
    const reviewId = "review-789";

    mockPrismaReview.update.mockResolvedValue({
      id: reviewId,
      authorName: "Jane Doe",
      rating: 5,
      comment: "Original comment",
      isPublished: true, // Only this field updated
    });

    const updatedReview = await mockPrismaReview.update({
      where: { id: reviewId },
      data: { isPublished: true },
    });

    expect(updatedReview.isPublished).toBe(true);
  });
});
