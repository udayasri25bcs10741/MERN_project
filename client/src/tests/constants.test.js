import { describe, it, expect } from 'vitest';
import {
  ROLES,
  ROLE_LABELS,
  CATEGORIES,
  UNITS,
  LISTING_STATUSES,
  LISTING_STATUS_CONFIG,
  REQUEST_STATUSES,
  PICKUP_STATUSES,
  PICKUP_STATUS_CONFIG,
} from '../utils/constants';

describe('Frontend Constants & Enums', () => {
  it('should define all user roles and matching readable labels', () => {
    expect(ROLES.HOUSEHOLD_DONOR).toBe('household_donor');
    expect(ROLES.ORGANIZATION_DONOR).toBe('organization_donor');
    expect(ROLES.NGO).toBe('ngo');
    expect(ROLES.VOLUNTEER).toBe('volunteer');
    expect(ROLES.ADMIN).toBe('admin');

    expect(ROLE_LABELS[ROLES.HOUSEHOLD_DONOR]).toBe('Household Donor');
    expect(ROLE_LABELS[ROLES.NGO]).toBe('NGO / Food Bank');
    expect(ROLE_LABELS[ROLES.VOLUNTEER]).toBe('Volunteer Courier');
  });

  it('should define surplus food categories and units with valid icons and values', () => {
    expect(CATEGORIES.length).toBeGreaterThanOrEqual(6);
    const categoryValues = CATEGORIES.map((c) => c.value);
    expect(categoryValues).toContain('cooked_meals');
    expect(categoryValues).toContain('bakery');
    expect(categoryValues).toContain('packaged_food');
    expect(categoryValues).toContain('fruits_vegetables');

    const unitValues = UNITS.map((u) => u.value);
    expect(unitValues).toContain('meals');
    expect(unitValues).toContain('kilograms');
    expect(unitValues).toContain('boxes');
  });

  it('should include correct listing statuses and styling configurations', () => {
    expect(LISTING_STATUSES.AVAILABLE).toBe('available');
    expect(LISTING_STATUSES.RESERVED).toBe('reserved');
    expect(LISTING_STATUSES.COLLECTED).toBe('collected');
    expect(LISTING_STATUSES.EXPIRED).toBe('expired');

    expect(LISTING_STATUS_CONFIG.available.label).toBe('Available');
    expect(LISTING_STATUS_CONFIG.expired.color).toContain('bg-red-100');
  });

  it('should include correct request and pickup lifecycle states', () => {
    expect(REQUEST_STATUSES.PENDING).toBe('pending');
    expect(REQUEST_STATUSES.ACCEPTED).toBe('accepted');
    expect(REQUEST_STATUSES.REJECTED).toBe('rejected');
    expect(REQUEST_STATUSES.CANCELLED).toBe('cancelled');

    expect(PICKUP_STATUSES.NOT_SCHEDULED).toBe('not_scheduled');
    expect(PICKUP_STATUSES.SCHEDULED).toBe('scheduled');
    expect(PICKUP_STATUSES.IN_PROGRESS).toBe('in_progress');
    expect(PICKUP_STATUSES.COMPLETED).toBe('completed');
    expect(PICKUP_STATUS_CONFIG.completed.label).toBe('Delivered');
  });
});
