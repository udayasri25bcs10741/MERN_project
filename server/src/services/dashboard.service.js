const FoodListing = require('../models/FoodListing');
const DonationRequest = require('../models/DonationRequest');
const User = require('../models/User');

const getDonorDashboard = async (donorId) => {
  // Fetch donor listing IDs once to avoid N+1 pattern
  const listingIds = await FoodListing.find({ donor: donorId }).distinct('_id');

  const [
    activeListings,
    reservedListings,
    collectedListings,
    expiredListings,
    withdrawnListings,
    pendingRequests,
    acceptedRequests,
    completedDonations,
    recentListings,
  ] = await Promise.all([
    FoodListing.countDocuments({ donor: donorId, status: 'available' }),
    FoodListing.countDocuments({ donor: donorId, status: 'reserved' }),
    FoodListing.countDocuments({ donor: donorId, status: 'collected' }),
    FoodListing.countDocuments({ donor: donorId, status: 'expired' }),
    FoodListing.countDocuments({ donor: donorId, status: 'withdrawn' }),
    DonationRequest.countDocuments({ listing: { $in: listingIds }, status: 'pending' }),
    DonationRequest.countDocuments({ listing: { $in: listingIds }, status: 'accepted' }),
    DonationRequest.countDocuments({ listing: { $in: listingIds }, status: 'completed' }),
    FoodListing.find({ donor: donorId }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  return {
    stats: {
      activeListings,
      reservedListings,
      collectedListings,
      expiredListings,
      withdrawnListings,
      pendingRequests,
      acceptedRequests,
      completedDonations,
    },
    recentListings,
  };
};

const getNGODashboard = async (ngoId) => {
  const [
    pendingRequests,
    acceptedRequests,
    completedCollections,
    disputedRequests,
    recentRequests,
    categoryBreakdown,
  ] = await Promise.all([
    DonationRequest.countDocuments({ recipient: ngoId, status: 'pending' }),
    DonationRequest.countDocuments({ recipient: ngoId, status: 'accepted' }),
    DonationRequest.countDocuments({ recipient: ngoId, status: 'completed' }),
    DonationRequest.countDocuments({ recipient: ngoId, status: 'disputed' }),
    DonationRequest.find({ recipient: ngoId })
      .populate('listing', 'title category imageUrl unit quantity collectionDeadline status')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    DonationRequest.aggregate([
      { $match: { recipient: ngoId, status: 'completed' } },
      {
        $lookup: {
          from: 'foodlistings',
          localField: 'listing',
          foreignField: '_id',
          as: 'listing',
        },
      },
      { $unwind: '$listing' },
      { $group: { _id: '$listing.category', count: { $sum: 1 } } },
    ]),
  ]);

  return {
    stats: { pendingRequests, acceptedRequests, completedCollections, disputedRequests },
    recentRequests,
    categoryBreakdown,
  };
};

const getVolunteerDashboard = async (volunteerId) => {
  const [assignedPickups, completedPickups, pendingPickups, recentPickups] = await Promise.all([
    DonationRequest.countDocuments({ assignedVolunteer: volunteerId, status: 'accepted' }),
    DonationRequest.countDocuments({ assignedVolunteer: volunteerId, status: 'completed' }),
    DonationRequest.countDocuments({
      assignedVolunteer: volunteerId,
      status: 'accepted',
      pickupStatus: 'awaiting_pickup',
    }),
    DonationRequest.find({ assignedVolunteer: volunteerId })
      .populate('listing', 'title category pickupAddress unit quantity collectionDeadline')
      .populate('recipient', 'name organizationName')
      .sort({ scheduledPickupAt: 1, createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  return {
    stats: { assignedPickups, completedPickups, pendingPickups },
    recentPickups,
  };
};

const getAdminStats = async () => {
  const [
    totalListings,
    availableListings,
    reservedListings,
    collectedListings,
    expiredListings,
    pendingRequests,
    acceptedRequests,
    completedDonations,
    disputedRequests,
    totalUsers,
    verifiedNGOs,
    pendingVerifications,
    recentListings,
    donationTrend,
    categoryDistribution,
  ] = await Promise.all([
    FoodListing.countDocuments(),
    FoodListing.countDocuments({ status: 'available' }),
    FoodListing.countDocuments({ status: 'reserved' }),
    FoodListing.countDocuments({ status: 'collected' }),
    FoodListing.countDocuments({ status: 'expired' }),
    DonationRequest.countDocuments({ status: 'pending' }),
    DonationRequest.countDocuments({ status: 'accepted' }),
    DonationRequest.countDocuments({ status: 'completed' }),
    DonationRequest.countDocuments({ status: 'disputed' }),
    User.countDocuments({ role: { $ne: 'admin' } }),
    User.countDocuments({ role: 'ngo', verificationStatus: 'approved' }),
    User.countDocuments({ verificationStatus: 'pending' }),
    FoodListing.find().sort({ createdAt: -1 }).limit(5).populate('donor', 'name organizationName role').lean(),
    // Last 30 days trend
    DonationRequest.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    FoodListing.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  return {
    stats: {
      totalListings,
      availableListings,
      reservedListings,
      collectedListings,
      expiredListings,
      pendingRequests,
      acceptedRequests,
      completedDonations,
      disputedRequests,
      totalUsers,
      verifiedNGOs,
      pendingVerifications,
    },
    recentListings,
    donationTrend,
    categoryDistribution,
  };
};

module.exports = { getDonorDashboard, getNGODashboard, getVolunteerDashboard, getAdminStats };
