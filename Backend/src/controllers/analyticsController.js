const Order = require('../models/Order');
const Payout = require('../models/Payout');

// ─── Get Analytics for a Restaurant ─────────────────────────────────────────
exports.getAnalytics = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (req.user.restaurantId !== restaurantId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const allOrders = await Order.find({ restaurantId }).lean();
    const completedOrders = allOrders.filter((o) => o.status === 'completed');

    const grossRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const netRevenue = grossRevenue * 0.9;

    const payouts = await Payout.find({ restaurantId }).lean();
    const totalPaidOut = payouts.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayout = Math.max(0, netRevenue - totalPaidOut);

    // Orders per day for last 7 days
    const now = new Date();
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);

      const dayOrders = completedOrders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= day && d < nextDay;
      });
      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

      dailyStats.push({
        date: day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: parseFloat(dayRevenue.toFixed(2)),
      });
    }

    res.json({
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
      grossRevenue: parseFloat(grossRevenue.toFixed(2)),
      netRevenue: parseFloat(netRevenue.toFixed(2)),
      pendingPayout: parseFloat(pendingPayout.toFixed(2)),
      totalPaidOut: parseFloat(totalPaidOut.toFixed(2)),
      dailyStats,
      recentPayouts: payouts.slice(-5).reverse(),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Process Payout ───────────────────────────────────────────────────────────
exports.processPayout = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;

    if (req.user.restaurantId !== restaurantId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Recalculate pending payout
    const completedOrders = await Order.find({ restaurantId, status: 'completed' }).lean();
    const grossRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const netRevenue = grossRevenue * 0.9;

    const payouts = await Payout.find({ restaurantId }).lean();
    const totalPaidOut = payouts.reduce((sum, p) => sum + p.amount, 0);
    const pendingPayout = parseFloat((netRevenue - totalPaidOut).toFixed(2));

    if (pendingPayout <= 0) {
      return res.status(400).json({ error: 'No pending payout available' });
    }

    const payout = await Payout.create({
      restaurantId,
      amount: pendingPayout,
      note: `Payout processed on ${new Date().toLocaleDateString()}`,
    });

    res.status(201).json({ message: 'Payout processed successfully', payout });
  } catch (err) {
    next(err);
  }
};
