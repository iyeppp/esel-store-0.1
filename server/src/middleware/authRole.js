// Simple role-based middleware for admin endpoints.
// This implementation reads role from the `x-admin-role` header
// with allowed values: "owner", "admin", "ordersAdmin".
// In a real system you would derive this from a JWT or session.

const getRoleFromRequest = (req) => {
  const header = req.headers["x-admin-role"];
  if (!header || typeof header !== "string") return null;
  const role = header.toLowerCase();
  if (["owner", "admin", "ordersadmin"].includes(role)) {
    return role === "ordersadmin" ? "ordersAdmin" : role;
  }
  return null;
};

const requireFullAdmin = (req, res, next) => {
  const role = getRoleFromRequest(req);
  if (role === "owner" || role === "admin") {
    req.adminRole = role;
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Full admin access required.",
  });
};

const requireOrdersAdmin = (req, res, next) => {
  const role = getRoleFromRequest(req);
  if (role === "owner" || role === "admin" || role === "ordersAdmin") {
    req.adminRole = role;
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Orders admin access required.",
  });
};

module.exports = {
  getRoleFromRequest,
  requireFullAdmin,
  requireOrdersAdmin,
};
