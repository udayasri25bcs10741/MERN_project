const listingService = require('../services/listing.service');

const createListing = async (req, res, next) => {
  try {
    const imageUrl = req.file?.path || null;
    const imagePublicId = req.file?.filename || null;
    const listing = await listingService.createListing(
      req.user._id,
      req.user.role,
      req.body,
      imageUrl,
      imagePublicId
    );
    res.status(201).json({ success: true, message: 'Listing created successfully.', data: { listing } });
  } catch (err) {
    next(err);
  }
};

const getListings = async (req, res, next) => {
  try {
    const { category, status, page, limit, sortBy, search } = req.query;
    const result = await listingService.getListings({ category, status, page, limit, sortBy, search });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getListingById = async (req, res, next) => {
  try {
    const listing = await listingService.getListingById(req.params.id, req.user || null);
    res.status(200).json({ success: true, data: { listing } });
  } catch (err) {
    next(err);
  }
};

const updateListing = async (req, res, next) => {
  try {
    const listing = await listingService.updateListing(req.params.id, req.user._id, req.body);
    res.status(200).json({ success: true, message: 'Listing updated.', data: { listing } });
  } catch (err) {
    next(err);
  }
};

const withdrawListing = async (req, res, next) => {
  try {
    const listing = await listingService.withdrawListing(req.params.id, req.user._id, req.body.reason);
    res.status(200).json({ success: true, message: 'Listing withdrawn.', data: { listing } });
  } catch (err) {
    next(err);
  }
};

const getMyListings = async (req, res, next) => {
  try {
    const result = await listingService.getMyListings(req.user._id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { createListing, getListings, getListingById, updateListing, withdrawListing, getMyListings };
