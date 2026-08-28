import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  auth: true,

  branch: (branch) => {
    if (branch.isDefault) {
      return {};
    }
    if (!branch.exists) {
      return {
        ttl: "7d",
        postgres: {
          computeSettings: {
            autoscalingLimitMinCu: 0.25,
            autoscalingLimitMaxCu: 0.25,
            suspendTimeout: "5m",
          },
        },
      };
    }
    return {};
  },
});