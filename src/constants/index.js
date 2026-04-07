// User authentication states
export const USER_STATES = {
  LOGGED_OUT: 0,
  SIGNED_IN_NO_CARD: 1,
  SIGNED_IN_WITH_CARD: 2
};

// Route/view scopes — must match route meta.scope values
export const SCOPES = {
  BROWSE: 'browse',
  ACTIVE: 'active',
  REDEEMED: 'redeemed',
  CHALLENGES: 'challenges',
  AWARDS_AWAITING: 'awardsawaiting',
  EXPIRED: 'expired',
  UNREDEEMED: 'unredeemed'
};

// Sort option keys — must match the switch cases in Coupons.vue sortCoupons()
export const SORT_OPTIONS = {
  MOST_RECENT: 'Most_Recent',
  EXPIRATION: 'Expiration',
  VALUE: 'Value',
  CATEGORY: 'Category',
  RELEVANCE: 'Relevance'
};
