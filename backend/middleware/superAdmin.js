const SUPER_ADMINS = ['outreach@ethara.ai', 'harsh.kumarint17@ethara.ai'];

function superAdminOnly(req, res, next) {
  if (req.user && SUPER_ADMINS.includes(req.user.email)) {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Super admin only.' });
}

module.exports = { superAdminOnly, SUPER_ADMINS };
