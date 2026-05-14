function superAdminOnly(req, res, next) {
  if (req.user && req.user.email === 'outreach@ethara.ai') {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Super admin only.' });
}

module.exports = { superAdminOnly };
