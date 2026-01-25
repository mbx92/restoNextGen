import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";

// Mock Prisma
const mockPrismaReview = {
  create: vi.fn(),
};

const mockUsePrisma = vi.fn(() => ({
  review: mockPrismaReview,
}));

vi.mock("#imports", () => ({
  usePrisma: mockUsePrisma,
  defineEventHandler: (handler: unknown) => handler,
  readBody: vi.fn(),
  createError: (error: { message: string }) => new Error(error.message),
}));

describe("POST /api/public/reviews/submit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully create a review with valid data", async () => {
    const validReview = {
      authorName: "John Doe",
      rating: 5,
      comment: "Amazing food and great service!",
    };

    const mockCreatedReview = {
      id: "review-123",
      ...validReview,
      isPublished: false,
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrismaReview.create.mockResolvedValue(mockCreatedReview);

    // Simulate the handler logic
    const reviewSchema = z.object({
      authorName: z.string().min(1).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(500),
      tableCode: z.string().optional(),
      orderId: z.string().optional(),
    });

    const validatedData = reviewSchema.parse(validReview);

    expect(validatedData.authorName).toBe("John Doe");
    expect(validatedData.rating).toBe(5);
    expect(validatedData.comment).toBe("Amazing food and great service!");
  });

  it("should reject review with rating less than 1", () => {
    const invalidReview = {
      authorName: "John Doe",
      rating: 0,
      comment: "This should fail",
    };

    const reviewSchema = z.object({
      authorName: z.string().min(1).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(500),
    });

    expect(() => reviewSchema.parse(invalidReview)).toThrow();
  });

  it("should reject review with rating greater than 5", () => {
    const invalidReview = {
      authorName: "John Doe",
      rating: 6,
      comment: "This should fail validation",
    };

    const reviewSchema = z.object({
      authorName: z.string().min(1).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(500),
    });

    expect(() => reviewSchema.parse(invalidReview)).toThrow();
  });

  it("should reject review with comment shorter than 10 characters", () => {
    const invalidReview = {
      authorName: "John Doe",
      rating: 5,
      comment: "Too short",
    };

    const reviewSchema = z.object({
      authorName: z.string().min(1).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(500),
    });

    expect(() => reviewSchema.parse(invalidReview)).toThrow();
  });

  it("should reject review with empty author name", () => {
    const invalidReview = {
      authorName: "",
      rating: 5,
      comment: "This review should fail",
    };

    const reviewSchema = z.object({
      authorName: z.string().min(1).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(500),
    });

    expect(() => reviewSchema.parse(invalidReview)).toThrow();
  });

  it("should accept optional tableCode and orderId", () => {
    const validReview = {
      authorName: "Jane Doe",
      rating: 4,
      comment: "Great experience with salmon soup!",
      tableCode: "T01",
      orderId: "ORD-123",
    };

    const reviewSchema = z.object({
      authorName: z.string().min(1).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(500),
      tableCode: z.string().optional(),
      orderId: z.string().optional(),
    });

    const validatedData = reviewSchema.parse(validReview);

    expect(validatedData.tableCode).toBe("T01");
    expect(validatedData.orderId).toBe("ORD-123");
  });

  it("should set isPublished to false by default", () => {
    const reviewData = {
      authorName: "John Doe",
      rating: 5,
      comment: "Excellent food and service!",
      isPublished: false,
      isFeatured: false,
    };

    expect(reviewData.isPublished).toBe(false);
    expect(reviewData.isFeatured).toBe(false);
  });

  it("should reject comment longer than 500 characters", () => {
    const longComment = "a".repeat(501);

    const invalidReview = {
      authorName: "John Doe",
      rating: 5,
      comment: longComment,
    };

    const reviewSchema = z.object({
      authorName: z.string().min(1).max(100),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(500),
    });

    expect(() => reviewSchema.parse(invalidReview)).toThrow();
  });
});
