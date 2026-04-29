const plannedFeaturePayload = {
  notifications: {
    feature: "notifications",
    status: "planned",
    title: "Real-time notifications",
    summary:
      "This reserved API will expose session join alerts, new session announcements, and inbox-style updates.",
  },
  restaurants: {
    feature: "restaurants",
    status: "planned",
    title: "Restaurant offers",
    summary:
      "This reserved API will expose partner restaurant promotions, discounts, and featured listings.",
  },
  history: {
    feature: "history",
    status: "planned",
    title: "Meal history",
    summary:
      "This reserved API will expose the user's hosted and joined session history after the MVP.",
  },
  rewards: {
    feature: "rewards",
    status: "planned",
    title: "Rewards and points",
    summary:
      "This reserved API will expose participation points, milestones, and future reward redemptions.",
  },
};

export const getNotificationsPlaceholder = (req: any, res: any) => {
  res.json(plannedFeaturePayload.notifications);
};

export const getRestaurantsPlaceholder = (req: any, res: any) => {
  res.json(plannedFeaturePayload.restaurants);
};

export const getHistoryPlaceholder = (req: any, res: any) => {
  res.json(plannedFeaturePayload.history);
};

export const getRewardsPlaceholder = (req: any, res: any) => {
  res.json(plannedFeaturePayload.rewards);
};
