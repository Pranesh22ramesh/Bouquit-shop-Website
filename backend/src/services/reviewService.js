const { prisma } = require('../config/prisma');
const { ApiError } = require('../utils/apiError');
const { serializeReview } = require('../utils/serializers');
const { logActivity } = require('./activityService');
const { deleteImage, uploadImage } = require('./storageService');
const { pushEventToUser } = require('./realtimeRelayService');

const listReviews = async ({ userId = null, productId = null, includeHidden = false } = {}) => {
  const reviews = await prisma.review.findMany({
    where: {
      ...(userId ? { userId } : {}),
      ...(productId ? { productId } : {}),
      ...(includeHidden ? {} : { isHidden: false }),
    },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  });
  return reviews.map(serializeReview);
};

const createReview = async (user, payload, file) => {
  const productId = payload.productId || null;
  if (productId) {
    const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
    if (!product) throw new ApiError(404, 'Product not found');
  }

  const uploadedImage = file
    ? await uploadImage({
        file,
        folder: 'reviews',
        filenameBase: payload.author || user.fullName || 'review',
      })
    : null;

  const existing = productId
    ? await prisma.review.findFirst({ where: { userId: user.id, productId } })
    : null;
  const review = existing
    ? await prisma.review.update({
        where: { id: existing.id },
        data: {
          userName: payload.author || user.fullName,
          rating: Number(payload.rating),
          comment: payload.comment,
          image: uploadedImage?.url || existing.image,
        },
      })
    : await prisma.review.create({
        data: {
          userId: user.id,
          userName: payload.author || user.fullName,
          rating: Number(payload.rating),
          comment: payload.comment,
          image: uploadedImage?.url || null,
          productId,
        },
      });

  if (existing && uploadedImage?.url && existing.image) await deleteImage(existing.image);

  await logActivity({
    userId: user.id,
    action: existing ? 'review_updated' : 'review_created',
    resourceType: 'review',
    resourceId: review.id,
    details: { rating: review.rating, productId },
  });

  pushEventToUser(user.id, 'reviews.changed', {});
  pushEventToUser(user.id, 'activities.changed', {});

  return serializeReview(review);
};

const updateReview = async (requestUser, reviewId, payload) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new ApiError(404, 'Review not found');
  if (requestUser.role !== 'ADMIN' && review.userId !== requestUser.id) {
    throw new ApiError(403, 'Not authorized to update this review');
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      userName: payload.userName || review.userName,
      rating: Number(payload.rating),
      comment: payload.comment,
      isHidden: payload.isHidden === true || payload.isHidden === 'true',
      isPinned: payload.isPinned === true || payload.isPinned === 'true',
    },
  });

  await logActivity({
    userId: requestUser.id,
    action: 'review_updated',
    resourceType: 'review',
    resourceId: reviewId,
    details: {
      rating: updated.rating,
      isHidden: updated.isHidden,
      isPinned: updated.isPinned,
    },
  });

  pushEventToUser(review.userId, 'reviews.changed', {});
  pushEventToUser(review.userId, 'activities.changed', {});

  return serializeReview(updated);
};

const deleteReview = async (requestUser, reviewId) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new ApiError(404, 'Review not found');
  if (requestUser.role !== 'ADMIN' && review.userId !== requestUser.id) {
    throw new ApiError(403, 'Not authorized to delete this review');
  }

  await prisma.review.delete({ where: { id: reviewId } });
  await deleteImage(review.image);
  await logActivity({
    userId: requestUser.id,
    action: 'review_deleted',
    resourceType: 'review',
    resourceId: reviewId,
    details: { previousOwner: review.userId },
  });

  pushEventToUser(review.userId, 'reviews.changed', {});
  pushEventToUser(review.userId, 'activities.changed', {});
};

module.exports = {
  createReview,
  deleteReview,
  listReviews,
  updateReview,
};
