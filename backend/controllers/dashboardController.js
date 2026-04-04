import { buildDashboardMetrics } from '../services/dashboardMetricsService.js';

export const getDashboard = async (req, res) => {
  try {
    if (!req.organizationId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    const data = await buildDashboardMetrics(req.organizationId);
    return res.json({ success: true, ...data });
  } catch (e) {
    console.error('[getDashboard]', e);
    return res
      .status(500)
      .json({ success: false, error: 'Failed to load dashboard' });
  }
};
